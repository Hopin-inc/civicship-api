-- AlterTable
ALTER TABLE "t_nft_tokens" ADD COLUMN     "community_id" TEXT;

-- CreateIndex
CREATE INDEX "t_nft_tokens_community_id_idx" ON "t_nft_tokens"("community_id");

-- AddForeignKey
ALTER TABLE "t_nft_tokens" ADD CONSTRAINT "t_nft_tokens_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
