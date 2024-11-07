import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const settingsLoader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const shopRecord = await prisma.shop.findUnique({
    where: { domain: shop },
  });

  if (!shopRecord) {
    throw new Error(`Shop not found for domain: ${shop}`);
  }

  const settings = await prisma.setting.findUnique({
    where: { shopId: shopRecord.id },
    select: {
      isReturnStatus: true,
      isRefundStatus: true,
      isPartiallyRefundedStatus: true,
    },
  });

  if (!settings) {
    throw new Error("Settings not found for the shop");
  }

  return { settings };
};
