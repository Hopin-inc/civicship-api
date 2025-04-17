-- This is an empty migration.

CREATE VIEW v_membership_hosted_opportunity_count AS
SELECT
    m.user_id      AS user_id,
    m.community_id AS community_id,
    COUNT(o.id)    AS total_count
FROM t_memberships m
         LEFT JOIN t_opportunities o
                   ON  o.created_by    = m.user_id
                       AND o.community_id  = m.community_id
                       AND o.publish_status = 'PUBLIC' -- 公開中のみ
GROUP BY m.user_id, m.community_id;