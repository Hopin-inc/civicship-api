-- CreateEnum
CREATE TYPE "MemberPriorActivityClass" AS ENUM ('PRE_CIVICSHIP_ACTIVE', 'POST_CIVICSHIP_ENGAGED');

-- AlterTable
ALTER TABLE "t_memberships" ADD COLUMN     "prior_activity_class" "MemberPriorActivityClass",
ADD COLUMN     "prior_activity_note" VARCHAR(500),
ADD COLUMN     "prior_activity_recorded_by" TEXT;
