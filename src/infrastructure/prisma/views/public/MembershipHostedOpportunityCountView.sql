SELECT
  m.user_id,
  m.community_id,
  count(o.id) AS total_count
FROM
  (
    t_memberships m
    LEFT JOIN t_opportunities o ON (
      (
        (o.created_by = m.user_id)
        AND (o.community_id = m.community_id)
        AND (o.publish_status = 'PUBLIC' :: "PublishStatus")
      )
    )
  )
GROUP BY
  m.user_id,
  m.community_id;