import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const returnDataLoader: LoaderFunction = async ({
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
  });

  if (!settings) {
    throw new Error("Settings not found for the shop");
  }

  const data = await prisma.customer.findMany({
    select: {
      firstName: true,
      lastName: true,
      email: true,
      orders: {
        select: {
          id: true,
          totalCost: true,
          returnStatus: true,
          refundStatus: true,
          refunds: {
            select: {
              totalRefunded: true,
            },
          },
        },
      },
    },
  });

  const orders = data.map((customer) => {
    const totalOrders = customer.orders.length;

    const totalReturns = customer.orders.reduce((sum, order) => {
      const { returnStatus, refundStatus, refunds } = order;

      if (settings.isReturnStatus && returnStatus === "RETURNED") {
        return sum + 1;
      }

      if (settings.isRefundStatus && refundStatus === "REFUNDED") {
        return sum + 1;
      }

      if (
        settings.isPartiallyRefundedStatus &&
        refundStatus === "PARTIALLY_REFUNDED" &&
        refunds.length > 0
      ) {
        const totalRefundAmount = refunds.reduce(
          (acc, refund) => acc + Number(refund.totalRefunded),
          0,
        );
        const returnPercentage =
          (totalRefundAmount * 100) / Number(order.totalCost);

        if (returnPercentage > settings.partialRefundPercentage) {
          return sum + 1;
        }
      }

      return sum;
    }, 0);

    const returnPercentage = totalOrders
      ? (totalReturns * 100) / totalOrders
      : 0;

    const costOfReturns = customer.orders.reduce((sum, order) => {
      const isReturnedOrder =
        (settings.isReturnStatus && order.returnStatus === "RETURNED") ||
        (settings.isRefundStatus && order.refundStatus === "REFUNDED") ||
        (settings.isPartiallyRefundedStatus &&
          order.refundStatus === "PARTIALLY_REFUNDED" &&
          (order.refunds.reduce(
            (acc, refund) => acc + Number(refund.totalRefunded),
            0,
          ) *
            100) /
            Number(order.totalCost) >
            settings.partialRefundPercentage);

      return sum + (isReturnedOrder ? Number(order.totalCost) : 0);
    }, 0);

    return {
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      totalOrders,
      totalReturns,
      returnPercentage,
      costOfReturns,
    };
  });

  return { orders };
};
