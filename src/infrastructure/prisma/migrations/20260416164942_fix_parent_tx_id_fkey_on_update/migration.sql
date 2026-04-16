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

-- AddForeignKey
ALTER TABLE "t_transactions" ADD CONSTRAINT "t_transactions_parent_tx_id_fkey" FOREIGN KEY ("parent_tx_id") REFERENCES "t_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
