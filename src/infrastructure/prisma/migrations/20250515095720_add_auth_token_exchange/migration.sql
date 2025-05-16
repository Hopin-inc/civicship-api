-- AlterTable
ALTER TABLE "t_identities"
    ADD COLUMN "auth_token"       TEXT,
    ADD COLUMN "refresh_token"    TEXT,
    ADD COLUMN "token_expires_at" TIMESTAMP(3);
