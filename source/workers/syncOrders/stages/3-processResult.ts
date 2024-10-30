import type { Shop, SyncOrdersTask } from "@prisma/client";
import { $Enums } from "@prisma/client";
import * as fs from "fs";
import readline from "readline";
import { runTaskWrapper } from "../helper/handle-task-wrapper";
import { Decimal } from "@prisma/client/runtime/library";

export const processResult = async (task: SyncOrdersTask) => {
  const taskRunner = async (task: SyncOrdersTask, shop: Shop) => {
    const filePath = task.data as string;
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

    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("File successfully deleted.");
      }

      await prisma.syncOrdersTask.update({
        where: { id: task.id },
        data: {
          stage: $Enums.SyncOrdersTaskStage.FINISH,
          inProgress: false,
          updatedAt: new Date(),
        },
      });
    });

    async function handleOrder(data: any) {
      const shopifyId = data.id;
      const totalCost = new Decimal(data.totalPriceSet.shopMoney.amount);

      const currency = data.totalPriceSet.shopMoney.currencyCode;

      const customerData = data.customer;
      const customer = await prisma.customer.upsert({
        where: { shopifyId: customerData.id },
        update: {
          firstName: customerData.firstName ?? "Unknown",
          lastName: customerData.lastName,
          email: customerData.email,
        },
        create: {
          shopId: shop.id,
          shopifyId: customerData.id,
          firstName: customerData.firstName ?? "Unknown",
          lastName: customerData.lastName,
          email: customerData.email,
        },
      });

      await prisma.order.upsert({
        where: { shopifyId },
        update: {
          totalCost,
          currency,
          customerId: customer.id,
        },
        create: {
          shopId: shop.id,
          shopifyId,
          totalCost,
          currency,
          customerId: customer.id,
        },
      });

      for (const refund of data.refunds) {
        await handleRefund({
          ...refund,
          __parentId: shopifyId,
        });
      }
    }

    async function handleRefund(data: any) {
      const shopifyId = data.id;
      const totalRefunded = new Decimal(data.totalRefundedSet.shopMoney.amount);
      const refundCurrency = data.totalRefundedSet.shopMoney.currencyCode;
      const parentOrderShopifyId = data.__parentId;

      const order = await prisma.order.findUnique({
        where: { shopifyId: parentOrderShopifyId },
      });

      if (order) {
        await prisma.refund.upsert({
          where: { shopifyId },
          update: {
            totalRefunded,
            refundCurrency,
            orderId: order.id,
          },
          create: {
            shopId: shop.id,
            shopifyId,
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
        await prisma.return.upsert({
          where: { shopifyId },
          update: {
            orderId: order.id,
          },
          create: {
            shopId: shop.id,
            shopifyId,
            orderId: order.id,
          },
        });
      }
    }
  };

  await runTaskWrapper(task, taskRunner);
};
