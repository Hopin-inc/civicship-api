-- This is an empty migration.

BEGIN;
ALTER VIEW v_membership_participation_count
  RENAME COLUMN total_participation_count TO total_count;
COMMIT;