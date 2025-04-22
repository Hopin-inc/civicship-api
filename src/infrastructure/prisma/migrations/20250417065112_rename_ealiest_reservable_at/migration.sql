-- This is an empty migration.

-- 20250417_rename_earliest_reservable.sql
BEGIN;

ALTER VIEW v_earliest_reservable_slot
  RENAME COLUMN earliest_reservable_date TO earliest_reservable_at;

COMMIT;
