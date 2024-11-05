import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");

  if (!customerId) {
    return json({ error: "Customer ID is required" }, { status: 400 });
  }

  const customerData = await prisma.customer.findUnique({
    where: { id: parseInt(customerId) },
    include: {
      orders: {
        include: {
          returns: true,
          refunds: true,
        },
      },
      shop: {
        include: {
          setting: true,
        },
      },
    },
  });

  if (!customerData) {
    return json({ error: "Customer not found" }, { status: 404 });
  }

  return json(customerData);
};
