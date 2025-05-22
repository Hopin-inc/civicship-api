SELECT
  s.id AS slot_id,
  CASE
    WHEN (s.capacity IS NULL) THEN NULL :: bigint
    ELSE GREATEST((s.capacity - count(p.id)), (0) :: bigint)
  END AS remaining_capacity
FROM
  (
    (
      t_opportunity_slots s
      LEFT JOIN t_reservations r ON ((r.opportunity_slot_id = s.id))
    )
    LEFT JOIN t_participations p ON (
      (
        (p.reservation_id = r.id)
        AND (
          r.status = ANY (
            ARRAY ['APPLIED'::"ReservationStatus", 'ACCEPTED'::"ReservationStatus"]
          )
        )
        AND (
          p.status = ANY (
            ARRAY ['PENDING'::"ParticipationStatus", 'PARTICIPATING'::"ParticipationStatus"]
          )
        )
      )
    )
  )
GROUP BY
  s.id,
  s.capacity;