import type { LoaderFunction } from "@remix-run/node";

export const returnDataLoader: LoaderFunction = async () => {
  const data = await prisma.customer.findMany({
    select: {
      firstName: true,
      lastName: true,
      email: true,
      orders: {
        select: {
          id: true,
          totalCost: true,
          returns: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  const orders = data.map((customer) => {
    const totalOrders = customer.orders.length;
    const totalReturns = customer.orders.reduce(
      (sum, order) => sum + order.returns.length,
      0,
    );
    const returnPercentage = totalOrders
      ? (totalReturns * 100) / totalOrders
      : 0;
    const costOfReturns = customer.orders.reduce((sum, order) => {
      const orderReturns = order.returns.length;
      return sum + (orderReturns > 0 ? Number(order.totalCost) : 0);
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
