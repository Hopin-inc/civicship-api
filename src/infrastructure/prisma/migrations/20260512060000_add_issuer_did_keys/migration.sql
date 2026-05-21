-- CreateTable
CREATE TABLE "t_issuer_did_keys" (
    "id" TEXT NOT NULL,
    "kms_key_resource_name" TEXT NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_issuer_did_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_issuer_did_keys_kms_key_resource_name_key" ON "t_issuer_did_keys"("kms_key_resource_name");

-- CreateIndex
CREATE INDEX "t_issuer_did_keys_activated_at_idx" ON "t_issuer_did_keys"("activated_at");

-- CreateIndex
CREATE INDEX "t_issuer_did_keys_deactivated_at_activated_at_idx" ON "t_issuer_did_keys"("deactivated_at", "activated_at");
