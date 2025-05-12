-- Drop existing materialized views if they exist
DROP MATERIALIZED VIEW IF EXISTS "mv_earliest_reservable_slot";
DROP MATERIALIZED VIEW IF EXISTS "mv_slot_remaining_capacity";

-- Recreate as regular views
CREATE VIEW "mv_slot_remaining_capacity" AS
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

CREATE VIEW "mv_earliest_reservable_slot" AS
SELECT
    o.id AS opportunity_id,
    MIN(s.starts_at) AS earliest_reservable_date
FROM t_opportunities o
         JOIN t_opportunity_slots s ON s.opportunity_id = o.id
         LEFT JOIN mv_slot_remaining_capacity r ON r.slot_id = s.id
WHERE
    s.hosting_status = 'SCHEDULED'
  AND s.starts_at > now()
  AND (r.remaining_capacity IS NULL OR r.remaining_capacity > 0)
GROUP BY o.id;
