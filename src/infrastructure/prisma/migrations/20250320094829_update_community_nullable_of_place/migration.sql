-- DropForeignKey
ALTER TABLE "t_places" DROP CONSTRAINT "t_places_communityId_fkey";

-- AlterTable
ALTER TABLE "t_places" ALTER COLUMN "communityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "t_places" ADD CONSTRAINT "t_places_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "t_communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
