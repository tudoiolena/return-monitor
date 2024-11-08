-- DropForeignKey
ALTER TABLE "SyncOrdersTask" DROP CONSTRAINT "SyncOrdersTask_shopId_fkey";

-- AddForeignKey
ALTER TABLE "SyncOrdersTask" ADD CONSTRAINT "SyncOrdersTask_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
