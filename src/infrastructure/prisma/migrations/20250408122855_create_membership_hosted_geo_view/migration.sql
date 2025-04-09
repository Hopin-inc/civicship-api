-- AlterTable
ALTER TABLE "t_memberships" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "headline" TEXT;

-- Create as regular views
create view v_membership_hosted_geo as
select distinct
    m.user_id,
    m.community_id,
    pl.id as place_id,
    pl.latitude,
    pl.longitude
from t_memberships m
         join t_opportunities o
              on o.created_by = m.user_id
                  and o.community_id = m.community_id
                  and o.publish_status = 'PUBLIC'
         join t_places pl on pl.id = o.place_id
where o.place_id is not null;
