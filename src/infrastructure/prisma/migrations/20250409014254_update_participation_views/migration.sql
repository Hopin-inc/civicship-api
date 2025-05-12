-- CreateEnum
CREATE TYPE "ParticipationType" AS ENUM ('HOSTED', 'PARTICIPATED');

-- Drop old views if any
drop view if exists v_membership_hosted_geo;
drop view if exists v_membership_hosted_participation_count;

-- ------------------------------
-- Participation Geo View
-- ------------------------------
create view v_membership_participation_geo as
-- HOSTED
select distinct
    m.user_id,
    m.community_id,
    'HOSTED'::text as type,
        pl.id as place_id,
    pl.latitude,
    pl.longitude
from t_memberships m
         join t_opportunities o
              on o.created_by = m.user_id
                  and o.community_id = m.community_id
                  and o.publish_status = 'PUBLIC'
         join t_places pl on pl.id = o.place_id
where o.place_id is not null

union all

-- PARTICIPATED
select distinct
    pt.user_id,
    o.community_id,
    'PARTICIPATED'::text as type,
        pl.id as place_id,
    pl.latitude,
    pl.longitude
from t_participations pt
         join t_reservations r on r.id = pt.application_id
         join t_opportunity_slots s on s.id = r.opportunity_slot_id
         join t_opportunities o on o.id = s.opportunity_id
         join t_places pl on pl.id = o.place_id
where pt.status = 'PARTICIPATED'
  and pt.user_id is not null
  and o.place_id is not null;

-- ------------------------------
-- Participation Count View
-- ------------------------------
create view v_membership_participation_count as
-- HOSTED
select
    m.user_id,
    m.community_id,
    'HOSTED'::text as type,
        count(distinct pt.id) as total_participation_count
from t_memberships m
         join t_opportunities o
              on o.created_by = m.user_id
                  and o.community_id = m.community_id
                  and o.publish_status = 'PUBLIC'
         join t_opportunity_slots s on s.opportunity_id = o.id
         join t_reservations r on r.opportunity_slot_id = s.id
         join t_participations pt
              on pt.application_id = r.id
                  and pt.status = 'PARTICIPATED'
where pt.user_id is not null
group by m.user_id, m.community_id

union all

-- PARTICIPATED
select
    pt.user_id,
    o.community_id,
    'PARTICIPATED'::text as type,
        count(distinct pt.id) as total_participation_count
from t_participations pt
         join t_reservations r on r.id = pt.application_id
         join t_opportunity_slots s on s.id = r.opportunity_slot_id
         join t_opportunities o on o.id = s.opportunity_id
where pt.status = 'PARTICIPATED'
  and pt.user_id is not null
group by pt.user_id, o.community_id;
