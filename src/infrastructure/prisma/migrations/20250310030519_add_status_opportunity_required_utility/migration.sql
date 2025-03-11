/*
  Warnings:

  - You are about to drop the column `utilityType` on the `t_utilities` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OpportunityUtilityStatus" AS ENUM ('AVAILABLE', 'USED');

-- AlterTable
ALTER TABLE "t_opportunity_required_utilities" ADD COLUMN     "status" "OpportunityUtilityStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "t_utilities" DROP COLUMN "utilityType",
ADD COLUMN     "utility_type" "UtilityType" NOT NULL DEFAULT 'TICKET';
