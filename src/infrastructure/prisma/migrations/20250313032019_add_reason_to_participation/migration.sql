/*
  Warnings:

  - The values [APPLIED,APPROVED,DENIED,CANCELED,INVITED] on the enum `ParticipationStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `reason` to the `t_participation_status_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `t_participations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ParticipationStatusReason" AS ENUM ('INVITED', 'ACCEPTED_INVITATION', 'DECLINED_INVITATION', 'APPLIED', 'ACCEPTED_APPLICATION', 'WITHDRAW_APPLICATION', 'QUALIFIED_PARTICIPATION', 'UNQUALIFIED_PARTICIPATION');

-- AlterEnum
BEGIN;
CREATE TYPE "ParticipationStatus_new" AS ENUM ('PENDING', 'PARTICIPATING', 'PARTICIPATED', 'NOT_PARTICIPATING');
ALTER TABLE "t_participations" ALTER COLUMN "status" TYPE "ParticipationStatus_new" USING ("status"::text::"ParticipationStatus_new");
ALTER TABLE "t_participation_status_histories" ALTER COLUMN "status" TYPE "ParticipationStatus_new" USING ("status"::text::"ParticipationStatus_new");
ALTER TYPE "ParticipationStatus" RENAME TO "ParticipationStatus_old";
ALTER TYPE "ParticipationStatus_new" RENAME TO "ParticipationStatus";
DROP TYPE "ParticipationStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "t_participation_status_histories" ADD COLUMN     "reason" "ParticipationStatusReason" NOT NULL;

-- AlterTable
ALTER TABLE "t_participations" ADD COLUMN     "reason" "ParticipationStatusReason" NOT NULL;
