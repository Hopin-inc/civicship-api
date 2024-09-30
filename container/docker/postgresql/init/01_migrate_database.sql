-- NOTE: 暫定で、以下ファイルのコピーを実行
-- src/prisma/migrations/20240902111318_postgres_init

-- CreateEnum
CREATE TYPE "IdentityPlatform" AS ENUM ('LINE');

-- CreateEnum
CREATE TYPE "SysRole" AS ENUM ('SYS_ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "EntityPosition" AS ENUM ('PREFIX', 'SUFFIX');

-- CreateEnum
CREATE TYPE "ValueType" AS ENUM ('INT', 'FLOAT');

-- CreateEnum
CREATE TYPE "ActivityStyle" AS ENUM ('ONSITE', 'OFFSITE');

-- CreateTable
CREATE TABLE "t_identities" (
    "uid" TEXT NOT NULL,
    "platform" "IdentityPlatform" NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_identities_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "t_users" (
    "id" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "first_name" TEXT NOT NULL,
    "email" TEXT,
    "image" TEXT,
    "bio" TEXT,
    "sys_role" "SysRole" NOT NULL DEFAULT 'USER',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "bio" TEXT,
    "parent_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_users_on_groups" (
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "role" "Role",
    "added_at" TIMESTAMP(3),
    "removed_at" TIMESTAMP(3),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_users_on_groups_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "t_organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entity" TEXT,
    "entity_position" "EntityPosition",
    "image" TEXT,
    "bio" TEXT,
    "established_at" TIMESTAMP(3),
    "website" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "zipcode" VARCHAR(7) NOT NULL,
    "state_code" TEXT NOT NULL,
    "state_country_code" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_users_on_organizations" (
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "display_name" TEXT,
    "display_image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "added_at" TIMESTAMP(3),
    "removed_at" TIMESTAMP(3),
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_users_on_organizations_pkey" PRIMARY KEY ("user_id","organization_id")
);

-- CreateTable
CREATE TABLE "t_activities" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "remark" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "activity_style" "ActivityStyle" NOT NULL DEFAULT 'OFFSITE',
    "images" JSONB NOT NULL DEFAULT '[]',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "organization_id" TEXT,
    "event_id" TEXT,
    "issue_id" TEXT,
    "application_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_applications" (
    "id" TEXT NOT NULL,
    "comment" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "event_id" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_application_confirmations" (
    "id" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "application_id" TEXT NOT NULL,
    "confirmer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_application_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_events" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "images" JSONB NOT NULL DEFAULT '[]',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "planned_starts_at" TIMESTAMP(3),
    "planned_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_events_on_groups" (
    "group_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_events_on_groups_pkey" PRIMARY KEY ("group_id","event_id")
);

-- CreateTable
CREATE TABLE "t_events_on_organizations" (
    "organization_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_events_on_organizations_pkey" PRIMARY KEY ("organization_id","event_id")
);

-- CreateTable
CREATE TABLE "t_issues" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "images" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_issues_on_groups" (
    "group_id" TEXT NOT NULL,
    "issue_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_issues_on_groups_pkey" PRIMARY KEY ("group_id","issue_id")
);

-- CreateTable
CREATE TABLE "t_issues_on_organizations" (
    "organization_id" TEXT NOT NULL,
    "issue_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_issues_on_organizations_pkey" PRIMARY KEY ("organization_id","issue_id")
);

-- CreateTable
CREATE TABLE "t_likes" (
    "id" TEXT NOT NULL,
    "posted_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "event_id" TEXT,
    "issue_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "posted_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "event_id" TEXT,
    "issue_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_targets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT,
    "group_id" TEXT,
    "index_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "m_agendas" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "m_agendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_agendas_on_users" (
    "user_id" TEXT NOT NULL,
    "agenda_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_agendas_on_users_pkey" PRIMARY KEY ("user_id","agenda_id")
);

-- CreateTable
CREATE TABLE "t_agendas_on_groups" (
    "group_id" TEXT NOT NULL,
    "agenda_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_agendas_on_groups_pkey" PRIMARY KEY ("group_id","agenda_id")
);

-- CreateTable
CREATE TABLE "t_agendas_on_organizations" (
    "organization_id" TEXT NOT NULL,
    "agenda_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_agendas_on_organizations_pkey" PRIMARY KEY ("organization_id","agenda_id")
);

-- CreateTable
CREATE TABLE "t_agendas_on_events" (
    "event_id" TEXT NOT NULL,
    "agenda_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_agendas_on_events_pkey" PRIMARY KEY ("event_id","agenda_id")
);

-- CreateTable
CREATE TABLE "m_issue_categories" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "m_issue_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "m_issue_categories_on_issues" (
    "issue_id" TEXT NOT NULL,
    "issue_category_id" INTEGER NOT NULL,

    CONSTRAINT "m_issue_categories_on_issues_pkey" PRIMARY KEY ("issue_id","issue_category_id")
);

-- CreateTable
CREATE TABLE "m_issue_categories_on_users" (
    "user_id" TEXT NOT NULL,
    "issue_category_id" INTEGER NOT NULL,

    CONSTRAINT "m_issue_categories_on_users_pkey" PRIMARY KEY ("user_id","issue_category_id")
);

-- CreateTable
CREATE TABLE "m_skillsets" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "m_skillsets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_skillsets_on_users" (
    "user_id" TEXT NOT NULL,
    "skillset_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_skillsets_on_users_pkey" PRIMARY KEY ("user_id","skillset_id")
);

-- CreateTable
CREATE TABLE "t_skillsets_on_events" (
    "event_id" TEXT NOT NULL,
    "skillset_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_skillsets_on_events_pkey" PRIMARY KEY ("event_id","skillset_id")
);

-- CreateTable
CREATE TABLE "t_skillsets_on_issues" (
    "issue_id" TEXT NOT NULL,
    "skillset_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_skillsets_on_issues_pkey" PRIMARY KEY ("issue_id","skillset_id")
);

-- CreateTable
CREATE TABLE "m_cities" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "country_code" CHAR(2) NOT NULL,

    CONSTRAINT "m_cities_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "m_states" (
    "code" TEXT NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "m_states_pkey" PRIMARY KEY ("code","country_code")
);

-- CreateTable
CREATE TABLE "t_cities_on_users" (
    "user_id" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_cities_on_users_pkey" PRIMARY KEY ("user_id","city_code")
);

-- CreateTable
CREATE TABLE "t_cities_on_groups" (
    "group_id" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_cities_on_groups_pkey" PRIMARY KEY ("group_id","city_code")
);

-- CreateTable
CREATE TABLE "t_cities_on_organizations" (
    "organization_id" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_cities_on_organizations_pkey" PRIMARY KEY ("organization_id","city_code")
);

-- CreateTable
CREATE TABLE "t_cities_on_events" (
    "event_id" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_cities_on_events_pkey" PRIMARY KEY ("event_id","city_code")
);

-- CreateTable
CREATE TABLE "t_cities_on_issues" (
    "issue_id" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_cities_on_issues_pkey" PRIMARY KEY ("issue_id","city_code")
);

-- CreateTable
CREATE TABLE "t_indexes" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value_type" "ValueType" NOT NULL,
    "description" TEXT,

    CONSTRAINT "t_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_activities_application_id_key" ON "t_activities"("application_id");

-- AddForeignKey
ALTER TABLE "t_identities" ADD CONSTRAINT "t_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_groups" ADD CONSTRAINT "t_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "t_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_groups" ADD CONSTRAINT "t_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "t_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_users_on_groups" ADD CONSTRAINT "t_users_on_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_users_on_groups" ADD CONSTRAINT "t_users_on_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "t_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_organizations" ADD CONSTRAINT "t_organizations_state_code_state_country_code_fkey" FOREIGN KEY ("state_code", "state_country_code") REFERENCES "m_states"("code", "country_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_organizations" ADD CONSTRAINT "t_organizations_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "m_cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_users_on_organizations" ADD CONSTRAINT "t_users_on_organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_users_on_organizations" ADD CONSTRAINT "t_users_on_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "t_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_activities" ADD CONSTRAINT "t_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_activities" ADD CONSTRAINT "t_activities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "t_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_activities" ADD CONSTRAINT "t_activities_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_activities" ADD CONSTRAINT "t_activities_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "t_issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_activities" ADD CONSTRAINT "t_activities_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "t_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_applications" ADD CONSTRAINT "t_applications_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_applications" ADD CONSTRAINT "t_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_application_confirmations" ADD CONSTRAINT "t_application_confirmations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "t_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_application_confirmations" ADD CONSTRAINT "t_application_confirmations_confirmer_id_fkey" FOREIGN KEY ("confirmer_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_events_on_groups" ADD CONSTRAINT "t_events_on_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "t_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_events_on_groups" ADD CONSTRAINT "t_events_on_groups_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_events_on_organizations" ADD CONSTRAINT "t_events_on_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "t_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_events_on_organizations" ADD CONSTRAINT "t_events_on_organizations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_issues_on_groups" ADD CONSTRAINT "t_issues_on_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "t_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_issues_on_groups" ADD CONSTRAINT "t_issues_on_groups_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "t_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_issues_on_organizations" ADD CONSTRAINT "t_issues_on_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "t_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_issues_on_organizations" ADD CONSTRAINT "t_issues_on_organizations_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "t_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_likes" ADD CONSTRAINT "t_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_likes" ADD CONSTRAINT "t_likes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_likes" ADD CONSTRAINT "t_likes_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "t_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_comments" ADD CONSTRAINT "t_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_comments" ADD CONSTRAINT "t_comments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_comments" ADD CONSTRAINT "t_comments_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "t_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_targets" ADD CONSTRAINT "t_targets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "t_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_targets" ADD CONSTRAINT "t_targets_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "t_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_targets" ADD CONSTRAINT "t_targets_index_id_fkey" FOREIGN KEY ("index_id") REFERENCES "t_indexes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_agendas_on_users" ADD CONSTRAINT "t_agendas_on_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_agendas_on_users" ADD CONSTRAINT "t_agendas_on_users_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "m_agendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_agendas_on_groups" ADD CONSTRAINT "t_agendas_on_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "t_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_agendas_on_groups" ADD CONSTRAINT "t_agendas_on_groups_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "m_agendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_agendas_on_organizations" ADD CONSTRAINT "t_agendas_on_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "t_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_agendas_on_organizations" ADD CONSTRAINT "t_agendas_on_organizations_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "m_agendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_agendas_on_events" ADD CONSTRAINT "t_agendas_on_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_agendas_on_events" ADD CONSTRAINT "t_agendas_on_events_agenda_id_fkey" FOREIGN KEY ("agenda_id") REFERENCES "m_agendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_issue_categories_on_issues" ADD CONSTRAINT "m_issue_categories_on_issues_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "t_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_issue_categories_on_issues" ADD CONSTRAINT "m_issue_categories_on_issues_issue_category_id_fkey" FOREIGN KEY ("issue_category_id") REFERENCES "m_issue_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_issue_categories_on_users" ADD CONSTRAINT "m_issue_categories_on_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_issue_categories_on_users" ADD CONSTRAINT "m_issue_categories_on_users_issue_category_id_fkey" FOREIGN KEY ("issue_category_id") REFERENCES "m_issue_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_skillsets_on_users" ADD CONSTRAINT "t_skillsets_on_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_skillsets_on_users" ADD CONSTRAINT "t_skillsets_on_users_skillset_id_fkey" FOREIGN KEY ("skillset_id") REFERENCES "m_skillsets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_skillsets_on_events" ADD CONSTRAINT "t_skillsets_on_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_skillsets_on_events" ADD CONSTRAINT "t_skillsets_on_events_skillset_id_fkey" FOREIGN KEY ("skillset_id") REFERENCES "m_skillsets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_skillsets_on_issues" ADD CONSTRAINT "t_skillsets_on_issues_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "t_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_skillsets_on_issues" ADD CONSTRAINT "t_skillsets_on_issues_skillset_id_fkey" FOREIGN KEY ("skillset_id") REFERENCES "m_skillsets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_cities" ADD CONSTRAINT "m_cities_state_code_country_code_fkey" FOREIGN KEY ("state_code", "country_code") REFERENCES "m_states"("code", "country_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_users" ADD CONSTRAINT "t_cities_on_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_users" ADD CONSTRAINT "t_cities_on_users_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "m_cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_groups" ADD CONSTRAINT "t_cities_on_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "t_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_groups" ADD CONSTRAINT "t_cities_on_groups_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "m_cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_organizations" ADD CONSTRAINT "t_cities_on_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "t_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_organizations" ADD CONSTRAINT "t_cities_on_organizations_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "m_cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_events" ADD CONSTRAINT "t_cities_on_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "t_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_events" ADD CONSTRAINT "t_cities_on_events_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "m_cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_issues" ADD CONSTRAINT "t_cities_on_issues_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "t_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_cities_on_issues" ADD CONSTRAINT "t_cities_on_issues_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "m_cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
