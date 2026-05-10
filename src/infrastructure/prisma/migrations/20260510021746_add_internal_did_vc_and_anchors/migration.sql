-- CreateEnum
CREATE TYPE "DIDMethod" AS ENUM ('IDENTUS', 'INTERNAL');

-- CreateEnum
CREATE TYPE "VCFormat" AS ENUM ('IDENTUS_JWT', 'INTERNAL_JWT');

-- CreateEnum
CREATE TYPE "DidOperation" AS ENUM ('CREATE', 'UPDATE', 'DEACTIVATE');

-- CreateEnum
CREATE TYPE "AnchorStatus" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "ChainNetwork" AS ENUM ('CARDANO_MAINNET', 'CARDANO_PREPROD');

-- AlterTable
ALTER TABLE "t_did_issuance_requests" ADD COLUMN     "did_method" "DIDMethod" NOT NULL DEFAULT 'IDENTUS';

-- AlterTable
ALTER TABLE "t_users" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_reason" TEXT;

-- AlterTable
ALTER TABLE "t_vc_issuance_requests" ADD COLUMN     "anchor_leaf_index" INTEGER,
ADD COLUMN     "revocation_reason" TEXT,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "status_list_credential" TEXT,
ADD COLUMN     "status_list_index" INTEGER,
ADD COLUMN     "vc_anchor_id" TEXT,
ADD COLUMN     "vc_format" "VCFormat" NOT NULL DEFAULT 'IDENTUS_JWT',
ADD COLUMN     "vc_jwt" TEXT;

-- CreateTable
CREATE TABLE "t_transaction_anchors" (
    "id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "root_hash" TEXT NOT NULL,
    "leaf_ids" TEXT[],
    "leaf_count" INTEGER NOT NULL,
    "network" "ChainNetwork" NOT NULL,
    "metadata_label" INTEGER NOT NULL DEFAULT 1985,
    "chain_tx_hash" TEXT,
    "block_height" INTEGER,
    "status" "AnchorStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "batch_id" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_transaction_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_vc_anchors" (
    "id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "root_hash" TEXT NOT NULL,
    "leaf_ids" TEXT[],
    "leaf_count" INTEGER NOT NULL,
    "network" "ChainNetwork" NOT NULL,
    "metadata_label" INTEGER NOT NULL DEFAULT 1985,
    "chain_tx_hash" TEXT,
    "block_height" INTEGER,
    "status" "AnchorStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "batch_id" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_vc_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_user_did_anchors" (
    "id" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "operation" "DidOperation" NOT NULL,
    "document_hash" TEXT NOT NULL,
    "document_cbor" BYTEA,
    "previous_anchor_id" TEXT,
    "network" "ChainNetwork" NOT NULL,
    "metadata_label" INTEGER NOT NULL DEFAULT 1985,
    "chain_tx_hash" TEXT,
    "chain_op_index" INTEGER,
    "status" "AnchorStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "batch_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_user_did_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_status_list_credentials" (
    "id" TEXT NOT NULL,
    "list_key" TEXT NOT NULL,
    "encoded_list" BYTEA NOT NULL,
    "vc_jwt" TEXT NOT NULL,
    "next_index" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER NOT NULL DEFAULT 131072,
    "frozen" BOOLEAN NOT NULL DEFAULT false,
    "updated_version" INTEGER NOT NULL DEFAULT 0,
    "last_issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_status_list_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "t_transaction_anchors_status_idx" ON "t_transaction_anchors"("status");

-- CreateIndex
CREATE INDEX "t_transaction_anchors_period_end_idx" ON "t_transaction_anchors"("period_end");

-- CreateIndex
CREATE INDEX "t_transaction_anchors_batch_id_idx" ON "t_transaction_anchors"("batch_id");

-- CreateIndex
CREATE INDEX "t_transaction_anchors_leaf_ids_idx" ON "t_transaction_anchors" USING GIN ("leaf_ids");

-- CreateIndex
CREATE INDEX "t_vc_anchors_status_idx" ON "t_vc_anchors"("status");

-- CreateIndex
CREATE INDEX "t_vc_anchors_period_end_idx" ON "t_vc_anchors"("period_end");

-- CreateIndex
CREATE INDEX "t_vc_anchors_batch_id_idx" ON "t_vc_anchors"("batch_id");

-- CreateIndex
CREATE INDEX "t_vc_anchors_leaf_ids_idx" ON "t_vc_anchors" USING GIN ("leaf_ids");

-- CreateIndex
CREATE INDEX "t_user_did_anchors_did_created_at_idx" ON "t_user_did_anchors"("did", "created_at");

-- CreateIndex
CREATE INDEX "t_user_did_anchors_user_id_idx" ON "t_user_did_anchors"("user_id");

-- CreateIndex
CREATE INDEX "t_user_did_anchors_status_idx" ON "t_user_did_anchors"("status");

-- CreateIndex
CREATE INDEX "t_user_did_anchors_batch_id_idx" ON "t_user_did_anchors"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_status_list_credentials_list_key_key" ON "t_status_list_credentials"("list_key");

-- CreateIndex
CREATE INDEX "t_vc_issuance_requests_vc_anchor_id_idx" ON "t_vc_issuance_requests"("vc_anchor_id");

-- CreateIndex
CREATE INDEX "t_vc_issuance_requests_status_list_credential_status_list_i_idx" ON "t_vc_issuance_requests"("status_list_credential", "status_list_index");

-- AddForeignKey
ALTER TABLE "t_vc_issuance_requests" ADD CONSTRAINT "t_vc_issuance_requests_vc_anchor_id_fkey" FOREIGN KEY ("vc_anchor_id") REFERENCES "t_vc_anchors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_user_did_anchors" ADD CONSTRAINT "t_user_did_anchors_previous_anchor_id_fkey" FOREIGN KEY ("previous_anchor_id") REFERENCES "t_user_did_anchors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_user_did_anchors" ADD CONSTRAINT "t_user_did_anchors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
