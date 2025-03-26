/*
  Warnings:

  - Added the required column `reason` to the `t_memberships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "t_memberships" ADD COLUMN     "reason" "MembershipStatusReason" NOT NULL;
