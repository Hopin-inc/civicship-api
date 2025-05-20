-- This is an empty migration.
CREATE VIEW v_opportunity_accumulated_participants AS
SELECT
    o.id AS opportunity_id,
    COUNT(p.id) AS accumulated_participants
FROM
    t_opportunities o
        JOIN t_opportunity_slots s ON s.opportunity_id = o.id
        JOIN t_reservations r ON r.opportunity_slot_id = s.id AND r.status = 'ACCEPTED'
        JOIN t_participations p ON p.reservation_id = r.id AND p.status IN ('PARTICIPATING', 'PARTICIPATED')
WHERE s.hosting_status != 'CANCELLED'
GROUP BY o.id;
