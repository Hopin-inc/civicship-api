/*
  Warnings:

  - You are about to drop the column `opportunity_slot_id` on the `t_participations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "t_participations" DROP CONSTRAINT "t_participations_opportunity_slot_id_fkey";

-- AlterTable
ALTER TABLE "t_participations" DROP COLUMN "opportunity_slot_id";
