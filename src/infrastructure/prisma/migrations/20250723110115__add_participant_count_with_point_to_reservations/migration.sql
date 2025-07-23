/*
  Warnings:

  - Added the required column `participant_count_with_point` to the `t_reservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "t_reservations" ADD COLUMN     "participant_count_with_point" INTEGER NOT NULL;
