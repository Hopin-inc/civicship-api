-- CreateIndex
CREATE INDEX "t_articles_community_id_publish_status_idx" ON "t_articles"("community_id", "publish_status");

-- CreateIndex
CREATE INDEX "t_did_issuance_requests_user_id_idx" ON "t_did_issuance_requests"("user_id");

-- CreateIndex
CREATE INDEX "t_identities_user_id_platform_community_id_idx" ON "t_identities"("user_id", "platform", "community_id");

-- CreateIndex
CREATE INDEX "t_opportunities_community_id_publish_status_category_idx" ON "t_opportunities"("community_id", "publish_status", "category");

-- CreateIndex
CREATE INDEX "t_opportunity_slots_opportunity_id_starts_at_idx" ON "t_opportunity_slots"("opportunity_id", "starts_at");

-- CreateIndex
CREATE INDEX "t_participations_status_user_id_idx" ON "t_participations"("status", "user_id");

-- CreateIndex
CREATE INDEX "t_reservations_opportunity_slot_id_status_idx" ON "t_reservations"("opportunity_slot_id", "status");

-- CreateIndex
CREATE INDEX "t_users_name_idx" ON "t_users"("name");

-- CreateIndex
CREATE INDEX "t_vc_issuance_requests_user_id_idx" ON "t_vc_issuance_requests"("user_id");

-- CreateIndex
CREATE INDEX "t_wallets_community_id_user_id_idx" ON "t_wallets"("community_id", "user_id");
