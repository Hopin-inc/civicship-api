/*
  Warnings:

  - You are about to drop the column `points_required` on the `t_opportunities` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UtilityType" AS ENUM ('TICKET');

-- AlterTable
ALTER TABLE "t_opportunities" DROP COLUMN "points_required";

-- AlterTable
ALTER TABLE "t_utilities" ADD COLUMN     "utilityType" "UtilityType" NOT NULL DEFAULT 'TICKET';

-- CreateTable
CREATE TABLE "t_opportunity_required_utilities" (
    "opportunity_id" TEXT NOT NULL,
    "utility_id" TEXT NOT NULL,

    CONSTRAINT "t_opportunity_required_utilities_pkey" PRIMARY KEY ("opportunity_id","utility_id")
);

-- AddForeignKey
ALTER TABLE "t_opportunity_required_utilities" ADD CONSTRAINT "t_opportunity_required_utilities_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "t_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunity_required_utilities" ADD CONSTRAINT "t_opportunity_required_utilities_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "t_utilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
