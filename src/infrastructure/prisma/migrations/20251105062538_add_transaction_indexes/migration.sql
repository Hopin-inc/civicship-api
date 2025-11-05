-- CreateIndex
CREATE INDEX "t_participations_reservation_id_idx" ON "t_participations"("reservation_id");

-- CreateIndex
CREATE INDEX "t_transactions_from_created_at_id_idx" ON "t_transactions"("from", "created_at" DESC, "id");

-- CreateIndex
CREATE INDEX "t_transactions_to_created_at_id_idx" ON "t_transactions"("to", "created_at" DESC, "id");
