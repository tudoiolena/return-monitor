import { $Enums, type SyncOrdersTask } from "@prisma/client";
import { unauthenticated } from "app/shopify.server";

export const waitForFinish = async (task: SyncOrdersTask) => {
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
  const dataId = taskData.id;

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

  if (result.ok) {
    await prisma.syncOrdersTask.update({
      where: {
        id: task.id,
      },
      data: {
        stage: $Enums.SyncOrdersTaskStage.DOWNLOAD_RESULT,
        inProgress: false,
        updatedAt: new Date(),
        data: body.data,
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
