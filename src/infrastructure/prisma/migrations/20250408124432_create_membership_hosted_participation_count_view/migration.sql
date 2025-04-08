create view v_membership_hosted_participation_count as
select
    m.user_id,
    m.community_id,
    count(distinct pt.id) as total_participation_count
from t_memberships m
         join t_opportunities o
              on o.created_by = m.user_id
                  and o.community_id = m.community_id
                  and o.publish_status = 'PUBLIC'
         join t_opportunity_slots s
              on s.opportunity_id = o.id
         join t_reservations r
              on r.opportunity_slot_id = s.id
         join t_participations pt
              on pt.application_id = r.id
                  and pt.status = 'PARTICIPATED'
where pt.user_id is not null
group by m.user_id, m.community_id;
