-- CreateEnum
CREATE TYPE "MemberPriorActivitySource" AS ENUM ('SELF_REPORTED', 'ADMIN_CONFIRMED');

-- AlterTable
ALTER TABLE "t_memberships" ADD COLUMN     "prior_active_from" TIMESTAMP(3),
ADD COLUMN     "prior_activity_note" VARCHAR(500),
ADD COLUMN     "prior_activity_recorded_by" TEXT,
ADD COLUMN     "prior_activity_source" "MemberPriorActivitySource";
