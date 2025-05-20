SELECT
  o.place_id,
  sum(v.accumulated_participants) AS accumulated_participants
FROM
  (
    v_opportunity_accumulated_participants v
    JOIN t_opportunities o ON ((o.id = v.opportunity_id))
  )
WHERE
  (o.place_id IS NOT NULL)
GROUP BY
  o.place_id;