-- 1. UUID生成関数のために拡張機能を有効化 (Postgres 13以降は標準機能ですが、念のため記述します)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. カラムを一旦 NULL許容 で追加
ALTER TABLE "t_identities" ADD COLUMN "id" TEXT;

-- 3. 既存の行にランダムなUUIDを生成して埋める (CUIDの代用として適切)
UPDATE "t_identities" SET "id" = gen_random_uuid()::text WHERE "id" IS NULL;

-- 4. 値が埋まったので NOT NULL 制約を追加
ALTER TABLE "t_identities" ALTER COLUMN "id" SET NOT NULL;

-- 5. 主キーの制約を変更
ALTER TABLE "t_identities" DROP CONSTRAINT "t_identities_pkey",
ADD CONSTRAINT "t_identities_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "t_identities_uid_idx" ON "t_identities"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "t_identities_uid_community_id_key" ON "t_identities"("uid", "community_id");