/*
  Warnings:

  - You are about to drop the column `email` on the `t_users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `t_users` table. All the data in the column will be lost.
  - You are about to drop the column `is_public` on the `t_users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `t_users` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `t_users` table. All the data in the column will be lost.
  - You are about to drop the `m_agendas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `m_issue_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `m_issue_categories_on_issues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `m_issue_categories_on_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `m_skillsets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_agendas_on_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_agendas_on_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_agendas_on_organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_agendas_on_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_application_confirmations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_cities_on_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_cities_on_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_cities_on_issues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_cities_on_organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_cities_on_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_events_on_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_events_on_organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_indexes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_issues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_issues_on_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_issues_on_organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_skillsets_on_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_skillsets_on_issues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_skillsets_on_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_targets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_users_on_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_users_on_organizations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `t_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `t_users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('PUBLIC', 'COMMUNITY_INTERNAL', 'PRIVATE');

-- CreateEnum
CREATE TYPE "OpportunityCategory" AS ENUM ('EVENT', 'TASK', 'CONVERSATION');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('APPLIED', 'PARTICIPATING', 'NOT_PARTICIPATING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "TransactionReason" AS ENUM ('POINT_ISSUED', 'PARTICIPATION_APPROVED', 'MEMBERSHIP_DELETED', 'GIFT', 'OTHER');

-- DropForeignKey
ALTER TABLE "m_issue_categories_on_issues" DROP CONSTRAINT "m_issue_categories_on_issues_issue_category_id_fkey";

-- DropForeignKey
ALTER TABLE "m_issue_categories_on_issues" DROP CONSTRAINT "m_issue_categories_on_issues_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "m_issue_categories_on_users" DROP CONSTRAINT "m_issue_categories_on_users_issue_category_id_fkey";

-- DropForeignKey
ALTER TABLE "m_issue_categories_on_users" DROP CONSTRAINT "m_issue_categories_on_users_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_activities" DROP CONSTRAINT "t_activities_application_id_fkey";

-- DropForeignKey
ALTER TABLE "t_activities" DROP CONSTRAINT "t_activities_event_id_fkey";

-- DropForeignKey
ALTER TABLE "t_activities" DROP CONSTRAINT "t_activities_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "t_activities" DROP CONSTRAINT "t_activities_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "t_activities" DROP CONSTRAINT "t_activities_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_agendas_on_events" DROP CONSTRAINT "t_agendas_on_events_agenda_id_fkey";

-- DropForeignKey
ALTER TABLE "t_agendas_on_events" DROP CONSTRAINT "t_agendas_on_events_event_id_fkey";

-- DropForeignKey
ALTER TABLE "t_agendas_on_groups" DROP CONSTRAINT "t_agendas_on_groups_agenda_id_fkey";

-- DropForeignKey
ALTER TABLE "t_agendas_on_groups" DROP CONSTRAINT "t_agendas_on_groups_group_id_fkey";

-- DropForeignKey
ALTER TABLE "t_agendas_on_organizations" DROP CONSTRAINT "t_agendas_on_organizations_agenda_id_fkey";

-- DropForeignKey
ALTER TABLE "t_agendas_on_organizations" DROP CONSTRAINT "t_agendas_on_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "t_agendas_on_users" DROP CONSTRAINT "t_agendas_on_users_agenda_id_fkey";

-- DropForeignKey
ALTER TABLE "t_agendas_on_users" DROP CONSTRAINT "t_agendas_on_users_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_application_confirmations" DROP CONSTRAINT "t_application_confirmations_application_id_fkey";

-- DropForeignKey
ALTER TABLE "t_application_confirmations" DROP CONSTRAINT "t_application_confirmations_confirmer_id_fkey";

-- DropForeignKey
ALTER TABLE "t_applications" DROP CONSTRAINT "t_applications_event_id_fkey";

-- DropForeignKey
ALTER TABLE "t_applications" DROP CONSTRAINT "t_applications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_events" DROP CONSTRAINT "t_cities_on_events_city_code_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_events" DROP CONSTRAINT "t_cities_on_events_event_id_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_groups" DROP CONSTRAINT "t_cities_on_groups_city_code_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_groups" DROP CONSTRAINT "t_cities_on_groups_group_id_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_issues" DROP CONSTRAINT "t_cities_on_issues_city_code_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_issues" DROP CONSTRAINT "t_cities_on_issues_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_organizations" DROP CONSTRAINT "t_cities_on_organizations_city_code_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_organizations" DROP CONSTRAINT "t_cities_on_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_users" DROP CONSTRAINT "t_cities_on_users_city_code_fkey";

-- DropForeignKey
ALTER TABLE "t_cities_on_users" DROP CONSTRAINT "t_cities_on_users_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_comments" DROP CONSTRAINT "t_comments_event_id_fkey";

-- DropForeignKey
ALTER TABLE "t_comments" DROP CONSTRAINT "t_comments_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "t_comments" DROP CONSTRAINT "t_comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_events_on_groups" DROP CONSTRAINT "t_events_on_groups_event_id_fkey";

-- DropForeignKey
ALTER TABLE "t_events_on_groups" DROP CONSTRAINT "t_events_on_groups_group_id_fkey";

-- DropForeignKey
ALTER TABLE "t_events_on_organizations" DROP CONSTRAINT "t_events_on_organizations_event_id_fkey";

-- DropForeignKey
ALTER TABLE "t_events_on_organizations" DROP CONSTRAINT "t_events_on_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "t_groups" DROP CONSTRAINT "t_groups_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "t_groups" DROP CONSTRAINT "t_groups_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "t_issues_on_groups" DROP CONSTRAINT "t_issues_on_groups_group_id_fkey";

-- DropForeignKey
ALTER TABLE "t_issues_on_groups" DROP CONSTRAINT "t_issues_on_groups_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "t_issues_on_organizations" DROP CONSTRAINT "t_issues_on_organizations_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "t_issues_on_organizations" DROP CONSTRAINT "t_issues_on_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "t_likes" DROP CONSTRAINT "t_likes_event_id_fkey";

-- DropForeignKey
ALTER TABLE "t_likes" DROP CONSTRAINT "t_likes_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "t_likes" DROP CONSTRAINT "t_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_organizations" DROP CONSTRAINT "t_organizations_city_code_fkey";

-- DropForeignKey
ALTER TABLE "t_organizations" DROP CONSTRAINT "t_organizations_state_code_state_country_code_fkey";

-- DropForeignKey
ALTER TABLE "t_skillsets_on_events" DROP CONSTRAINT "t_skillsets_on_events_event_id_fkey";

-- DropForeignKey
ALTER TABLE "t_skillsets_on_events" DROP CONSTRAINT "t_skillsets_on_events_skillset_id_fkey";

-- DropForeignKey
ALTER TABLE "t_skillsets_on_issues" DROP CONSTRAINT "t_skillsets_on_issues_issue_id_fkey";

-- DropForeignKey
ALTER TABLE "t_skillsets_on_issues" DROP CONSTRAINT "t_skillsets_on_issues_skillset_id_fkey";

-- DropForeignKey
ALTER TABLE "t_skillsets_on_users" DROP CONSTRAINT "t_skillsets_on_users_skillset_id_fkey";

-- DropForeignKey
ALTER TABLE "t_skillsets_on_users" DROP CONSTRAINT "t_skillsets_on_users_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_targets" DROP CONSTRAINT "t_targets_group_id_fkey";

-- DropForeignKey
ALTER TABLE "t_targets" DROP CONSTRAINT "t_targets_index_id_fkey";

-- DropForeignKey
ALTER TABLE "t_targets" DROP CONSTRAINT "t_targets_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "t_users_on_groups" DROP CONSTRAINT "t_users_on_groups_group_id_fkey";

-- DropForeignKey
ALTER TABLE "t_users_on_groups" DROP CONSTRAINT "t_users_on_groups_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_users_on_organizations" DROP CONSTRAINT "t_users_on_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "t_users_on_organizations" DROP CONSTRAINT "t_users_on_organizations_user_id_fkey";

-- AlterTable
ALTER TABLE "t_users" DROP COLUMN "email",
DROP COLUMN "first_name",
DROP COLUMN "is_public",
DROP COLUMN "last_name",
DROP COLUMN "middle_name",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "url_facebook" TEXT,
ADD COLUMN     "url_instagram" TEXT,
ADD COLUMN     "url_tiktok" TEXT,
ADD COLUMN     "url_website" TEXT,
ADD COLUMN     "url_x" TEXT,
ADD COLUMN     "url_youtube" TEXT;

-- DropMaterializedViews
DROP MATERIALIZED VIEW "mv_issues_stats";
DROP MATERIALIZED VIEW "mv_events_stats";
DROP MATERIALIZED VIEW "mv_activities_stats";

-- DropIsolationPolicies
DROP POLICY organization_isolation_policy ON "t_users";
DROP POLICY organization_isolation_policy ON "t_groups";
DROP POLICY organization_isolation_policy ON "t_activities";
DROP POLICY organization_isolation_policy ON "t_events_on_organizations";
DROP POLICY organization_isolation_policy ON "t_issues_on_organizations";
DROP POLICY organization_isolation_policy ON "t_targets";
DROP POLICY organization_isolation_policy ON "t_agendas_on_organizations";
DROP POLICY organization_isolation_policy ON "t_cities_on_organizations";
DROP POLICY organization_bypass_policy ON "t_users";
DROP POLICY organization_bypass_policy ON "t_groups";
DROP POLICY organization_bypass_policy ON "t_activities";
DROP POLICY organization_bypass_policy ON "t_events_on_organizations";
DROP POLICY organization_bypass_policy ON "t_issues_on_organizations";
DROP POLICY organization_bypass_policy ON "t_targets";
DROP POLICY organization_bypass_policy ON "t_agendas_on_organizations";
DROP POLICY organization_bypass_policy ON "t_cities_on_organizations";

-- DropTable
DROP TABLE "m_agendas";

-- DropTable
DROP TABLE "m_issue_categories";

-- DropTable
DROP TABLE "m_issue_categories_on_issues";

-- DropTable
DROP TABLE "m_issue_categories_on_users";

-- DropTable
DROP TABLE "m_skillsets";

-- DropTable
DROP TABLE "t_activities";

-- DropTable
DROP TABLE "t_agendas_on_events";

-- DropTable
DROP TABLE "t_agendas_on_groups";

-- DropTable
DROP TABLE "t_agendas_on_organizations";

-- DropTable
DROP TABLE "t_agendas_on_users";

-- DropTable
DROP TABLE "t_application_confirmations";

-- DropTable
DROP TABLE "t_applications";

-- DropTable
DROP TABLE "t_cities_on_events";

-- DropTable
DROP TABLE "t_cities_on_groups";

-- DropTable
DROP TABLE "t_cities_on_issues";

-- DropTable
DROP TABLE "t_cities_on_organizations";

-- DropTable
DROP TABLE "t_cities_on_users";

-- DropTable
DROP TABLE "t_comments";

-- DropTable
DROP TABLE "t_events";

-- DropTable
DROP TABLE "t_events_on_groups";

-- DropTable
DROP TABLE "t_events_on_organizations";

-- DropTable
DROP TABLE "t_groups";

-- DropTable
DROP TABLE "t_indexes";

-- DropTable
DROP TABLE "t_issues";

-- DropTable
DROP TABLE "t_issues_on_groups";

-- DropTable
DROP TABLE "t_issues_on_organizations";

-- DropTable
DROP TABLE "t_likes";

-- DropTable
DROP TABLE "t_organizations";

-- DropTable
DROP TABLE "t_skillsets_on_events";

-- DropTable
DROP TABLE "t_skillsets_on_issues";

-- DropTable
DROP TABLE "t_skillsets_on_users";

-- DropTable
DROP TABLE "t_targets";

-- DropTable
DROP TABLE "t_users_on_groups";

-- DropTable
DROP TABLE "t_users_on_organizations";

-- DropEnum
DROP TYPE "ActivityStyle";

-- DropEnum
DROP TYPE "EntityPosition";

-- DropEnum
DROP TYPE "ValueType";

-- CreateTable
CREATE TABLE "t_communities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "point_name" TEXT NOT NULL,
    "image" TEXT,
    "bio" TEXT,
    "established_at" TIMESTAMP(3),
    "website" TEXT,
    "state_code" TEXT NOT NULL,
    "state_country_code" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_memberships" (
    "user_id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_memberships_pkey" PRIMARY KEY ("user_id","community_id")
);

-- CreateTable
CREATE TABLE "t_wallets" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_opportunities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "OpportunityCategory" NOT NULL,
    "publish_status" "PublishStatus" NOT NULL DEFAULT 'PUBLIC',
    "require_approval" BOOLEAN NOT NULL DEFAULT false,
    "capacity" INTEGER,
    "points_per_participation" INTEGER NOT NULL,
    "image" TEXT,
    "files" JSONB NOT NULL DEFAULT '[]',
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "community_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "state_country_code" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_participations" (
    "id" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL,
    "user_id" TEXT,
    "community_id" TEXT,
    "opportunity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_participation_status_histories" (
    "id" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL,
    "participation_id" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_participation_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_utilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "points_required" INTEGER NOT NULL,
    "community_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_utilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_transactions" (
    "id" TEXT NOT NULL,
    "from" TEXT,
    "from_point_change" INTEGER NOT NULL,
    "to" TEXT,
    "to_point_change" INTEGER NOT NULL,
    "participation_id" TEXT,
    "utility_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "t_communities" ADD CONSTRAINT "t_communities_state_code_state_country_code_fkey" FOREIGN KEY ("state_code", "state_country_code") REFERENCES "m_states"("code", "country_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_communities" ADD CONSTRAINT "t_communities_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "m_cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_memberships" ADD CONSTRAINT "t_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_memberships" ADD CONSTRAINT "t_memberships_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_wallets" ADD CONSTRAINT "t_wallets_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_wallets" ADD CONSTRAINT "t_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunities" ADD CONSTRAINT "t_opportunities_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunities" ADD CONSTRAINT "t_opportunities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunities" ADD CONSTRAINT "t_opportunities_state_code_state_country_code_fkey" FOREIGN KEY ("state_code", "state_country_code") REFERENCES "m_states"("code", "country_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunities" ADD CONSTRAINT "t_opportunities_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "m_cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participations" ADD CONSTRAINT "t_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participations" ADD CONSTRAINT "t_participations_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participations" ADD CONSTRAINT "t_participations_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "t_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participation_status_histories" ADD CONSTRAINT "t_participation_status_histories_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "t_participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_participation_status_histories" ADD CONSTRAINT "t_participation_status_histories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_utilities" ADD CONSTRAINT "t_utilities_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_transactions" ADD CONSTRAINT "t_transactions_from_fkey" FOREIGN KEY ("from") REFERENCES "t_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_transactions" ADD CONSTRAINT "t_transactions_to_fkey" FOREIGN KEY ("to") REFERENCES "t_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_transactions" ADD CONSTRAINT "t_transactions_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "t_participations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_transactions" ADD CONSTRAINT "t_transactions_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "t_utilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
