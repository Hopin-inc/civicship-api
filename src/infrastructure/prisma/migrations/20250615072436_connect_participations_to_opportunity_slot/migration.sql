SET app.rls_bypass = 'on';
SET app.rls_config.user_id = '';

/*
  Warnings:

  - You are about to drop the column `opportunity_id` on the `t_participations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "t_participations" DROP CONSTRAINT "t_participations_opportunity_id_fkey";

-- AlterTable
ALTER TABLE "t_participations" DROP COLUMN "opportunity_id",
ADD COLUMN     "opportunity_slot_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_participations" ADD CONSTRAINT "t_participations_opportunity_slot_id_fkey" FOREIGN KEY ("opportunity_slot_id") REFERENCES "t_opportunity_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
