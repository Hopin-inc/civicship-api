/*
  Warnings:

  - A unique constraint covering the columns `[nft_mint_id]` on the table `t_nft_instances` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NftMintStatus" AS ENUM ('QUEUED', 'SUBMITTED', 'MINTED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('NMKR');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('NFT');

-- AlterTable
ALTER TABLE "t_nft_instances" ADD COLUMN     "nft_mint_id" TEXT;

-- CreateTable
CREATE TABLE "t_nft_mints" (
    "id" TEXT NOT NULL,
    "status" "NftMintStatus" NOT NULL DEFAULT 'QUEUED',
    "tx_hash" TEXT,
    "error" TEXT,
    "order_item_id" TEXT,
    "nft_wallet_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_nft_mints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_orders" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_provider" "PaymentProvider" NOT NULL DEFAULT 'NMKR',
    "external_ref" TEXT,
    "total_amount" INTEGER,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_snapshot" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_products" (
    "id" TEXT NOT NULL,
    "type" "ProductType" NOT NULL DEFAULT 'NFT',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "price" INTEGER NOT NULL,
    "max_supply" INTEGER,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_nft_products" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_nft_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "t_nft_mints_created_at_id_idx" ON "t_nft_mints"("created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "t_orders_external_ref_key" ON "t_orders"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_products_product_id_key" ON "t_nft_products"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_instances_nft_mint_id_key" ON "t_nft_instances"("nft_mint_id");

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nft_mint_id_fkey" FOREIGN KEY ("nft_mint_id") REFERENCES "t_nft_mints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "t_order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_nft_wallet_id_fkey" FOREIGN KEY ("nft_wallet_id") REFERENCES "t_nft_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_orders" ADD CONSTRAINT "t_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_order_items" ADD CONSTRAINT "t_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "t_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_order_items" ADD CONSTRAINT "t_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "t_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_products" ADD CONSTRAINT "t_nft_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "t_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
