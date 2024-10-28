import type {SyncOrdersTask} from '@prisma/client';
import {$Enums} from '@prisma/client';
import {unauthenticated} from '../../../app/shopify.server';


export const createBulkTask = async (task: SyncOrdersTask) => {
  await prisma.syncOrdersTask.update({
    where: {
      id: task.id
    },
    data: {
      retryCount: {
        increment: 1
      },
      inProgress: true,
      updatedAt: new Date()
    }
  });

  const shop = await prisma.shop.findFirst({
    where: {
      id: task.shopId
    }
  });

  if (!shop) {
    await prisma.syncOrdersTask.update({
      where: {
        id: task.id
      },
      data: {
        retryCount: {
          increment: 1
        },
        inProgress: false,
        updatedAt: new Date(),
        error: 'Shop not found'
      }
    });
    return;
  }

  const {admin: {graphql}} = await unauthenticated.admin(shop.domain);

  const query = `
   {
      orders(first: 999999999999999999) {
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
            returns (first: 999999999999999999) {
              edges{
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
      where: {
        id: task.id
      },
      data: {
        stage: $Enums.SyncOrdersTaskStage.WAIT_FOR_FINISH,
        inProgress: false,
        updatedAt: new Date(),
        data: body.data
      }
    });
    return;
  }

  await prisma.syncOrdersTask.update({
    where: {
      id: task.id
    },
    data: {
      retryCount: {
        increment: 1
      },
      inProgress: false,
      updatedAt: new Date(),
      error: JSON.stringify(body)
    }
  });
};
