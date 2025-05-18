-- This is an empty migration.
CREATE VIEW v_slot_evaluation_progress AS
SELECT
    s.id AS slot_id,
    -- 評価が完了した参加者数（PASSED または FAILED）
    COUNT(e.id) AS total_evaluated,
    -- PARTICIPATING または PARTICIPATED ステータスの参加者数
    COUNT(p.id) AS valid_participations
FROM
    t_opportunity_slots s
        LEFT JOIN t_reservations r ON r.opportunity_slot_id = s.id
        LEFT JOIN t_participations p ON p.reservation_id = r.id AND p.status IN ('PARTICIPATING', 'PARTICIPATED')
        LEFT JOIN t_evaluations e ON e.participation_id = p.id AND e.status IN ('PASSED', 'FAILED')
GROUP BY
    s.id;
