/*
  Warnings:

  - Made the column `order_item_id` on table `t_nft_mints` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "t_nft_mints" DROP CONSTRAINT "t_nft_mints_order_item_id_fkey";

-- AlterTable
ALTER TABLE "t_nft_mints" ALTER COLUMN "order_item_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "t_nft_mints" ADD CONSTRAINT "t_nft_mints_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "t_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
