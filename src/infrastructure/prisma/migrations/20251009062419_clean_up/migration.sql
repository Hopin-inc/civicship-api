/*
  Warnings:

  - You are about to drop the column `nft_token_id` on the `t_nft_instances` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `t_nft_instances` table. All the data in the column will be lost.
  - You are about to drop the column `nmkr_project_id` on the `t_nft_products` table. All the data in the column will be lost.
  - You are about to drop the column `policy_id` on the `t_nft_products` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_product_id` on the `t_nft_products` table. All the data in the column will be lost.
  - The `payment_provider` column on the `t_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[nft_product_id,instance_id]` on the table `t_nft_instances` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,event_id]` on the table `t_payment_events` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nft_token_id` to the `t_nft_products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('NMKR', 'STRIPE');

-- DropForeignKey
ALTER TABLE "t_nft_instances" DROP CONSTRAINT "t_nft_instances_nft_token_id_fkey";

-- DropForeignKey
ALTER TABLE "t_nft_instances" DROP CONSTRAINT "t_nft_instances_product_id_fkey";

-- DropIndex
DROP INDEX "t_nft_instances_product_id_instance_id_key";

-- DropIndex
DROP INDEX "t_payment_events_event_id_key";

-- AlterTable
ALTER TABLE "t_nft_instances" DROP COLUMN "nft_token_id",
DROP COLUMN "product_id",
ADD COLUMN     "nft_product_id" TEXT;

-- AlterTable
ALTER TABLE "t_nft_products" DROP COLUMN "nmkr_project_id",
DROP COLUMN "policy_id",
DROP COLUMN "stripe_product_id",
ADD COLUMN     "nft_token_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "t_orders" DROP COLUMN "payment_provider",
ADD COLUMN     "payment_provider" "Provider" NOT NULL DEFAULT 'STRIPE';

-- AlterTable
ALTER TABLE "t_payment_events" ADD COLUMN     "provider" "Provider" NOT NULL DEFAULT 'STRIPE';

-- DropEnum
DROP TYPE "PaymentProvider";

-- CreateTable
CREATE TABLE "t_product_integrations" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "external_ref" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_product_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_product_integrations_product_id_provider_key" ON "t_product_integrations"("product_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "t_product_integrations_provider_external_ref_key" ON "t_product_integrations"("provider", "external_ref");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_instances_nft_product_id_instance_id_key" ON "t_nft_instances"("nft_product_id", "instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_payment_events_provider_event_id_key" ON "t_payment_events"("provider", "event_id");

-- AddForeignKey
ALTER TABLE "t_nft_products" ADD CONSTRAINT "t_nft_products_nft_token_id_fkey" FOREIGN KEY ("nft_token_id") REFERENCES "t_nft_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nft_product_id_fkey" FOREIGN KEY ("nft_product_id") REFERENCES "t_nft_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_product_integrations" ADD CONSTRAINT "t_product_integrations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "t_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
