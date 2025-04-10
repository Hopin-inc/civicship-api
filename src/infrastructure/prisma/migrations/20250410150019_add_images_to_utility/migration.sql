/*
  Warnings:

  - You are about to drop the column `image` on the `t_utilities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "t_utilities" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "_ImageToUtility" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ImageToUtility_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ImageToUtility_B_index" ON "_ImageToUtility"("B");

-- AddForeignKey
ALTER TABLE "_ImageToUtility" ADD CONSTRAINT "_ImageToUtility_A_fkey" FOREIGN KEY ("A") REFERENCES "t_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToUtility" ADD CONSTRAINT "_ImageToUtility_B_fkey" FOREIGN KEY ("B") REFERENCES "t_utilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
