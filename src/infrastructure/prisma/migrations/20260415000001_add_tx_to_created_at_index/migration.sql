-- Index for findLatestReceivedTx: WHERE to = ? ORDER BY created_at DESC
CREATE INDEX "idx_t_transactions_to_created_at" ON "t_transactions"("to", "created_at" DESC);
