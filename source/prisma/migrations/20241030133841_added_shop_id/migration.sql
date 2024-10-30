/*
  Warnings:

  - Added the required column `shopId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopId` to the `Refund` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopId` to the `Return` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "shopId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shopId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "shopId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Return" ADD COLUMN     "shopId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
