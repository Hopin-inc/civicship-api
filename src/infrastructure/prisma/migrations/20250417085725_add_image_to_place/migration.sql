-- AlterTable
ALTER TABLE "t_places" ADD COLUMN     "image_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_places" ADD CONSTRAINT "t_places_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "t_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
