/*
  Warnings:

  - Added the required column `created_by` to the `t_utilities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "t_utilities" ADD COLUMN     "created_by" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "t_utilities" ADD CONSTRAINT "t_utilities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
