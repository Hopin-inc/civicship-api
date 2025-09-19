-- CreateIndex
CREATE INDEX "t_did_issuance_requests_user_id_idx" ON "t_did_issuance_requests"("user_id");

-- CreateIndex
CREATE INDEX "t_identities_user_id_idx" ON "t_identities"("user_id");

-- CreateIndex
CREATE INDEX "t_opportunities_title_idx" ON "t_opportunities"("title");

-- CreateIndex
CREATE INDEX "t_opportunities_created_by_idx" ON "t_opportunities"("created_by");

-- CreateIndex
CREATE INDEX "t_opportunity_slots_opportunity_id_idx" ON "t_opportunity_slots"("opportunity_id");

-- CreateIndex
CREATE INDEX "t_participations_user_id_idx" ON "t_participations"("user_id");

-- CreateIndex
CREATE INDEX "t_reservations_opportunity_slot_id_idx" ON "t_reservations"("opportunity_slot_id");

-- CreateIndex
CREATE INDEX "t_users_name_idx" ON "t_users"("name");

-- CreateIndex
CREATE INDEX "t_vc_issuance_requests_user_id_idx" ON "t_vc_issuance_requests"("user_id");

-- CreateIndex
CREATE INDEX "t_wallets_user_id_idx" ON "t_wallets"("user_id");
