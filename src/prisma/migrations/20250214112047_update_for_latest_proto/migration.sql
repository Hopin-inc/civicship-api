/*
  Warnings:

  - The values [TASK,CONVERSATION] on the enum `OpportunityCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `city_code` on the `t_communities` table. All the data in the column will be lost.
  - You are about to drop the column `state_code` on the `t_communities` table. All the data in the column will be lost.
  - You are about to drop the column `state_country_code` on the `t_communities` table. All the data in the column will be lost.
  - You are about to drop the column `city_code` on the `t_opportunities` table. All the data in the column will be lost.
  - You are about to drop the column `points_per_participation` on the `t_opportunities` table. All the data in the column will be lost.
  - You are about to drop the column `state_code` on the `t_opportunities` table. All the data in the column will be lost.
  - You are about to drop the column `state_country_code` on the `t_opportunities` table. All the data in the column will be lost.
  - Made the column `description` on table `t_opportunities` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('ACTIVITY_REPORT', 'INTERVIEW');

-- AlterEnum
BEGIN;
CREATE TYPE "OpportunityCategory_new" AS ENUM ('QUEST', 'EVENT', 'ACTIVITY');
ALTER TABLE "t_opportunities" ALTER COLUMN "category" TYPE "OpportunityCategory_new" USING ("category"::text::"OpportunityCategory_new");
ALTER TYPE "OpportunityCategory" RENAME TO "OpportunityCategory_old";
ALTER TYPE "OpportunityCategory_new" RENAME TO "OpportunityCategory";
DROP TYPE "OpportunityCategory_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "t_communities" DROP CONSTRAINT "t_communities_city_code_fkey";

-- DropForeignKey
ALTER TABLE "t_communities" DROP CONSTRAINT "t_communities_state_code_state_country_code_fkey";

-- DropForeignKey
ALTER TABLE "t_opportunities" DROP CONSTRAINT "t_opportunities_city_code_fkey";

-- DropForeignKey
ALTER TABLE "t_opportunities" DROP CONSTRAINT "t_opportunities_community_id_fkey";

-- DropForeignKey
ALTER TABLE "t_opportunities" DROP CONSTRAINT "t_opportunities_state_code_state_country_code_fkey";

-- AlterTable
ALTER TABLE "t_communities" DROP COLUMN "city_code",
DROP COLUMN "state_code",
DROP COLUMN "state_country_code";

-- AlterTable
ALTER TABLE "t_opportunities" DROP COLUMN "city_code",
DROP COLUMN "points_per_participation",
DROP COLUMN "state_code",
DROP COLUMN "state_country_code",
ADD COLUMN     "body" TEXT,
ADD COLUMN     "fee_required" INTEGER,
ADD COLUMN     "place_id" TEXT,
ADD COLUMN     "points_required" INTEGER,
ADD COLUMN     "points_to_earn" INTEGER,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "t_participations" ADD COLUMN     "images" JSONB,
ADD COLUMN     "opportunity_slot_id" TEXT;

-- CreateTable
CREATE TABLE "t_opportunity_slots" (
    "id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "opportunity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_opportunity_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_opportunity_invitations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "opportunity_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_opportunity_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_opportunity_invitation_histories" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "invited_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_opportunity_invitation_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_places" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "is_manual" BOOLEAN NOT NULL,
    "google_place_id" TEXT,
    "map_location" JSONB,
    "city_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "category" "ArticleCategory" NOT NULL,
    "publish_status" "PublishStatus" NOT NULL DEFAULT 'PUBLIC',
    "body" TEXT NOT NULL,
    "thumbnail" JSONB,
    "published_at" TIMESTAMP(3) NOT NULL,
    "community_id" TEXT NOT NULL,
    "written_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_t_opportunities_on_articles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_t_opportunities_on_articles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_t_opportunities_on_articles_B_index" ON "_t_opportunities_on_articles"("B");

-- AddForeignKey
ALTER TABLE "t_opportunities" ADD CONSTRAINT "t_opportunities_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "t_places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunities" ADD CONSTRAINT "t_opportunities_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunity_slots" ADD CONSTRAINT "t_opportunity_slots_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "t_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunity_invitations" ADD CONSTRAINT "t_opportunity_invitations_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "t_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunity_invitations" ADD CONSTRAINT "t_opportunity_invitations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunity_invitation_histories" ADD CONSTRAINT "t_opportunity_invitation_histories_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "t_opportunity_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunity_invitation_histories" ADD CONSTRAINT "t_opportunity_invitation_histories_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_places" ADD CONSTRAINT "t_places_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "m_cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participations" ADD CONSTRAINT "t_participations_opportunity_slot_id_fkey" FOREIGN KEY ("opportunity_slot_id") REFERENCES "t_opportunity_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_articles" ADD CONSTRAINT "t_articles_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_articles" ADD CONSTRAINT "t_articles_written_by_user_id_fkey" FOREIGN KEY ("written_by_user_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_opportunities_on_articles" ADD CONSTRAINT "_t_opportunities_on_articles_A_fkey" FOREIGN KEY ("A") REFERENCES "t_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_opportunities_on_articles" ADD CONSTRAINT "_t_opportunities_on_articles_B_fkey" FOREIGN KEY ("B") REFERENCES "t_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
