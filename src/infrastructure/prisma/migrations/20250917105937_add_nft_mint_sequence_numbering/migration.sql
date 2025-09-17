/*
  Warnings:

  - A unique constraint covering the columns `[policy_id,sequence_num]` on the table `t_nft_mints` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sequence_num` to the `t_nft_mints` table without a default value. This is not possible if the table is not empty.

*/
CREATE SEQUENCE IF NOT EXISTS nft_mint_sequence_per_policy START 1;

ALTER TABLE "t_nft_mints" ADD COLUMN "sequence_num" INTEGER;

WITH numbered_rows AS (
  SELECT id, row_number() OVER (PARTITION BY "policy_id" ORDER BY "created_at", "id") as seq_num
  FROM "t_nft_mints"
  WHERE "sequence_num" IS NULL
)
UPDATE "t_nft_mints" 
SET "sequence_num" = numbered_rows.seq_num
FROM numbered_rows
WHERE "t_nft_mints".id = numbered_rows.id;

ALTER TABLE "t_nft_mints" ALTER COLUMN "sequence_num" SET NOT NULL;

SELECT setval('nft_mint_sequence_per_policy', GREATEST(COALESCE((SELECT MAX("sequence_num") FROM "t_nft_mints"), 0), 1));

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_policy_id_sequence_num_key" ON "t_nft_mints"("policy_id", "sequence_num");
