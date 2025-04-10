/*
  Warnings:

  - You are about to drop the column `image` on the `t_communities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "t_communities" DROP COLUMN "image",
ADD COLUMN     "image_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_communities" ADD CONSTRAINT "t_communities_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "t_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
