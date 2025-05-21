SELECT
  DISTINCT m.user_id,
  m.community_id,
  'HOSTED' :: text AS TYPE,
  pl.id AS place_id,
  pl.name AS place_name,
  img.url AS place_image,
  pl.address,
  pl.latitude,
  pl.longitude
FROM
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
      JOIN t_places pl ON ((pl.id = o.place_id))
    )
    LEFT JOIN t_images img ON ((img.id = pl.image_id))
  )
WHERE
  (o.place_id IS NOT NULL)
UNION
ALL
SELECT
  DISTINCT pt.user_id,
  o.community_id,
  'PARTICIPATED' :: text AS TYPE,
  pl.id AS place_id,
  pl.name AS place_name,
  img.url AS place_image,
  pl.address,
  pl.latitude,
  pl.longitude
FROM
  (
    (
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
      JOIN t_places pl ON ((pl.id = o.place_id))
    )
    LEFT JOIN t_images img ON ((img.id = pl.image_id))
  )
WHERE
  (
    (
      pt.status = 'PARTICIPATED' :: "ParticipationStatus"
    )
    AND (pt.user_id IS NOT NULL)
    AND (o.place_id IS NOT NULL)
  );