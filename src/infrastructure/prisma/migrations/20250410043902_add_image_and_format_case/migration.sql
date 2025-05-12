/*
  Warnings:

  - You are about to drop the column `image` on the `t_users` table. All the data in the column will be lost.
  - You are about to drop the `_OpportunityToUtility` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_OpportunityToUtility" DROP CONSTRAINT "_OpportunityToUtility_A_fkey";

-- DropForeignKey
ALTER TABLE "_OpportunityToUtility" DROP CONSTRAINT "_OpportunityToUtility_B_fkey";

-- AlterTable
ALTER TABLE "t_users" DROP COLUMN "image",
ADD COLUMN     "image_id" TEXT;

-- DropTable
DROP TABLE "_OpportunityToUtility";

-- CreateTable
CREATE TABLE "t_images" (
    "id" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "url" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "folder_path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "mime" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "strapi_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_t_required_opportunities_on_utilities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_t_required_opportunities_on_utilities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_t_required_opportunities_on_utilities_B_index" ON "_t_required_opportunities_on_utilities"("B");

-- AddForeignKey
ALTER TABLE "t_users" ADD CONSTRAINT "t_users_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "t_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_required_opportunities_on_utilities" ADD CONSTRAINT "_t_required_opportunities_on_utilities_A_fkey" FOREIGN KEY ("A") REFERENCES "t_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_required_opportunities_on_utilities" ADD CONSTRAINT "_t_required_opportunities_on_utilities_B_fkey" FOREIGN KEY ("B") REFERENCES "t_utilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
