-- AlterTable: add image relation columns to t_community_portal_configs
ALTER TABLE "t_community_portal_configs" ADD COLUMN "logo_image_id" TEXT;
ALTER TABLE "t_community_portal_configs" ADD COLUMN "square_logo_image_id" TEXT;
ALTER TABLE "t_community_portal_configs" ADD COLUMN "favicon_image_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_community_portal_configs" ADD CONSTRAINT "t_community_portal_configs_logo_image_id_fkey" FOREIGN KEY ("logo_image_id") REFERENCES "t_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_community_portal_configs" ADD CONSTRAINT "t_community_portal_configs_square_logo_image_id_fkey" FOREIGN KEY ("square_logo_image_id") REFERENCES "t_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_community_portal_configs" ADD CONSTRAINT "t_community_portal_configs_favicon_image_id_fkey" FOREIGN KEY ("favicon_image_id") REFERENCES "t_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
