-- This is an empty migration.

-- Recreate as regular views

CREATE VIEW "v_slot_remaining_capacity" AS
SELECT
    s.id AS slot_id,
    CASE
        WHEN s.capacity IS NULL THEN NULL
        ELSE GREATEST(s.capacity - COUNT(p.id), 0)
        END AS remaining_capacity
FROM "t_opportunity_slots" s
         LEFT JOIN "t_reservations" r ON r."opportunity_slot_id" = s.id
         LEFT JOIN "t_participations" p ON p."reservation_id" = r.id
    AND r.status IN ('APPLIED', 'ACCEPTED')
    AND p.status IN ('PENDING', 'PARTICIPATING')
GROUP BY s.id, s.capacity;

CREATE VIEW "v_earliest_reservable_slot" AS
SELECT
    o.id AS opportunity_id,
    MIN(s.starts_at) AS earliest_reservable_date
FROM t_opportunities o
         JOIN t_opportunity_slots s ON s.opportunity_id = o.id
         LEFT JOIN v_slot_remaining_capacity r ON r.slot_id = s.id
WHERE
    s.hosting_status = 'SCHEDULED'
  AND s.starts_at > now()
  AND (r.remaining_capacity IS NULL OR r.remaining_capacity > 0)
GROUP BY o.id;

-- Participation Geo View
CREATE VIEW v_membership_participation_geo AS
-- HOSTED
SELECT DISTINCT
    m.user_id,
    m.community_id,
    'HOSTED'::text AS type,
        pl.id AS place_id,
    pl.latitude,
    pl.longitude
FROM t_memberships m
         JOIN t_opportunities o ON o.created_by = m.user_id
    AND o.community_id = m.community_id
    AND o.publish_status = 'PUBLIC'
         JOIN t_places pl ON pl.id = o.place_id
WHERE o.place_id IS NOT NULL
UNION ALL
-- PARTICIPATED
SELECT DISTINCT
    pt.user_id,
    o.community_id,
    'PARTICIPATED'::text AS type,
        pl.id AS place_id,
    pl.latitude,
    pl.longitude
FROM t_participations pt
         JOIN t_reservations r ON r.id = pt.reservation_id
         JOIN t_opportunity_slots s ON s.id = r.opportunity_slot_id
         JOIN t_opportunities o ON o.id = s.opportunity_id
         JOIN t_places pl ON pl.id = o.place_id
WHERE pt.status = 'PARTICIPATED'
  AND pt.user_id IS NOT NULL
  AND o.place_id IS NOT NULL;

-- Participation Count View
CREATE VIEW v_membership_participation_count AS
-- HOSTED
SELECT
    m.user_id,
    m.community_id,
    'HOSTED'::text AS type,
        COUNT(DISTINCT pt.id) AS total_participation_count
FROM t_memberships m
         JOIN t_opportunities o ON o.created_by = m.user_id
    AND o.community_id = m.community_id
    AND o.publish_status = 'PUBLIC'
         JOIN t_opportunity_slots s ON s.opportunity_id = o.id
         JOIN t_reservations r ON r.opportunity_slot_id = s.id
         JOIN t_participations pt ON pt.reservation_id = r.id
    AND pt.status = 'PARTICIPATED'
WHERE pt.user_id IS NOT NULL
GROUP BY m.user_id, m.community_id
UNION ALL
-- PARTICIPATED
SELECT
    pt.user_id,
    o.community_id,
    'PARTICIPATED'::text AS type,
        COUNT(DISTINCT pt.id) AS total_participation_count
FROM t_participations pt
         JOIN t_reservations r ON r.id = pt.reservation_id
         JOIN t_opportunity_slots s ON s.id = r.opportunity_slot_id
         JOIN t_opportunities o ON o.id = s.opportunity_id
WHERE pt.status = 'PARTICIPATED'
  AND pt.user_id IS NOT NULL
GROUP BY pt.user_id, o.community_id;
