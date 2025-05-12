/*
  Warnings:

  - You are about to drop the column `evaluationId` on the `t_evaluation_histories` table. All the data in the column will be lost.
  - You are about to drop the column `credentialUrl` on the `t_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `communityId` on the `t_membership_histories` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `t_membership_histories` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `t_membership_histories` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `t_participation_images` table. All the data in the column will be lost.
  - You are about to drop the column `participationId` on the `t_participation_images` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `t_participation_status_histories` table. All the data in the column will be lost.
  - You are about to drop the column `application_id` on the `t_participations` table. All the data in the column will be lost.
  - You are about to drop the column `communityId` on the `t_places` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `t_reservation_histories` table. All the data in the column will be lost.
  - You are about to drop the column `currentPrefecture` on the `t_users` table. All the data in the column will be lost.
  - Added the required column `evaluation_id` to the `t_evaluation_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `community_id` to the `t_membership_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `t_membership_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participation_id` to the `t_participation_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current_prefecture` to the `t_users` table without a default value. This is not possible if the table is not empty.
*/

DROP VIEW IF EXISTS mv_slot_remaining_capacity CASCADE;
DROP VIEW IF EXISTS mv_earliest_reservable_slot CASCADE;
DROP VIEW IF EXISTS v_membership_participation_geo CASCADE;
DROP VIEW IF EXISTS v_membership_participation_count CASCADE;

-- DropForeignKey
ALTER TABLE "t_evaluation_histories" DROP CONSTRAINT "t_evaluation_histories_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "t_membership_histories" DROP CONSTRAINT "t_membership_histories_userId_communityId_fkey";

-- DropForeignKey
ALTER TABLE "t_participation_images" DROP CONSTRAINT "t_participation_images_participationId_fkey";

-- DropForeignKey
ALTER TABLE "t_participations" DROP CONSTRAINT "t_participations_application_id_fkey";

-- DropForeignKey
ALTER TABLE "t_places" DROP CONSTRAINT "t_places_communityId_fkey";

-- AlterTable
ALTER TABLE "t_evaluation_histories" DROP COLUMN "evaluationId",
ADD COLUMN     "evaluation_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "t_evaluations" DROP COLUMN "credentialUrl",
ADD COLUMN     "credential_url" TEXT;

-- AlterTable
ALTER TABLE "t_membership_histories" DROP COLUMN "communityId",
DROP COLUMN "updated_at",
DROP COLUMN "userId",
ADD COLUMN     "community_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "t_participation_images" DROP COLUMN "createdAt",
DROP COLUMN "participationId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "participation_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "t_participation_status_histories" DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "t_participations" DROP COLUMN "application_id",
ADD COLUMN     "reservation_id" TEXT;

-- AlterTable
ALTER TABLE "t_places" DROP COLUMN "communityId",
ADD COLUMN     "community_id" TEXT;

-- AlterTable
ALTER TABLE "t_reservation_histories" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "t_users" DROP COLUMN "currentPrefecture",
ADD COLUMN     "current_prefecture" "CurrentPrefecture" NOT NULL;

-- AddForeignKey
ALTER TABLE "t_places" ADD CONSTRAINT "t_places_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_membership_histories" ADD CONSTRAINT "t_membership_histories_user_id_community_id_fkey" FOREIGN KEY ("user_id", "community_id") REFERENCES "t_memberships"("user_id", "community_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participations" ADD CONSTRAINT "t_participations_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "t_reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participation_images" ADD CONSTRAINT "t_participation_images_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "t_participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_evaluation_histories" ADD CONSTRAINT "t_evaluation_histories_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "t_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
