-- Add parent_tx_id to t_transactions for chain narrative tracking
ALTER TABLE "t_transactions" ADD COLUMN "parent_tx_id" TEXT REFERENCES "t_transactions"("id") ON DELETE SET NULL;

-- Index for traversing the chain upward (child → parent)
CREATE INDEX "idx_t_transactions_parent_tx_id" ON "t_transactions"("parent_tx_id");
