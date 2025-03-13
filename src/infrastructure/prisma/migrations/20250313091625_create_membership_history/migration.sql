/*
  Warnings:

  - The values [INVITED,CANCELED,WITHDRAWED] on the enum `MembershipStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "MembershipStatusReason" AS ENUM ('CREATED_COMMUNITY', 'INVITED', 'CANCELED_INVITATION', 'ACCEPTED_INVITATION', 'DECLINED_INVITATION', 'WITHDRAWN', 'REMOVED');

-- CreateTable
CREATE TABLE "t_membership_histories" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL,
    "reason" "MembershipStatusReason" NOT NULL,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_membership_histories_pkey" PRIMARY KEY ("id")
);

-- AlterEnum
CREATE TYPE "MembershipStatus_new" AS ENUM ('PENDING', 'JOINED', 'LEFT');
ALTER TABLE "t_memberships" ALTER COLUMN "status" TYPE "MembershipStatus_new" USING ("status"::text::"MembershipStatus_new");
ALTER TABLE "t_membership_histories" ALTER COLUMN "status" TYPE "MembershipStatus_new" USING ("status"::text::"MembershipStatus_new");
ALTER TYPE "MembershipStatus" RENAME TO "MembershipStatus_old";
ALTER TYPE "MembershipStatus_new" RENAME TO "MembershipStatus";
DROP TYPE "MembershipStatus_old";

-- AddForeignKey
ALTER TABLE "t_membership_histories" ADD CONSTRAINT "t_membership_histories_userId_communityId_fkey" FOREIGN KEY ("userId", "communityId") REFERENCES "t_memberships"("user_id", "community_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_membership_histories" ADD CONSTRAINT "t_membership_histories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
