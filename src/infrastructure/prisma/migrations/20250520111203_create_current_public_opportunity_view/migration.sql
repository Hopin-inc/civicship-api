-- This is an empty migration.

CREATE VIEW v_current_public_opportunity_count AS
SELECT
    p.id AS place_id,
    COUNT(CASE WHEN o.publish_status = 'PUBLIC' THEN o.id END) AS current_public_opportunity_count
FROM
    t_places p
        LEFT JOIN
    t_opportunities o ON o.place_id = p.id
GROUP BY
    p.id;
