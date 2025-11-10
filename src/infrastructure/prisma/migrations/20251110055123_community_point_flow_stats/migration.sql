-- ============================================================
-- コミュニティ別ポイントフロー統計ビュー（累計）
-- ============================================================

CREATE OR REPLACE VIEW v_community_point_flow_stats AS
SELECT
    COALESCE(fw.community_id, tw.community_id) AS community_id,

    -- 発行（POINT_ISSUED）
    SUM(
            CASE
                WHEN t.reason = 'POINT_ISSUED' THEN ABS(t.to_point_change)
                ELSE 0
                END
    ) AS issued_points,

    -- 支給（GRANT, ONBOARDING）
    SUM(
            CASE
                WHEN t.reason IN ('GRANT', 'ONBOARDING') THEN ABS(t.to_point_change)
                ELSE 0
                END
    ) AS granted_points,

    -- 譲渡（ユーザー間・購入・返金・予約系）
    SUM(
            CASE
                WHEN t.reason IN (
                                  'DONATION',
                                  'TICKET_PURCHASED',
                                  'TICKET_REFUNDED',
                                  'OPPORTUNITY_RESERVATION_CREATED',
                                  'OPPORTUNITY_RESERVATION_CANCELED',
                                  'OPPORTUNITY_RESERVATION_REJECTED'
                    ) THEN ABS(t.to_point_change)
                ELSE 0
                END
    ) AS transferred_points,

    MAX(t.created_at) AS updated_at

FROM t_transactions t
         LEFT JOIN t_wallets fw ON t.from = fw.id
         LEFT JOIN t_wallets tw ON t.to = tw.id
GROUP BY
    COALESCE(fw.community_id, tw.community_id);

-- ============================================================
-- コミュニティ別ポイントフロー統計ビュー（月次）
-- ============================================================

CREATE OR REPLACE VIEW v_community_point_flow_stats_monthly AS
SELECT
    COALESCE(fw.community_id, tw.community_id) AS community_id,
    date_trunc('month', t.created_at)::date AS month,

    -- 発行（POINT_ISSUED）
    SUM(
        CASE
            WHEN t.reason = 'POINT_ISSUED' THEN ABS(t.to_point_change)
            ELSE 0
        END
    ) AS issued_points,

    -- 支給（GRANT, ONBOARDING）
    SUM(
        CASE
            WHEN t.reason IN ('GRANT', 'ONBOARDING') THEN ABS(t.to_point_change)
            ELSE 0
        END
    ) AS granted_points,

    -- 譲渡（ユーザー間・購入・返金・予約系）
    SUM(
        CASE
            WHEN t.reason IN (
                'DONATION',
                'TICKET_PURCHASED',
                'TICKET_REFUNDED',
                'OPPORTUNITY_RESERVATION_CREATED',
                'OPPORTUNITY_RESERVATION_CANCELED',
                'OPPORTUNITY_RESERVATION_REJECTED'
            ) THEN ABS(t.to_point_change)
            ELSE 0
        END
    ) AS transferred_points,

    MAX(t.created_at) AS updated_at

FROM t_transactions t
    LEFT JOIN t_wallets fw ON t.from = fw.id
    LEFT JOIN t_wallets tw ON t.to = tw.id
GROUP BY
    COALESCE(fw.community_id, tw.community_id),
    date_trunc('month', t.created_at);

-- ============================================================
-- コミュニティ別ポイントフロー統計ビュー（週次）
-- ============================================================

CREATE OR REPLACE VIEW v_community_point_flow_stats_weekly AS
SELECT
    COALESCE(fw.community_id, tw.community_id) AS community_id,
    date_trunc('week', t.created_at)::date AS week,

    -- 発行（POINT_ISSUED）
    SUM(
            CASE
                WHEN t.reason = 'POINT_ISSUED' THEN ABS(t.to_point_change)
                ELSE 0
                END
    ) AS issued_points,

    -- 支給（GRANT, ONBOARDING）
    SUM(
            CASE
                WHEN t.reason IN ('GRANT', 'ONBOARDING') THEN ABS(t.to_point_change)
                ELSE 0
                END
    ) AS granted_points,

    -- 譲渡（ユーザー間・購入・返金・予約系）
    SUM(
            CASE
                WHEN t.reason IN (
                                  'DONATION',
                                  'TICKET_PURCHASED',
                                  'TICKET_REFUNDED',
                                  'OPPORTUNITY_RESERVATION_CREATED',
                                  'OPPORTUNITY_RESERVATION_CANCELED',
                                  'OPPORTUNITY_RESERVATION_REJECTED'
                    ) THEN ABS(t.to_point_change)
                ELSE 0
                END
    ) AS transferred_points,

    MAX(t.created_at) AS updated_at

FROM t_transactions t
         LEFT JOIN t_wallets fw ON t.from = fw.id
         LEFT JOIN t_wallets tw ON t.to = tw.id
GROUP BY
    COALESCE(fw.community_id, tw.community_id),
    date_trunc('week', t.created_at);
