/*
  Warnings:

  - The primary key for the `t_likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `code` to the `t_indexes` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `t_likes` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `t_activities` DROP FOREIGN KEY `t_activities_event_id_fkey`;

-- AlterTable
ALTER TABLE `t_activities` ADD COLUMN `activity_style` ENUM('ONSITE', 'OFFSITE') NOT NULL DEFAULT 'OFFSITE',
    ADD COLUMN `application_id` VARCHAR(191) NULL,
    ADD COLUMN `issue_id` VARCHAR(191) NULL,
    MODIFY `is_public` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `event_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `t_comments` ADD COLUMN `issue_id` VARCHAR(191) NULL,
    MODIFY `event_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `t_events` MODIFY `is_public` BOOLEAN NOT NULL DEFAULT false;

-- DropForeignKey
ALTER TABLE `t_targets` DROP FOREIGN KEY `t_targets_index_id_fkey`;

-- AlterTable
ALTER TABLE `t_indexes` ADD COLUMN `code` VARCHAR(191) NOT NULL,
    MODIFY `id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `t_targets` ADD CONSTRAINT `t_targets_index_id_fkey` FOREIGN KEY (`index_id`) REFERENCES `t_indexes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `t_likes`
    DROP FOREIGN KEY `t_likes_user_id_fkey`,
    DROP FOREIGN KEY `t_likes_event_id_fkey`,
    DROP PRIMARY KEY,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD COLUMN `issue_id` VARCHAR(191) NULL,
    MODIFY `event_id` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `t_likes` ADD CONSTRAINT `t_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_likes` ADD CONSTRAINT `t_likes_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `t_organizations` ADD COLUMN `is_public` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `t_users_on_organizations` MODIFY `is_public` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `t_applications` (
    `id` VARCHAR(191) NOT NULL,
    `comment` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `submitted_at` DATETIME(3) NOT NULL,
    `event_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_application_confirmations` (
    `id` VARCHAR(191) NOT NULL,
    `is_approved` BOOLEAN NOT NULL DEFAULT true,
    `comment` VARCHAR(191) NULL,
    `application_id` VARCHAR(191) NOT NULL,
    `confirmer_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_issues` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `images` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_issues_on_groups` (
    `group_id` VARCHAR(191) NOT NULL,
    `issue_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`group_id`, `issue_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_issues_on_organizations` (
    `organization_id` VARCHAR(191) NOT NULL,
    `issue_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`organization_id`, `issue_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `m_issue_categories` (
    `id` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `m_issue_categories_on_issues` (
    `issue_id` VARCHAR(191) NOT NULL,
    `issue_category_id` INTEGER NOT NULL,

    PRIMARY KEY (`issue_id`, `issue_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `m_issue_categories_on_users` (
    `user_id` VARCHAR(191) NOT NULL,
    `issue_category_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `issue_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `m_skillsets` (
    `id` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_skillsets_on_users` (
    `user_id` VARCHAR(191) NOT NULL,
    `skillset_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`user_id`, `skillset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_skillsets_on_events` (
    `event_id` VARCHAR(191) NOT NULL,
    `skillset_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`event_id`, `skillset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_skillsets_on_issues` (
    `issue_id` VARCHAR(191) NOT NULL,
    `skillset_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`issue_id`, `skillset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_cities_on_issues` (
    `issue_id` VARCHAR(191) NOT NULL,
    `city_code` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`issue_id`, `city_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `t_activities` ADD CONSTRAINT `t_activities_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_activities` ADD CONSTRAINT `t_activities_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `t_issues`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_activities` ADD CONSTRAINT `t_activities_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `t_applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_applications` ADD CONSTRAINT `t_applications_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_applications` ADD CONSTRAINT `t_applications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_application_confirmations` ADD CONSTRAINT `t_application_confirmations_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `t_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_application_confirmations` ADD CONSTRAINT `t_application_confirmations_confirmer_id_fkey` FOREIGN KEY (`confirmer_id`) REFERENCES `t_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_issues_on_groups` ADD CONSTRAINT `t_issues_on_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_issues_on_groups` ADD CONSTRAINT `t_issues_on_groups_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `t_issues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_issues_on_organizations` ADD CONSTRAINT `t_issues_on_organizations_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_issues_on_organizations` ADD CONSTRAINT `t_issues_on_organizations_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `t_issues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_likes` ADD CONSTRAINT `t_likes_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `t_issues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_comments` ADD CONSTRAINT `t_comments_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `t_issues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `m_issue_categories_on_issues` ADD CONSTRAINT `m_issue_categories_on_issues_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `t_issues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `m_issue_categories_on_issues` ADD CONSTRAINT `m_issue_categories_on_issues_issue_category_id_fkey` FOREIGN KEY (`issue_category_id`) REFERENCES `m_issue_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `m_issue_categories_on_users` ADD CONSTRAINT `m_issue_categories_on_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `m_issue_categories_on_users` ADD CONSTRAINT `m_issue_categories_on_users_issue_category_id_fkey` FOREIGN KEY (`issue_category_id`) REFERENCES `m_issue_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_skillsets_on_users` ADD CONSTRAINT `t_skillsets_on_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_skillsets_on_users` ADD CONSTRAINT `t_skillsets_on_users_skillset_id_fkey` FOREIGN KEY (`skillset_id`) REFERENCES `m_skillsets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_skillsets_on_events` ADD CONSTRAINT `t_skillsets_on_events_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_skillsets_on_events` ADD CONSTRAINT `t_skillsets_on_events_skillset_id_fkey` FOREIGN KEY (`skillset_id`) REFERENCES `m_skillsets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_skillsets_on_issues` ADD CONSTRAINT `t_skillsets_on_issues_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `t_issues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_skillsets_on_issues` ADD CONSTRAINT `t_skillsets_on_issues_skillset_id_fkey` FOREIGN KEY (`skillset_id`) REFERENCES `m_skillsets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_issues` ADD CONSTRAINT `t_cities_on_issues_issue_id_fkey` FOREIGN KEY (`issue_id`) REFERENCES `t_issues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_issues` ADD CONSTRAINT `t_cities_on_issues_city_code_fkey` FOREIGN KEY (`city_code`) REFERENCES `m_cities`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ReplaceView
CREATE OR REPLACE VIEW `v_activities_stats` (
    `id`,
    `is_public`,
    `starts_at`,
    `ends_at`,
    `user_id`,
    `event_id`,
    `issue_id`,
    `total_minutes`
) AS (
     SELECT
         `id`,
         `is_public`,
         `starts_at`,
         `ends_at`,
         `user_id`,
         `event_id`,
         `issue_id`,
         TIMESTAMPDIFF(MINUTE, `starts_at`, `ends_at`)
     FROM `t_activities`
 );

-- CreateOrReplaceView
CREATE OR REPLACE VIEW `v_issues_stats` (
    `id`,
    `is_public`,
    `total_minutes`
) AS (
     SELECT
         `i`.`id`,
         `i`.`is_public`,
         SUM(`as`.`total_minutes`)
     FROM `t_issues` AS `i`
              LEFT JOIN `v_activities_stats` AS `as` ON `i`.`id` = `as`.`issue_id`
     GROUP BY `i`.`id`
 );
