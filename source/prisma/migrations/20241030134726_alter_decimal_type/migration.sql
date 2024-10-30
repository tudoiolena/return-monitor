/*
  Warnings:

  - You are about to alter the column `totalCost` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `totalRefunded` on the `Refund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalCost" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Refund" ALTER COLUMN "totalRefunded" SET DATA TYPE DECIMAL(10,2);
