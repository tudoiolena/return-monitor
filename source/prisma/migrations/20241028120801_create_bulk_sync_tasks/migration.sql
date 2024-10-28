-- CreateEnum
CREATE TYPE "SyncOrdersTaskStage" AS ENUM ('CREATE_BULK_TASK', 'WAIT_FOR_FINISH', 'DOWNLOAD_RESULT', 'PROCESS_RESULT');

-- CreateTable
CREATE TABLE "SyncOrdersTask" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "stage" "SyncOrdersTaskStage" NOT NULL,
    "inProgress" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncOrdersTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SyncOrdersTaskShopIdIndex" ON "SyncOrdersTask"("shopId");

-- CreateIndex
CREATE INDEX "SyncOrdersTaskStageIndex" ON "SyncOrdersTask"("stage");

-- CreateIndex
CREATE INDEX "SyncOrdersTaskInProgressUpdatedAtIndex" ON "SyncOrdersTask"("inProgress", "updatedAt");

-- AddForeignKey
ALTER TABLE "SyncOrdersTask" ADD CONSTRAINT "SyncOrdersTask_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
