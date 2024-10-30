import type { Shop, SyncOrdersTask } from "@prisma/client";
import { $Enums } from "@prisma/client";
import { unauthenticated } from "../../../app/shopify.server";
import { runTaskWrapper } from "../helper/handle-task-wrapper";

export const createBulkTask = async (task: SyncOrdersTask) => {
  const taskRunner = async (task: SyncOrdersTask, shop: Shop) => {
    const {
      admin: { graphql },
    } = await unauthenticated.admin(shop.domain);

    const query = `
    {
      orders(first: 250) {
        edges {
          node {
            id
            customer {
              id
              email
              firstName
              lastName
            }
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            refunds {
              id
              totalRefundedSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
            returns(first: 250) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
    `;

    const mutation = `
      mutation {
        bulkOperationRunQuery(query: """${query}""") {
          bulkOperation {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const result = await graphql(mutation);
    const body = await result.json();

    if (result.ok) {
      await prisma.syncOrdersTask.update({
        where: { id: task.id },
        data: {
          stage: $Enums.SyncOrdersTaskStage.WAIT_FOR_FINISH,
          inProgress: false,
          updatedAt: new Date(),
          data: JSON.stringify(body.data),
        },
      });
    } else {
      throw new Error(JSON.stringify(body));
    }
  };

  await runTaskWrapper(task, taskRunner);
};
