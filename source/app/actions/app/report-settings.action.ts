import { redirect } from "@remix-run/node";
import { AdminNavigation } from "app/constants/navigation";
import {
  DEFAULT_RANGE_VALUE,
  DEFAULT_SUSPICIOUS_RANGE_VALUE,
  DEFAULT_SUSPICIOUS_RETURN_VALUE,
} from "app/routes/app.report-settings";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: { request: Request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const shopRecord = await prisma.shop.findUnique({
    where: { domain: shop },
  });

  if (!shopRecord) {
    throw new Error(`Shop not found for domain: ${shop}`);
  }

  const formData = await request.formData();

  const isReturnStatus = formData.get("isReturnStatus") === "true";
  const isRefundStatus = formData.get("isRefundEnabled") === "true";
  const isPartiallyRefundedStatus =
    formData.get("isPartiallyRefundedEnabled") === "true";
  const partialRefundPercentage =
    parseInt(formData.get(":rb:") as string, 10) || DEFAULT_RANGE_VALUE;
  const suspiciousReturnPercentage =
    parseInt(formData.get(":rd:") as string, 10) ||
    DEFAULT_SUSPICIOUS_RANGE_VALUE;
  const suspiciousReturnAmount =
    Number(formData.get("suspiciousReturnAmount")) ||
    DEFAULT_SUSPICIOUS_RETURN_VALUE;

  await prisma.setting.upsert({
    where: { shopId: shopRecord.id },
    update: {
      isReturnStatus,
      isRefundStatus,
      isPartiallyRefundedStatus,
      partialRefundPercentage,
      suspiciousReturnPercentage,
      suspiciousReturnAmount,
    },
    create: {
      shopId: shopRecord.id,
      isReturnStatus,
      isRefundStatus,
      isPartiallyRefundedStatus,
      partialRefundPercentage,
      suspiciousReturnPercentage,
      suspiciousReturnAmount,
    },
  });

  return redirect(AdminNavigation.report);
};
