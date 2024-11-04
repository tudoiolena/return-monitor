import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { getAdminContext } from "app/shopify.server";

export const apiTaskLoader: LoaderFunction = async ({ request }) => {
  const adminContext = await getAdminContext(request);

  const task = await prisma.syncOrdersTask.findFirst({
    where: {
      shop: { domain: adminContext.session.shop },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!task) {
    return json({ task: null });
  }

  return json({ task });
};
