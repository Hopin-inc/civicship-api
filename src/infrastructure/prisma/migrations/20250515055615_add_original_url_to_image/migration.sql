/*
  Warnings:

  - Added the required column `original_url` to the `t_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "t_images" ADD COLUMN     "original_url" TEXT NOT NULL;
