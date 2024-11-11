import { redirect } from "@remix-run/node";
import { AdminNavigation } from "app/constants/navigation";
import {
  DEFAULT_RANGE_VALUE,
  DEFAULT_SUSPICIOUS_RANGE_VALUE,
  DEFAULT_SUSPICIOUS_RETURN_VALUE,
} from "app/routes/app.report-settings";
import { getAdminContext } from "app/shopify.server";

export const action = async ({ request }: { request: Request }) => {
  const adminContext = await getAdminContext(request);

  const shopDomain = adminContext.session.shop;

  const shopRecord = await prisma.shop.findUnique({
    where: { domain: shopDomain },
  });

  if (!shopRecord) {
    throw new Error(`Shop not found for domain: ${shopRecord}`);
  }

  const formData = await request.formData();

  const isReturnStatus = formData.get("isReturnStatus") === "true";
  const isRefundStatus = formData.get("isRefundEnabled") === "true";
  const isPartiallyRefundedStatus =
    formData.get("isPartiallyRefundedEnabled") === "true";
  const suspiciousReturnAmount =
    Number(formData.get("suspiciousReturnAmount")) ||
    DEFAULT_SUSPICIOUS_RETURN_VALUE;
  const partialRefundPercentage =
    Number(formData.get("partialRefundPercentage")) || DEFAULT_RANGE_VALUE;
  const suspiciousReturnPercentage =
    Number(formData.get("suspiciousReturnPercentage")) ||
    DEFAULT_SUSPICIOUS_RANGE_VALUE;

  const currentSetting = await prisma.setting.findUnique({
    where: { shopId: shopRecord.id },
  });

  const shouldUpdateSuspicionCheck =
    currentSetting?.suspiciousReturnPercentage !== suspiciousReturnPercentage ||
    currentSetting?.suspiciousReturnAmount !== suspiciousReturnAmount;

  await prisma.setting.upsert({
    where: { shopId: shopRecord.id },
    create: {
      shopId: shopRecord.id,
      isReturnStatus,
      isRefundStatus,
      isPartiallyRefundedStatus,
      partialRefundPercentage,
      suspiciousReturnPercentage,
      suspiciousReturnAmount,
    },
    update: {
      isReturnStatus,
      isRefundStatus,
      isPartiallyRefundedStatus,
      partialRefundPercentage,
      suspiciousReturnPercentage,
      suspiciousReturnAmount,
    },
  });

  if (shouldUpdateSuspicionCheck) {
    await prisma.flag.upsert({
      where: { shopId: shopRecord.id },
      create: { shopId: shopRecord.id, shouldSuspiciousBeUpdated: true },
      update: { shouldSuspiciousBeUpdated: true },
    });
  }

  return redirect(AdminNavigation.report);
};
