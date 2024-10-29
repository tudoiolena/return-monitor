-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "totalCost" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "refundId" TEXT NOT NULL,
    "totalRefunded" DECIMAL(65,30) NOT NULL,
    "refundCurrency" TEXT NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Return" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "returnId" TEXT NOT NULL,

    CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_shopifyId_key" ON "Order"("shopifyId");

-- CreateIndex
CREATE INDEX "OrderShopIdIndex" ON "Order"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_shopifyId_key" ON "Customer"("shopifyId");

-- CreateIndex
CREATE INDEX "CustomerShopIdIndex" ON "Customer"("shopifyId");

-- CreateIndex
CREATE INDEX "CustomerEmailIndex" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_shopifyId_key" ON "Refund"("shopifyId");

-- CreateIndex
CREATE INDEX "RefundShopIdIndex" ON "Refund"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Return_shopifyId_key" ON "Return"("shopifyId");

-- CreateIndex
CREATE INDEX "ReturnShopIdIndex" ON "Return"("shopifyId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
