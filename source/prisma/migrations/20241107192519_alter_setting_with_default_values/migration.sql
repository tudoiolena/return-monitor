-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Setting" ALTER COLUMN "isReturnStatus" SET DEFAULT true,
ALTER COLUMN "isRefundStatus" SET DEFAULT true,
ALTER COLUMN "isPartiallyRefundedStatus" SET DEFAULT true,
ALTER COLUMN "partialRefundPercentage" SET DEFAULT 30,
ALTER COLUMN "suspiciousReturnAmount" SET DEFAULT 30;
