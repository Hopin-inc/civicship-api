-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('NMKR');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'NMKR',
    "externalRef" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" INTEGER,
    "userId" TEXT NOT NULL,
    "nftProductId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_externalRef_key" ON "Order"("externalRef");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "t_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_nftProductId_fkey" FOREIGN KEY ("nftProductId") REFERENCES "t_nft_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
