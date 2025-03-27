/*
  Warnings:

  - You are about to drop the column `opportunity_invitation_history_id` on the `t_participations` table. All the data in the column will be lost.
  - You are about to drop the `t_opportunity_invitation_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_opportunity_invitations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "t_opportunity_invitation_histories" DROP CONSTRAINT "t_opportunity_invitation_histories_invitation_id_fkey";

-- DropForeignKey
ALTER TABLE "t_opportunity_invitations" DROP CONSTRAINT "t_opportunity_invitations_created_by_fkey";

-- DropForeignKey
ALTER TABLE "t_opportunity_invitations" DROP CONSTRAINT "t_opportunity_invitations_opportunity_id_fkey";

-- DropForeignKey
ALTER TABLE "t_participations" DROP CONSTRAINT "t_participations_opportunity_invitation_history_id_fkey";

-- AlterTable
ALTER TABLE "t_participations" DROP COLUMN "opportunity_invitation_history_id";

-- DropTable
DROP TABLE "t_opportunity_invitation_histories";

-- DropTable
DROP TABLE "t_opportunity_invitations";
