/*
  Warnings:

  - You are about to drop the `t_participation_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "t_participation_images" DROP CONSTRAINT "t_participation_images_participation_id_fkey";

-- DropTable
DROP TABLE "t_participation_images";

-- CreateTable
CREATE TABLE "_ImageToParticipation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ImageToParticipation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ImageToParticipation_B_index" ON "_ImageToParticipation"("B");

-- AddForeignKey
ALTER TABLE "_ImageToParticipation" ADD CONSTRAINT "_ImageToParticipation_A_fkey" FOREIGN KEY ("A") REFERENCES "t_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToParticipation" ADD CONSTRAINT "_ImageToParticipation_B_fkey" FOREIGN KEY ("B") REFERENCES "t_participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
