/*
  Warnings:

  - You are about to drop the column `written_by_user_id` on the `t_articles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "t_articles" DROP CONSTRAINT "t_articles_written_by_user_id_fkey";

-- AlterTable
ALTER TABLE "t_articles" DROP COLUMN "written_by_user_id";

-- CreateTable
CREATE TABLE "_t_author_users_on_articles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_t_author_users_on_articles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_t_related_users_on_articles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_t_related_users_on_articles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_t_author_users_on_articles_B_index" ON "_t_author_users_on_articles"("B");

-- CreateIndex
CREATE INDEX "_t_related_users_on_articles_B_index" ON "_t_related_users_on_articles"("B");

-- AddForeignKey
ALTER TABLE "_t_author_users_on_articles" ADD CONSTRAINT "_t_author_users_on_articles_A_fkey" FOREIGN KEY ("A") REFERENCES "t_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_author_users_on_articles" ADD CONSTRAINT "_t_author_users_on_articles_B_fkey" FOREIGN KEY ("B") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_related_users_on_articles" ADD CONSTRAINT "_t_related_users_on_articles_A_fkey" FOREIGN KEY ("A") REFERENCES "t_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_related_users_on_articles" ADD CONSTRAINT "_t_related_users_on_articles_B_fkey" FOREIGN KEY ("B") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
