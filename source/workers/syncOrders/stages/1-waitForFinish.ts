import { $Enums, type SyncOrdersTask } from "@prisma/client";
import { unauthenticated } from "app/shopify.server";

export const waitForFinish = async (task: SyncOrdersTask) => {
  console.log("hello waitForFinish");
  await prisma.syncOrdersTask.update({
    where: {
      id: task.id,
    },
    data: {
      retryCount: {
        increment: 1,
      },
      inProgress: true,
      updatedAt: new Date(),
    },
  });

  const shop = await prisma.shop.findFirst({
    where: {
      id: task.shopId,
    },
  });

  if (!shop) {
    await prisma.syncOrdersTask.update({
      where: {
        id: task.id,
      },
      data: {
        retryCount: {
          increment: 1,
        },
        inProgress: false,
        updatedAt: new Date(),
        error: "Shop not found",
      },
    });
    return;
  }

  const {
    admin: { graphql },
  } = await unauthenticated.admin(shop.domain);

  const taskData = task.data ? JSON.parse(task.data as string) : {};
  const dataId = taskData.bulkOperationRunQuery.bulkOperation.id;

  const query = `
    {
      node(id: "${dataId}") {
        ... on BulkOperation {
          id
          status
          errorCode
          createdAt
          completedAt
          objectCount
          fileSize
          url
        }
      }
    }
  `;

  const result = await graphql(query);

  const body = await result.json();
  const operationStatus = body.data.node.status;

  if (operationStatus === "COMPLETED") {
    await prisma.syncOrdersTask.update({
      where: {
        id: task.id,
      },
      data: {
        stage: $Enums.SyncOrdersTaskStage.DOWNLOAD_RESULT,
        inProgress: false,
        updatedAt: new Date(),
        data: JSON.stringify(body.data.node),
      },
    });
    return;
  }

  await prisma.syncOrdersTask.update({
    where: {
      id: task.id,
    },
    data: {
      retryCount: {
        increment: 1,
      },
      inProgress: false,
      updatedAt: new Date(),
      error: JSON.stringify(body),
    },
  });
};
