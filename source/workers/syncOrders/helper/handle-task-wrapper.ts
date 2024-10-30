import type { Shop, SyncOrdersTask } from "@prisma/client";

export async function runTaskWrapper(
  task: SyncOrdersTask,
  taskRunner: (task: SyncOrdersTask, shop: Shop) => Promise<void>,
) {
  await prisma.syncOrdersTask.update({
    where: { id: task.id },
    data: {
      retryCount: { increment: 1 },
      inProgress: true,
      updatedAt: new Date(),
    },
  });

  const shop = await prisma.shop.findFirst({ where: { id: task.shopId } });
  if (!shop) {
    await prisma.syncOrdersTask.update({
      where: { id: task.id },
      data: {
        retryCount: { increment: 1 },
        inProgress: false,
        updatedAt: new Date(),
        error: "Shop not found",
      },
    });
    return;
  }

  try {
    await taskRunner(task, shop);
  } catch (error) {
    await prisma.syncOrdersTask.update({
      where: { id: task.id },
      data: {
        retryCount: { increment: 1 },
        inProgress: false,
        updatedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
