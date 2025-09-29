-- AlterTable
ALTER TABLE "t_nft_instances" ADD COLUMN     "product_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "t_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
