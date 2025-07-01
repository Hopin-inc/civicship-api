-- AlterTable
ALTER TABLE "t_identities" ADD COLUMN     "community_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_identities" ADD CONSTRAINT "t_identities_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
