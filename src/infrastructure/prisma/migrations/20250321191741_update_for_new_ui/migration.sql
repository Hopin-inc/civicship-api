/*
  Warnings:

  - The values [UNKNOWN] on the enum `OpportunityCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `capacity` on the `t_opportunities` table. All the data in the column will be lost.
  - You are about to drop the column `ends_at` on the `t_opportunities` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `t_opportunities` table. All the data in the column will be lost.
  - You are about to drop the column `starts_at` on the `t_opportunities` table. All the data in the column will be lost.
  - You are about to drop the column `invited_user_id` on the `t_opportunity_invitation_histories` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `t_opportunity_invitation_histories` table. All the data in the column will be lost.
  - You are about to drop the column `eventTrigger` on the `t_participation_status_histories` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `t_participation_status_histories` table. All the data in the column will be lost.
  - You are about to drop the column `eventTrigger` on the `t_participations` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `t_participations` table. All the data in the column will be lost.
  - You are about to drop the column `opportunity_id` on the `t_participations` table. All the data in the column will be lost.
  - Made the column `opportunity_id` on table `t_opportunity_slots` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `reason` to the `t_participation_status_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `t_participations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "Todo" AS ENUM ('PROFILE', 'PERSONAL_LOG', 'FIRST_ACTIVITY', 'FIRST_QUEST');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('WIP', 'DONE');

-- CreateEnum
CREATE TYPE "ParticipationStatusReason" AS ENUM ('PERSONAL_RECORD', 'RESERVATION_JOINED', 'RESERVATION_APPLIED', 'RESERVATION_CANCELED', 'RESERVATION_ACCEPTED', 'RESERVATION_REJECTED', 'OPPORTUNITY_CANCELED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('APPLIED', 'ACCEPTED', 'REJECTED', 'CANCELED');

-- AlterEnum
BEGIN;
CREATE TYPE "OpportunityCategory_new" AS ENUM ('QUEST', 'EVENT', 'ACTIVITY');
ALTER TABLE "t_opportunities" ALTER COLUMN "category" TYPE "OpportunityCategory_new" USING ("category"::text::"OpportunityCategory_new");
ALTER TYPE "OpportunityCategory" RENAME TO "OpportunityCategory_old";
ALTER TYPE "OpportunityCategory_new" RENAME TO "OpportunityCategory";
DROP TYPE "OpportunityCategory_old";
COMMIT;

-- AlterEnum
ALTER TYPE "TransactionReason" ADD VALUE 'ONBOARDING';

-- DropForeignKey
ALTER TABLE "t_opportunity_invitation_histories" DROP CONSTRAINT "t_opportunity_invitation_histories_invited_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_participations" DROP CONSTRAINT "t_participations_opportunity_id_fkey";

-- AlterTable
ALTER TABLE "t_opportunities" DROP COLUMN "capacity",
DROP COLUMN "ends_at",
DROP COLUMN "source",
DROP COLUMN "starts_at";

-- AlterTable
ALTER TABLE "t_opportunity_invitation_histories" DROP COLUMN "invited_user_id",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "t_opportunity_slots" ADD COLUMN     "capacity" INTEGER,
ALTER COLUMN "opportunity_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "t_participation_status_histories" DROP COLUMN "eventTrigger",
DROP COLUMN "eventType",
ADD COLUMN     "reason" "ParticipationStatusReason" NOT NULL;

-- AlterTable
ALTER TABLE "t_participations" DROP COLUMN "eventTrigger",
DROP COLUMN "eventType",
DROP COLUMN "opportunity_id",
ADD COLUMN     "application_id" TEXT,
ADD COLUMN     "opportunity_invitation_history_id" TEXT,
ADD COLUMN     "reason" "ParticipationStatusReason" NOT NULL,
ADD COLUMN     "source" "Source" NOT NULL DEFAULT 'INTERNAL',
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "OpportunitySource";

-- DropEnum
DROP TYPE "ParticipationEventTrigger";

-- DropEnum
DROP TYPE "ParticipationEventType";

-- CreateTable
CREATE TABLE "t_evaluations" (
    "id" TEXT NOT NULL,
    "participation_id" TEXT NOT NULL,
    "evaluator_id" TEXT NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "credentialUrl" TEXT,
    "issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_evaluation_histories" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "status" "EvaluationStatus" NOT NULL,
    "created_by" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_evaluation_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_onboardings" (
    "id" TEXT NOT NULL,
    "todo" "Todo" NOT NULL DEFAULT 'PROFILE',
    "status" "OnboardingStatus" NOT NULL DEFAULT 'WIP',
    "user_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_onboardings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_reservations" (
    "id" TEXT NOT NULL,
    "opportunity_slot_id" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'APPLIED',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_reservation_histories" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_reservation_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_evaluations_participation_id_key" ON "t_evaluations"("participation_id");

-- AddForeignKey
ALTER TABLE "t_evaluations" ADD CONSTRAINT "t_evaluations_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "t_participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_evaluations" ADD CONSTRAINT "t_evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_evaluation_histories" ADD CONSTRAINT "t_evaluation_histories_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "t_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_evaluation_histories" ADD CONSTRAINT "t_evaluation_histories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_onboardings" ADD CONSTRAINT "t_onboardings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participations" ADD CONSTRAINT "t_participations_opportunity_invitation_history_id_fkey" FOREIGN KEY ("opportunity_invitation_history_id") REFERENCES "t_opportunity_invitation_histories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participations" ADD CONSTRAINT "t_participations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "t_reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reservations" ADD CONSTRAINT "t_reservations_opportunity_slot_id_fkey" FOREIGN KEY ("opportunity_slot_id") REFERENCES "t_opportunity_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reservations" ADD CONSTRAINT "t_reservations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reservation_histories" ADD CONSTRAINT "t_reservation_histories_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "t_reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reservation_histories" ADD CONSTRAINT "t_reservation_histories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
