/*
  Warnings:

  - You are about to drop the column `reason` on the `t_participation_status_histories` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `t_participations` table. All the data in the column will be lost.
  - Added the required column `source` to the `t_opportunities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventTrigger` to the `t_participation_status_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventType` to the `t_participation_status_histories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventTrigger` to the `t_participations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventType` to the `t_participations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OpportunitySource" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "OpportunityHostingStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ParticipationEventType" AS ENUM ('INVITATION', 'APPLICATION', 'EVALUATION', 'OPPORTUNITY');

-- CreateEnum
CREATE TYPE "ParticipationEventTrigger" AS ENUM ('ISSUED', 'ACCEPTED', 'DECLINED', 'CANCELED');

-- AlterTable
ALTER TABLE "t_opportunities" ADD COLUMN     "hostingStatus" "OpportunityHostingStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "source" "OpportunitySource" NOT NULL;

-- AlterTable
ALTER TABLE "t_participation_status_histories" DROP COLUMN "reason",
ADD COLUMN     "eventTrigger" "ParticipationEventTrigger" NOT NULL,
ADD COLUMN     "eventType" "ParticipationEventType" NOT NULL;

-- AlterTable
ALTER TABLE "t_participations" DROP COLUMN "reason",
ADD COLUMN     "eventTrigger" "ParticipationEventTrigger" NOT NULL,
ADD COLUMN     "eventType" "ParticipationEventType" NOT NULL;

-- DropEnum
DROP TYPE "ParticipationStatusReason";
