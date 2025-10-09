SET app.rls_bypass = 'on';
SET app.rls_config.user_id = '';

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('LEFT', 'RIGHT');

-- CreateTable
CREATE TABLE "t_merkle_commits" (
    "id" TEXT NOT NULL,
    "root_hash" TEXT NOT NULL,
    "label" INTEGER NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "committed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_merkle_commits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_merkle_proofs" (
    "id" TEXT NOT NULL,
    "tx_id" TEXT NOT NULL,
    "commit_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "sibling" TEXT NOT NULL,
    "position" "Position" NOT NULL,

    CONSTRAINT "t_merkle_proofs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "t_merkle_proofs" ADD CONSTRAINT "t_merkle_proofs_tx_id_fkey" FOREIGN KEY ("tx_id") REFERENCES "t_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_merkle_proofs" ADD CONSTRAINT "t_merkle_proofs_commit_id_fkey" FOREIGN KEY ("commit_id") REFERENCES "t_merkle_commits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
