import { json } from "@remix-run/node";
import { DEFAULT_RANGE_VALUE } from "app/routes/app.report-settings";
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
    parseInt(formData.get(":r1:") as string, 10) || DEFAULT_RANGE_VALUE;

  await prisma.setting.upsert({
    where: { shopId: shopRecord.id },
    update: {
      isReturnStatus,
      isRefundStatus,
      isPartiallyRefundedStatus,
      partialRefundPercentage,
    },
    create: {
      shopId: shopRecord.id,
      isReturnStatus,
      isRefundStatus,
      isPartiallyRefundedStatus,
      partialRefundPercentage,
    },
  });

  return json({ success: true });
};
