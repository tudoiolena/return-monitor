import type {
  Customer,
  Order,
  Refund,
  Return,
  Setting,
  Shop,
} from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { unauthenticated } from "app/shopify.server";

type CustomerWithOrders = Customer & {
  orders: (Order & {
    refunds: Refund[];
    returns: Return[];
  })[];
};

const prisma = new PrismaClient();

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

    const shop = await prisma.shop.findFirst({ where: { id: setting.shopId } });

    const suspiciousCustomers: string[] = [];

    for (const customer of customers) {
      const isSuspicious = calculateSuspicion(customer, setting);

      if (isSuspicious) {
        const customerShopifyId = customer.shopifyId.split("/").pop();
        console.log("customer.shopifyId", customerShopifyId);
        if (customerShopifyId) {
          suspiciousCustomers.push(customerShopifyId);
        }
      }
    }

    if (suspiciousCustomers.length > 0) {
      await updateShopifyMetafield(suspiciousCustomers, shop!);
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
  suspiciousCustomers: string[],
  shop: Shop,
) {
  const {
    admin: { graphql },
  } = await unauthenticated.admin(shop.domain);

  const shopDetailsQuery = `
  {
    shop {
      id
    }
  }
`;

  const shopDetailsResponse = await graphql(shopDetailsQuery);
  const shopData = await shopDetailsResponse.json();
  const shopId = shopData.data.shop.id;

  const serializedSuspiciousCustomers =
    `[` + suspiciousCustomers.map((id) => `\\"${id}\\"`).join(",") + `]`;

  const mutation = `
    mutation {
      metafieldsSet(metafields: [
        {
          namespace: "custom_data",
          key: "isCustomerSuspicious",
          value: "${serializedSuspiciousCustomers}",
          type: "list.single_line_text_field",
          ownerId: "${shopId}"
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

  const result = await graphql(mutation);
  const data = await result.json();

  if (result.ok) {
    console.log("Metafield updated successfully:", data.data.metafieldsSet);
  } else {
    throw new Error(JSON.stringify(data));
  }
}

checkAndUpdateCustomerSuspicion().catch(console.error);
