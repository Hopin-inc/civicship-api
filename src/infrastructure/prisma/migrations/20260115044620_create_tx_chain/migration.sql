-- 1. 検索インデックス
CREATE INDEX IF NOT EXISTS idx_t_transactions_chain_lookup ON t_transactions("from", "to", "created_at");

-- 2. Materialized View の作成
-- 再帰の内部ではフィルタリングせず、最後に全経路の中から最適なものを選び出します
CREATE MATERIALIZED VIEW mv_transaction_chains AS
WITH RECURSIVE chain_evolution AS (
    -- 【起点】GRANT を 1st Link とする
    SELECT
        id AS transaction_id,
        "to" AS holder_wallet_id,
        1 AS depth,
        id AS root_tx_id,
        ARRAY[id]::text[] AS chain_tx_ids,
        created_at
    FROM t_transactions
    WHERE reason = 'GRANT'

    UNION ALL

    -- 【継承】ここでは重複を許容してすべての経路を繋ぐ（ORDER BYを使わない）
    SELECT
        t.id,
        t."to",
        ce.depth + 1,
        ce.root_tx_id,
        ce.chain_tx_ids || t.id,
        t.created_at
    FROM t_transactions t
    JOIN chain_evolution ce ON t."from" = ce.holder_wallet_id
    WHERE t.created_at > ce.created_at
)
-- 3. 最後に外側で「最も長い連鎖（depth DESC）」かつ「最新（created_at DESC）」を抽出
SELECT DISTINCT ON (transaction_id)
    transaction_id,
    depth,
    root_tx_id,
    chain_tx_ids
FROM chain_evolution
ORDER BY transaction_id, depth DESC, created_at DESC;

-- 4. ユニークインデックス（リフレッシュに必須）
CREATE UNIQUE INDEX idx_mv_transaction_chains_id ON mv_transaction_chains(transaction_id);