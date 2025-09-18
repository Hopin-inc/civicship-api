/*
  Warnings:

  - You are about to drop the column `nft_product_id` on the `t_nft_mints` table. All the data in the column will be lost.
  - You are about to drop the column `receiver` on the `t_nft_mints` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `t_nft_products` table. All the data in the column will be lost.
  - You are about to drop the column `ends_at` on the `t_nft_products` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `t_nft_products` table. All the data in the column will be lost.
  - You are about to drop the column `max_supply` on the `t_nft_products` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `t_nft_products` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `t_nft_products` table. All the data in the column will be lost.
  - You are about to drop the column `starts_at` on the `t_nft_products` table. All the data in the column will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order_item_id,sequence_num]` on the table `t_nft_mints` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[product_id]` on the table `t_nft_products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_id` to the `t_nft_products` table without a default value. This is not possible if the table is not empty.
  - Made the column `updated_at` on table `t_nft_products` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('NFT');

-- AlterEnum
ALTER TYPE "NftMintStatus" ADD VALUE 'SUBMITTED';

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_nftProductId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "t_nft_mints" DROP CONSTRAINT "t_nft_mints_nft_product_id_fkey";

-- DropIndex
DROP INDEX "t_nft_mints_nft_product_id_sequence_num_key";

-- DropIndex
DROP INDEX "t_nft_mints_receiver_idx";

-- AlterTable
ALTER TABLE "t_nft_mints" DROP COLUMN "nft_product_id",
DROP COLUMN "receiver",
ADD COLUMN     "order_item_id" TEXT;

-- AlterTable
ALTER TABLE "t_nft_products" DROP COLUMN "description",
DROP COLUMN "ends_at",
DROP COLUMN "image_url",
DROP COLUMN "max_supply",
DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "starts_at",
ADD COLUMN     "product_id" TEXT NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- DropTable
DROP TABLE "Order";

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

-- CreateIndex
CREATE UNIQUE INDEX "t_orders_external_ref_key" ON "t_orders"("external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_order_item_id_sequence_num_key" ON "t_nft_mints"("order_item_id", "sequence_num");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_products_product_id_key" ON "t_nft_products"("product_id");

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "t_order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_orders" ADD CONSTRAINT "t_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_order_items" ADD CONSTRAINT "t_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "t_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_order_items" ADD CONSTRAINT "t_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "t_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_products" ADD CONSTRAINT "t_nft_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "t_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
