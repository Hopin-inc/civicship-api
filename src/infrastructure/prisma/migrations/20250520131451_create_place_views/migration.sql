-- This is an empty migration.

-- ① Opportunity ごとの有効な累積参加者数（予約経由＋有効ステータス）
CREATE VIEW v_opportunity_accumulated_participants AS
SELECT
    o.id AS opportunity_id,
    COUNT(p.id) AS accumulated_participants
FROM
    t_opportunities o
        JOIN t_opportunity_slots s ON s.opportunity_id = o.id
        JOIN t_reservations r ON r.opportunity_slot_id = s.id
        JOIN t_participations p ON p.reservation_id = r.id
WHERE
    p.status IN ('PARTICIPATING', 'PARTICIPATED')
GROUP BY
    o.id;


-- ② Place ごとの累積参加者数（opportunity ごとの集計結果を合算）
CREATE VIEW v_place_accumulated_participants AS
SELECT
    o.place_id AS place_id,
    SUM(v.accumulated_participants) AS accumulated_participants
FROM
    v_opportunity_accumulated_participants v
        JOIN
    t_opportunities o ON o.id = v.opportunity_id
WHERE
    o.place_id IS NOT NULL
GROUP BY
    o.place_id;


-- ③ Place ごとの「公開中」の Opportunity 件数
CREATE VIEW v_place_public_opportunity_count AS
SELECT
    p.id AS place_id,
    COUNT(CASE WHEN o.publish_status = 'PUBLIC' THEN o.id END) AS current_public_count
FROM
    t_places p
        LEFT JOIN
    t_opportunities o ON o.place_id = p.id
GROUP BY
    p.id;
