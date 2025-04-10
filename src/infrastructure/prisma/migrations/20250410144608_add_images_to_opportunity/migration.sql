/*
  Warnings:

  - You are about to drop the column `files` on the `t_opportunities` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `t_opportunities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "t_opportunities" DROP COLUMN "files",
DROP COLUMN "image";

-- CreateTable
CREATE TABLE "_ImageToOpportunity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ImageToOpportunity_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ImageToOpportunity_B_index" ON "_ImageToOpportunity"("B");

-- AddForeignKey
ALTER TABLE "_ImageToOpportunity" ADD CONSTRAINT "_ImageToOpportunity_A_fkey" FOREIGN KEY ("A") REFERENCES "t_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToOpportunity" ADD CONSTRAINT "_ImageToOpportunity_B_fkey" FOREIGN KEY ("B") REFERENCES "t_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
