-- CreateTable
CREATE TABLE "Flag" (
    "id" SERIAL NOT NULL,
    "shouldSuspiciousBeUpdated" BOOLEAN NOT NULL,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Flag_shopId_key" ON "Flag"("shopId");

-- CreateIndex
CREATE INDEX "FlagShopIdIndex" ON "Flag"("shopId");

-- CreateIndex
CREATE INDEX "FlagShouldSuspiciousBeUpdated" ON "Flag"("shouldSuspiciousBeUpdated");

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
