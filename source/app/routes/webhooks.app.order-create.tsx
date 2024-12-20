import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  processOrder(shop, payload).catch(console.error);
  return new Response();
};

const processOrder = async (shop: string, payload: any) => {
  const shopifyOrderId = payload.id;
  const totalCost = payload.total_price;
  const currency = payload.currency;
  const customerData = payload.customer;

  const shopRecord = await prisma.shop.findUnique({
    where: { domain: shop },
  });

  console.log("shopRecord", shopRecord);

  if (!shopRecord) {
    throw new Error(`Shop not found for domain: ${shop}`);
  }

  const customer = await prisma.customer.upsert({
    where: { shopifyId: `gid://shopify/Customer/${customerData.id}` },
    create: {
      shopifyId: `gid://shopify/Customer/${customerData.id}`,
      firstName: customerData.firstName ?? "Unknown",
      lastName: customerData.lastName ?? "Unknown",
      email: customerData.email || "",
      shop: { connect: { id: shopRecord.id } },
    },
    update: {
      firstName: customerData.firstName ?? "Unknown",
      lastName: customerData.lastName ?? "Unknown",
      email: customerData.email || "",
    },
  });

  const existingOrder = await prisma.order.findFirst({
    where: {
      shopifyId: `gid://shopify/Order/${shopifyOrderId}`,
      shopId: shopRecord.id,
    },
  });

  if (!existingOrder) {
    await prisma.order.create({
      data: {
        shopifyId: `gid://shopify/Order/${shopifyOrderId}`,
        totalCost,
        currency,
        shopId: shopRecord.id,
        customerId: customer.id,
      },
    });
  }

  await prisma.flag.upsert({
    where: { shopId: shopRecord.id },
    create: { shopId: shopRecord.id, shouldSuspiciousBeUpdated: true },
    update: { shouldSuspiciousBeUpdated: true },
  });
};
