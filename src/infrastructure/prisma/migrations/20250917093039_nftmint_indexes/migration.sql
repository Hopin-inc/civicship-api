-- CreateIndex
CREATE INDEX "t_nft_mints_receiver_idx" ON "t_nft_mints"("receiver");

-- CreateIndex
CREATE INDEX "t_nft_mints_created_at_id_idx" ON "t_nft_mints"("created_at", "id");

-- CreateIndex
CREATE INDEX "t_nft_mints_policy_id_created_at_idx" ON "t_nft_mints"("policy_id", "created_at");
