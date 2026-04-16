-- ============================================================================
-- Fix: align t_transactions.parent_tx_id FK's ON UPDATE clause with Prisma
--
-- Migration 20260415000000_add_parent_tx_id created the FK using inline
-- REFERENCES syntax:
--
--   ALTER TABLE "t_transactions" ADD COLUMN "parent_tx_id" TEXT
--     REFERENCES "t_transactions"("id") ON DELETE SET NULL;
--
-- which defaults ON UPDATE to NO ACTION, while the Prisma schema's
-- Transaction.parentTx relation implies ON UPDATE CASCADE (Prisma's
-- default for unspecified onUpdate on PostgreSQL). This mismatch shows
-- up as a permanent drift in every `prisma migrate diff` / `migrate
-- dev`, which makes it easy to miss real schema issues introduced by
-- other PRs.
--
-- Functionally inert on the current data model (CUID PKs never
-- `UPDATE id`), but aligning the constraint removes the noise.
-- ============================================================================

-- DropForeignKey
ALTER TABLE "t_transactions" DROP CONSTRAINT "t_transactions_parent_tx_id_fkey";

-- AddForeignKey (NOT VALID + VALIDATE to lower lock level on the scan)
--
-- Plain `ADD CONSTRAINT ... FOREIGN KEY` takes ACCESS EXCLUSIVE on
-- `t_transactions` while it scans the table to verify existing rows.
-- `NOT VALID` skips the scan (metadata-only; brief SHARE ROW EXCLUSIVE)
-- and `VALIDATE CONSTRAINT` performs the scan under SHARE UPDATE
-- EXCLUSIVE, which does not block concurrent reads — and would not
-- block writes outside a wrapping transaction. `prisma migrate deploy`
-- runs the whole migration in one transaction, so the full benefit is
-- only realised when the file is applied standalone (e.g. manual psql
-- run on production), but the PG-recommended pattern costs nothing
-- here and future-proofs the migration for a larger `t_transactions`.
ALTER TABLE "t_transactions"
    ADD CONSTRAINT "t_transactions_parent_tx_id_fkey"
    FOREIGN KEY ("parent_tx_id") REFERENCES "t_transactions"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
    NOT VALID;

ALTER TABLE "t_transactions"
    VALIDATE CONSTRAINT "t_transactions_parent_tx_id_fkey";
