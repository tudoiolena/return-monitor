import type { Shop, SyncOrdersTask } from "@prisma/client";
import { $Enums } from "@prisma/client";
import { unauthenticated } from "app/shopify.server";
import { runTaskWrapper } from "../helper/handle-task-wrapper";

export const waitForFinish = async (task: SyncOrdersTask) => {
  const taskRunner = async (task: SyncOrdersTask, shop: Shop) => {
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
        where: { id: task.id },
        data: {
          stage: $Enums.SyncOrdersTaskStage.DOWNLOAD_RESULT,
          inProgress: false,
          updatedAt: new Date(),
          data: JSON.stringify(body.data.node),
        },
      });
    } else {
      throw new Error(JSON.stringify(body));
    }
  };

  await runTaskWrapper(task, taskRunner);
};
