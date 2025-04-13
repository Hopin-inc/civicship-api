/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `t_articles` table. All the data in the column will be lost.
  - You are about to drop the `_ImageToOpportunity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ImageToParticipation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ImageToUtility` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ImageToOpportunity" DROP CONSTRAINT "_ImageToOpportunity_A_fkey";

-- DropForeignKey
ALTER TABLE "_ImageToOpportunity" DROP CONSTRAINT "_ImageToOpportunity_B_fkey";

-- DropForeignKey
ALTER TABLE "_ImageToParticipation" DROP CONSTRAINT "_ImageToParticipation_A_fkey";

-- DropForeignKey
ALTER TABLE "_ImageToParticipation" DROP CONSTRAINT "_ImageToParticipation_B_fkey";

-- DropForeignKey
ALTER TABLE "_ImageToUtility" DROP CONSTRAINT "_ImageToUtility_A_fkey";

-- DropForeignKey
ALTER TABLE "_ImageToUtility" DROP CONSTRAINT "_ImageToUtility_B_fkey";

-- AlterTable
ALTER TABLE "t_articles" DROP COLUMN "thumbnail",
ADD COLUMN     "thumbnail_id" TEXT;

-- DropTable
DROP TABLE "_ImageToOpportunity";

-- DropTable
DROP TABLE "_ImageToParticipation";

-- DropTable
DROP TABLE "_ImageToUtility";

-- CreateTable
CREATE TABLE "_t_images_on_opportunities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_t_images_on_opportunities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_t_images_on_participations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_t_images_on_participations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_t_images_on_utilities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_t_images_on_utilities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_t_images_on_opportunities_B_index" ON "_t_images_on_opportunities"("B");

-- CreateIndex
CREATE INDEX "_t_images_on_participations_B_index" ON "_t_images_on_participations"("B");

-- CreateIndex
CREATE INDEX "_t_images_on_utilities_B_index" ON "_t_images_on_utilities"("B");

-- AddForeignKey
ALTER TABLE "t_articles" ADD CONSTRAINT "t_articles_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "t_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_images_on_opportunities" ADD CONSTRAINT "_t_images_on_opportunities_A_fkey" FOREIGN KEY ("A") REFERENCES "t_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_images_on_opportunities" ADD CONSTRAINT "_t_images_on_opportunities_B_fkey" FOREIGN KEY ("B") REFERENCES "t_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_images_on_participations" ADD CONSTRAINT "_t_images_on_participations_A_fkey" FOREIGN KEY ("A") REFERENCES "t_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_images_on_participations" ADD CONSTRAINT "_t_images_on_participations_B_fkey" FOREIGN KEY ("B") REFERENCES "t_participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_images_on_utilities" ADD CONSTRAINT "_t_images_on_utilities_A_fkey" FOREIGN KEY ("A") REFERENCES "t_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_images_on_utilities" ADD CONSTRAINT "_t_images_on_utilities_B_fkey" FOREIGN KEY ("B") REFERENCES "t_utilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
