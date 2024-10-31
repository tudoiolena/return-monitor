import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  processReturn(shop, payload).catch(console.error);
  return new Response();
};

const processReturn = async (shop: string, payload: any) => {
  const shopifyId = payload.admin_graphql_api_id;
  const shopifyOrderId = payload.order_id;

  const shopRecord = await prisma.shop.findUnique({
    where: { domain: shop },
  });

  if (!shopRecord) {
    throw new Error(`Shop not found for domain: ${shop}`);
  }

  let existingOrder = await prisma.order.findFirst({
    where: {
      shopifyId: `gid://shopify/Order/${shopifyOrderId}`,
      shopId: shopRecord.id,
    },
  });

  if (!existingOrder) {
    existingOrder = await prisma.order.create({
      data: {
        shopifyId: `gid://shopify/Order/${shopifyOrderId}`,
        shopId: shopRecord.id,
        returnStatus: "RETURNED",
      },
    });
  }

  const existingReturn = await prisma.return.findFirst({
    where: {
      shopifyId,
      shopId: shopRecord.id,
    },
  });

  if (!existingReturn) {
    await prisma.return.create({
      data: {
        shopifyId,
        shopId: shopRecord.id,
        orderId: existingOrder.id,
      },
    });
  }
};
