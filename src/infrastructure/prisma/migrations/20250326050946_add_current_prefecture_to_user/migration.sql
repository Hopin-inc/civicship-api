/*
  Warnings:

  - Added the required column `currentPrefecture` to the `t_users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CurrentPrefecture" AS ENUM ('KAGAWA', 'TOKUSHIMA', 'KOCHI', 'EHIME', 'OUTSIDE_SHIKOKU', 'UNKNOWN');

-- AlterTable
ALTER TABLE "t_users" ADD COLUMN     "currentPrefecture" "CurrentPrefecture" NOT NULL;
