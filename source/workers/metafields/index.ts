import type { Customer, Order, Refund, Return, Setting } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

type CustomerWithOrders = Customer & {
  orders: (Order & {
    refunds: Refund[];
    returns: Return[];
  })[];
};

const prisma = new PrismaClient();

const SHOPIFY_SHOP = "app-tutorial-test.myshopify.com";
const ACCESS_TOKEN = "shpua_b5417b0f2def50ac2cfefa67fcfcce49";

async function checkAndUpdateCustomerSuspicion() {
  const settings = await prisma.setting.findMany();

  for (const setting of settings) {
    const customers = await prisma.customer.findMany({
      where: { shopId: setting.shopId },
      include: {
        orders: {
          include: { refunds: true, returns: true },
        },
      },
    });

    for (const customer of customers) {
      const isSuspicious = calculateSuspicion(customer, setting);

      console.log("customer.shopifyId", customer.shopifyId);
      console.log("isSuspicious", isSuspicious);
      await updateShopifyMetafield(customer.shopifyId, isSuspicious);
    }
  }
}

function calculateSuspicion(customer: CustomerWithOrders, setting: Setting) {
  const totalOrders = customer.orders.length;
  const totalReturns = customer.orders.filter(
    (order) => order.returns.length > 0,
  ).length;

  const returnRate = (totalReturns / totalOrders) * 100;
  const refundAmount = customer.orders.reduce(
    (sum, order) =>
      sum +
      order.refunds.reduce(
        (orderSum, refund) => orderSum + Number(refund.totalRefunded),
        0,
      ),
    0,
  );

  return (
    returnRate >= setting.suspiciousReturnPercentage ||
    refundAmount >= setting.suspiciousReturnAmount
  );
}

async function updateShopifyMetafield(
  customerShopifyId: string,
  isSuspicious: boolean,
) {
  const query = `
    mutation {
      metafieldsSet(metafields: [
        {
          namespace: "custom_data",
          key: "isCustomerSuspicious",
          value: "${isSuspicious}",
          type: "boolean",
          ownerId: "${customerShopifyId}"
        }
      ]) {
        userErrors {
          field
          message
        }
        metafields {
          id
          namespace
          key
          value
        }
      }
    }
  `;

  const response = await fetch(
    `https://${SHOPIFY_SHOP}/admin/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    },
  );

  const data = await response.json();
  if (data.errors) {
    console.error("Failed to update metafield:", data.errors);
  } else {
    console.log(
      "Metafield updated successfully:",
      data.data.metafieldsSet.metafields,
    );
  }
}

checkAndUpdateCustomerSuspicion().catch(console.error);
