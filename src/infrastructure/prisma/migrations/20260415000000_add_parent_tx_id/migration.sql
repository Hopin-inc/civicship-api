-- Add parent_tx_id to t_transactions for chain narrative tracking
ALTER TABLE "t_transactions" ADD COLUMN "parent_tx_id" TEXT REFERENCES "t_transactions"("id") ON DELETE SET NULL;

-- Index for traversing the chain upward (child → parent)
CREATE INDEX "idx_t_transactions_parent_tx_id" ON "t_transactions"("parent_tx_id");

-- Backfill parent_tx_id: 既存DONATION/POINT_REWARDの過去分を直近受信txで埋める
-- チェーンを構成するreason（GRANT/ONBOARDING/POINT_REWARD/DONATION）のみを親候補にすることで
-- 必ずGRANTまたはONBOARDINGまで辿れるチェーンを保証する
UPDATE "t_transactions" t1
SET parent_tx_id = (
  SELECT t2.id
  FROM "t_transactions" t2
  WHERE t2."to" = t1."from"
    AND t2.created_at < t1.created_at
    AND t2.reason IN ('GRANT', 'ONBOARDING', 'POINT_REWARD', 'DONATION')
  ORDER BY t2.created_at DESC
  LIMIT 1
)
WHERE t1.reason IN ('DONATION', 'POINT_REWARD')
  AND t1."from" IS NOT NULL;

-- Add chain_depth for efficient depth queries without N+1 recursive CTE
ALTER TABLE "t_transactions" ADD COLUMN "chain_depth" INTEGER;

-- Backfill chain_depth via recursive CTE traversal from GRANT/ONBOARDING roots
WITH RECURSIVE depth_calc AS (
  -- Base: GRANT and ONBOARDING are both chain roots (depth=1)
  SELECT id, 1 AS depth
  FROM "t_transactions"
  WHERE reason IN ('GRANT', 'ONBOARDING')

  UNION ALL

  -- Recursive: follow chain children
  SELECT t.id, dc.depth + 1
  FROM "t_transactions" t
  INNER JOIN depth_calc dc ON t.parent_tx_id = dc.id
  WHERE t.reason IN ('DONATION', 'POINT_REWARD')
)
UPDATE "t_transactions" t
SET chain_depth = dc.depth
FROM depth_calc dc
WHERE t.id = dc.id;
