/*
  Warnings:

  - You are about to drop the column `images` on the `t_participations` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "OpportunityCategory" ADD VALUE 'UNKNOWN';

-- AlterTable
ALTER TABLE "t_opportunities" ALTER COLUMN "community_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "t_participations" DROP COLUMN "images",
ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "t_participation_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "participationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_participation_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "t_participation_images" ADD CONSTRAINT "t_participation_images_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "t_participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
