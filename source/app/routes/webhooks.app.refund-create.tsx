import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, unauthenticated } from "../shopify.server";

type RefundLineItem = {
  subtotal_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  processRefund(shop, payload).catch(console.error);
  return new Response();
};

const processRefund = async (shop: string, payload: any) => {
  const shopifyId = payload.admin_graphql_api_id;
  const shopifyOrderId = payload.order_id;
  const refundCurrency = payload.total_duties_set.shop_money.currency_code;
  const totalRefunded = payload.refund_line_items.reduce(
    (total: number, item: RefundLineItem) => {
      return total + parseFloat(item.subtotal_set.shop_money.amount);
    },
    0,
  );

  const shopRecord = await prisma.shop.findUnique({
    where: { domain: shop },
  });

  if (!shopRecord) {
    throw new Error(`Shop not found for domain: ${shop}`);
  }

  const orderStatuses = await getOrderStatuses(shop, shopifyOrderId);

  const existingOrder = await prisma.order.upsert({
    where: {
      shopifyId: `gid://shopify/Order/${shopifyOrderId}`,
      shopId: shopRecord.id,
    },
    update: {
      refundStatus: orderStatuses.displayFinancialStatus,
      returnStatus: orderStatuses.returnStatus,
    },
    create: {
      shopifyId: `gid://shopify/Order/${shopifyOrderId}`,
      shopId: shopRecord.id,
      refundStatus: orderStatuses.displayFinancialStatus,
      returnStatus: orderStatuses.returnStatus,
    },
  });

  const existingReturn = await prisma.refund.findFirst({
    where: {
      shopifyId,
      shopId: shopRecord.id,
    },
  });

  if (!existingReturn) {
    await prisma.refund.create({
      data: {
        shopifyId,
        shopId: shopRecord.id,
        orderId: existingOrder.id,
        totalRefunded,
        refundCurrency,
      },
    });
  }
};

const getOrderStatuses = async (shop: string, orderId: string) => {
  const {
    admin: { graphql },
  } = await unauthenticated.admin(shop);

  const query = `
    {
      order(id: "gid://shopify/Order/${orderId}") {
        returnStatus
        displayFinancialStatus
      }
    }
  `;
  const response = await graphql(query);
  const body = await response.json();
  return body.data.order;
};
