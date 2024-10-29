import { $Enums, type SyncOrdersTask } from "@prisma/client";
import * as fs from "fs";
import readline from "readline";

export const processResult = async (task: SyncOrdersTask) => {
  await prisma.syncOrdersTask.update({
    where: { id: task.id },
    data: {
      retryCount: { increment: 1 },
      inProgress: true,
      updatedAt: new Date(),
    },
  });

  const shop = await prisma.shop.findFirst({ where: { id: task.shopId } });
  if (!shop) {
    await prisma.syncOrdersTask.update({
      where: { id: task.id },
      data: {
        retryCount: { increment: 1 },
        inProgress: false,
        updatedAt: new Date(),
        error: "Shop not found",
      },
    });
    return;
  }

  try {
    const filePath = task.data as string; // Assuming task.data is the file path
    console.log("filePath", filePath);

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const data = JSON.parse(line);

      if (data.id.startsWith("gid://shopify/Order")) {
        await handleOrder(data);
      } else if (data.id.startsWith("gid://shopify/Refund")) {
        await handleRefund(data);
      } else if (data.id.startsWith("gid://shopify/Return")) {
        await handleReturn(data);
      }
    }

    await prisma.syncOrdersTask.update({
      where: { id: task.id },
      data: {
        stage: $Enums.SyncOrdersTaskStage.FINISH,
        inProgress: false,
        updatedAt: new Date(),
      },
    });
  } catch (e) {
    await prisma.syncOrdersTask.update({
      where: { id: task.id },
      data: {
        retryCount: { increment: 1 },
        inProgress: false,
        updatedAt: new Date(),
        error: e.message,
      },
    });
  }

  async function handleOrder(data: any) {
    const shopifyId = data.id;
    const totalCost = parseFloat(data.totalPriceSet.shopMoney.amount);
    const currency = data.totalPriceSet.shopMoney.currencyCode;

    // Handle customer information
    const customerData = data.customer;
    const customer = await prisma.customer.upsert({
      where: { shopifyId: customerData.id },
      update: {
        firstName: customerData.firstName ?? "Unknown",
        lastName: customerData.lastName,
        email: customerData.email,
      },
      create: {
        shopifyId: customerData.id,
        firstName: customerData.firstName ?? "Unknown",
        lastName: customerData.lastName,
        email: customerData.email,
      },
    });

    // Upsert the order (create if not exists, update if exists)
    await prisma.order.upsert({
      where: { shopifyId },
      update: {
        totalCost,
        currency,
        customerId: customer.id,
      },
      create: {
        shopifyId,
        totalCost,
        currency,
        customerId: customer.id,
      },
    });

    // Process refunds
    for (const refund of data.refunds) {
      await handleRefund({
        ...refund,
        __parentId: shopifyId,
      });
    }
  }

  async function handleRefund(data: any) {
    const shopifyId = data.id;
    const totalRefunded = parseFloat(data.totalRefundedSet.shopMoney.amount);
    const refundCurrency = data.totalRefundedSet.shopMoney.currencyCode;
    const parentOrderShopifyId = data.__parentId;

    const order = await prisma.order.findUnique({
      where: { shopifyId: parentOrderShopifyId },
    });

    if (order) {
      // Upsert the refund (create if not exists, update if exists)
      await prisma.refund.upsert({
        where: { shopifyId },
        update: {
          totalRefunded,
          refundCurrency,
          orderId: order.id,
        },
        create: {
          shopifyId,
          refundId: shopifyId,
          totalRefunded,
          refundCurrency,
          orderId: order.id,
        },
      });
    }
  }

  async function handleReturn(data: any) {
    const shopifyId = data.id;
    const parentOrderShopifyId = data.__parentId;

    const order = await prisma.order.findUnique({
      where: { shopifyId: parentOrderShopifyId },
    });

    if (order) {
      // Upsert the return (create if not exists, update if exists)
      await prisma.return.upsert({
        where: { shopifyId },
        update: {
          orderId: order.id,
        },
        create: {
          shopifyId,
          returnId: shopifyId,
          orderId: order.id,
        },
      });
    }
  }
};
