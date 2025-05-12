/*
  Warnings:

  - Added the required column `status` to the `t_memberships` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'CANCELED', 'JOINED', 'WITHDRAWED');

-- AlterTable
ALTER TABLE "t_memberships" ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'JOINED';
