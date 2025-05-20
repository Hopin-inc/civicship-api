SELECT
  o.id AS opportunity_id,
  min(s.starts_at) AS earliest_reservable_at
FROM
  (
    (
      t_opportunities o
      JOIN t_opportunity_slots s ON ((s.opportunity_id = o.id))
    )
    LEFT JOIN v_slot_remaining_capacity r ON ((r.slot_id = s.id))
  )
WHERE
  (
    (
      s.hosting_status = 'SCHEDULED' :: "OpportunitySlotHostingStatus"
    )
    AND (s.starts_at > NOW())
    AND (
      (r.remaining_capacity IS NULL)
      OR (r.remaining_capacity > 0)
    )
  )
GROUP BY
  o.id;