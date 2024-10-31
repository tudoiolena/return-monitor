-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "isReturnStatus" BOOLEAN NOT NULL,
    "isRefundStatus" BOOLEAN NOT NULL,
    "isPartiallyRefundedStatus" BOOLEAN NOT NULL,
    "partialRefundPercentage" INTEGER NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_shopId_key" ON "Setting"("shopId");

-- CreateIndex
CREATE INDEX "SettingShopIdIndex" ON "Setting"("shopId");

-- CreateIndex
CREATE INDEX "SettingisReturnStatus" ON "Setting"("isReturnStatus");

-- CreateIndex
CREATE INDEX "SettingisRefundStatus" ON "Setting"("isRefundStatus");

-- CreateIndex
CREATE INDEX "SettingisPartiallyRefundedStatus" ON "Setting"("isPartiallyRefundedStatus");

-- CreateIndex
CREATE INDEX "SettingpartialPercentage" ON "Setting"("partialRefundPercentage");
