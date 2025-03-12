/*
  Warnings:

  - You are about to drop the `_CommunityToPlace` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `communityId` to the `t_places` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CommunityToPlace" DROP CONSTRAINT "_CommunityToPlace_A_fkey";

-- DropForeignKey
ALTER TABLE "_CommunityToPlace" DROP CONSTRAINT "_CommunityToPlace_B_fkey";

-- AlterTable
ALTER TABLE "t_places" ADD COLUMN     "communityId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_CommunityToPlace";

-- AddForeignKey
ALTER TABLE "t_places" ADD CONSTRAINT "t_places_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "t_communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
