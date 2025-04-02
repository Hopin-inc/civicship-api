-- CreateMaterializedView
CREATE MATERIALIZED VIEW "mv_slot_remaining_capacity" AS
SELECT
    s.id AS slot_id,
    CASE
        WHEN s.capacity IS NULL THEN NULL
        ELSE GREATEST(s.capacity - COUNT(p.id), 0)
        END AS remaining_capacity
FROM "t_opportunity_slots" s
         LEFT JOIN "t_reservations" r ON r."opportunity_slot_id" = s.id
         LEFT JOIN "t_participations" p ON p."application_id" = r.id
    AND r.status IN ('APPLIED', 'ACCEPTED')
    AND p.status IN ('PENDING', 'PARTICIPATING')
GROUP BY s.id, s.capacity;
