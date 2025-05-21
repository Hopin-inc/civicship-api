SELECT
  o.id AS opportunity_id,
  count(p.id) AS accumulated_participants
FROM
  (
    (
      (
        t_opportunities o
        JOIN t_opportunity_slots s ON ((s.opportunity_id = o.id))
      )
      JOIN t_reservations r ON ((r.opportunity_slot_id = s.id))
    )
    JOIN t_participations p ON ((p.reservation_id = r.id))
  )
WHERE
  (
    p.status = ANY (
      ARRAY ['PARTICIPATING'::"ParticipationStatus", 'PARTICIPATED'::"ParticipationStatus"]
    )
  )
GROUP BY
  o.id;