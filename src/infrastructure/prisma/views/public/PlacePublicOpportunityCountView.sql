SELECT
  p.id AS place_id,
  count(
    CASE
      WHEN (o.publish_status = 'PUBLIC' :: "PublishStatus") THEN o.id
      ELSE NULL :: text
    END
  ) AS current_public_count
FROM
  (
    t_places p
    LEFT JOIN t_opportunities o ON ((o.place_id = p.id))
  )
GROUP BY
  p.id;