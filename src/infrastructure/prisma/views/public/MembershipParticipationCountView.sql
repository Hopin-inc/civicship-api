SELECT
  m.user_id,
  m.community_id,
  'HOSTED' :: text AS TYPE,
  count(DISTINCT pt.id) AS total_count
FROM
  (
    (
      (
        (
          t_memberships m
          JOIN t_opportunities o ON (
            (
              (o.created_by = m.user_id)
              AND (o.community_id = m.community_id)
              AND (o.publish_status = 'PUBLIC' :: "PublishStatus")
            )
          )
        )
        JOIN t_opportunity_slots s ON ((s.opportunity_id = o.id))
      )
      JOIN t_reservations r ON ((r.opportunity_slot_id = s.id))
    )
    JOIN t_participations pt ON (
      (
        (pt.reservation_id = r.id)
        AND (
          pt.status = 'PARTICIPATED' :: "ParticipationStatus"
        )
      )
    )
  )
WHERE
  (pt.user_id IS NOT NULL)
GROUP BY
  m.user_id,
  m.community_id
UNION
ALL
SELECT
  pt.user_id,
  o.community_id,
  'PARTICIPATED' :: text AS TYPE,
  count(DISTINCT pt.id) AS total_count
FROM
  (
    (
      (
        t_participations pt
        JOIN t_reservations r ON ((r.id = pt.reservation_id))
      )
      JOIN t_opportunity_slots s ON ((s.id = r.opportunity_slot_id))
    )
    JOIN t_opportunities o ON ((o.id = s.opportunity_id))
  )
WHERE
  (
    (
      pt.status = 'PARTICIPATED' :: "ParticipationStatus"
    )
    AND (pt.user_id IS NOT NULL)
  )
GROUP BY
  pt.user_id,
  o.community_id;