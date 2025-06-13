-- CreateEnum
CREATE TYPE "VCIssuanceStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "t_vc_issuance_requests" (
    "id" TEXT NOT NULL,
    "status" "VCIssuanceStatus" NOT NULL DEFAULT 'PENDING',
    "vc_record_id" TEXT,
    "claims" JSONB NOT NULL,
    "credential_format" TEXT,
    "schema_id" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_vc_issuance_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "t_vc_issuance_requests" ADD CONSTRAINT "t_vc_issuance_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
