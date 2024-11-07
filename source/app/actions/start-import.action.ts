import { $Enums } from "@prisma/client";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getAdminContext } from "app/shopify.server";

export const action: ActionFunction = async ({ request }) => {
  const adminContext = await getAdminContext(request);

  const { id: shopId } = await prisma.shop.findUniqueOrThrow({
    where: { domain: adminContext.session.shop },
  });

  const newTask = await prisma.syncOrdersTask.create({
    data: {
      shop: { connect: { id: shopId } },
      stage: $Enums.SyncOrdersTaskStage.CREATE_BULK_TASK,
      inProgress: false,
    },
  });

  return json(newTask);
};
