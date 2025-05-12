/*
  Warnings:

  - The `hostingStatus` column on the `t_opportunity_slots` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OpportunitySlotHostingStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "t_opportunity_slots" DROP COLUMN "hostingStatus",
ADD COLUMN     "hostingStatus" "OpportunitySlotHostingStatus" NOT NULL DEFAULT 'SCHEDULED';

-- DropEnum
DROP TYPE "OpportunityHostingStatus";
