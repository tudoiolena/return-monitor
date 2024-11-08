import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getAdminContext } from "app/shopify.server";

export const settingsLoader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const adminContext = await getAdminContext(request);
  const shopDomain = adminContext.session.shop;
  const shopRecord = await prisma.shop.findUnique({
    where: { domain: shopDomain },
  });

  if (!shopRecord) {
    throw new Error(`Shop not found for domain: ${shopRecord}`);
  }

  const settings = await prisma.setting.findUnique({
    where: { shopId: shopRecord.id },
  });

  if (!settings) {
    throw new Error("Settings not found for the shop");
  }

  return { settings };
};
