-- Fix: ONBOARDINGをチェーンに含める
-- 元のマイグレーション(20260415000000)ではONBOARDINGが親候補から除外されていたため、
-- ONBOARDINGのみを受け取ったウォレットからのDONATIONがchain_depth=NULLになっていた。

-- Step 1: ONBOARDINGをチェーンの根（depth=1）として設定
UPDATE "t_transactions"
SET chain_depth = 1
WHERE reason = 'ONBOARDING';

-- Step 2: parent_tx_idがNULLのDONATION/POINT_REWARDを修正
-- （送信者ウォレットがONBOARDINGしか受け取っていないケース）
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
  AND t1.parent_tx_id IS NULL
  AND t1."from" IS NOT NULL;

-- Step 3: 再帰CTEでchain_depthをGRANT/ONBOARDING起点から全子孫に伝播
-- ONBOARDINGを親に持つ子孫でchain_depth=NULLだった行も修正される
WITH RECURSIVE depth_calc AS (
  SELECT id, chain_depth AS depth
  FROM "t_transactions"
  WHERE reason IN ('GRANT', 'ONBOARDING')
    AND chain_depth IS NOT NULL

  UNION ALL

  SELECT t.id, dc.depth + 1
  FROM "t_transactions" t
  INNER JOIN depth_calc dc ON t.parent_tx_id = dc.id
  WHERE t.reason IN ('DONATION', 'POINT_REWARD')
)
UPDATE "t_transactions" t
SET chain_depth = dc.depth
FROM depth_calc dc
WHERE t.id = dc.id;
