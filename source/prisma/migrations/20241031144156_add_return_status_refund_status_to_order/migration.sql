/*
  Warnings:

  - Added the required column `refundStatus` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnStatus` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "refundStatus" TEXT NOT NULL,
ADD COLUMN     "returnStatus" TEXT NOT NULL;
