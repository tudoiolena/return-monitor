import {$Enums} from '@prisma/client';
import {createBulkTask} from './stages/0-createBulkTask';
import {waitForFinish} from './stages/1-waitForFinish';
import {downloadResult} from './stages/2-downloadResult';
import {processResult} from './stages/3-processResult';

export const syncOrders = async () => {
  try {
    const task = await prisma.syncOrdersTask.findFirst({
      where: {
        inProgress: false,
        stage: {
          not: $Enums.SyncOrdersTaskStage.FINISH
        }
      }
    });

    if (task) {
      switch (task.stage) {
        case $Enums.SyncOrdersTaskStage.CREATE_BULK_TASK:
          return createBulkTask(task);
        case $Enums.SyncOrdersTaskStage.WAIT_FOR_FINISH:
          return waitForFinish(task);
        case $Enums.SyncOrdersTaskStage.DOWNLOAD_RESULT:
          return downloadResult(task);
        case $Enums.SyncOrdersTaskStage.PROCESS_RESULT:
          return processResult(task);
      }
    }

    await fixZombieTasks();
  } catch (e) {
    console.warn('Error in syncOrders', e);
  }
};

const fixZombieTasks = async () => {
  await prisma.syncOrdersTask.updateMany({
    where: {
      inProgress: true,
      updatedAt: {
        lte: new Date(Date.now() - 1000 * 60 * 30)
      }
    },
    data: {
      inProgress: false,
      retryCount: {
        increment: 1
      },
      error: 'zombie task'
    }
  });
};
