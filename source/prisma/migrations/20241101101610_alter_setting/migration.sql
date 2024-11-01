/*
  Warnings:

  - Added the required column `suspiciousReturnAmount` to the `Setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suspiciousReturnPercentage` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "suspiciousReturnAmount" INTEGER NOT NULL,
ADD COLUMN     "suspiciousReturnPercentage" INTEGER NOT NULL;
