-- Add parent_tx_id to t_transactions for chain narrative tracking
ALTER TABLE "t_transactions" ADD COLUMN "parent_tx_id" TEXT REFERENCES "t_transactions"("id") ON DELETE SET NULL;

-- Index for traversing the chain upward (child → parent)
CREATE INDEX "idx_t_transactions_parent_tx_id" ON "t_transactions"("parent_tx_id");

-- Backfill: 既存DONATIONの過去分を直近受信txで埋める
UPDATE "t_transactions" t1
SET parent_tx_id = (
  SELECT t2.id
  FROM "t_transactions" t2
  WHERE t2."to" = t1."from"
    AND t2.created_at < t1.created_at
  ORDER BY t2.created_at DESC
  LIMIT 1
)
WHERE t1.reason = 'DONATION'
  AND t1."from" IS NOT NULL;
