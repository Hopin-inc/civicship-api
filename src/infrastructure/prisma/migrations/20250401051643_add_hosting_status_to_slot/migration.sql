/*
  Warnings:

  - You are about to drop the column `hostingStatus` on the `t_opportunities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "t_opportunities" DROP COLUMN "hostingStatus";

-- AlterTable
ALTER TABLE "t_opportunity_slots" ADD COLUMN     "hostingStatus" "OpportunityHostingStatus" NOT NULL DEFAULT 'SCHEDULED';
