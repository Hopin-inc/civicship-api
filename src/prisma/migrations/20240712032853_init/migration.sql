-- CreateTable
CREATE TABLE `t_users` (
    `id` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `middle_name` VARCHAR(191) NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_groups` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `parent_id` VARCHAR(191) NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_users_on_groups` (
    `user_id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,
    `added_at` DATETIME(3) NULL,
    `removed_at` DATETIME(3) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`user_id`, `group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_organizations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NULL,
    `entity_position` ENUM('PREFIX', 'SUFFIX') NULL,
    `image` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `established_at` DATETIME(3) NULL,
    `website` VARCHAR(191) NULL,
    `zipcode` VARCHAR(7) NOT NULL,
    `state_code` VARCHAR(191) NOT NULL,
    `state_country_code` VARCHAR(191) NOT NULL,
    `city_code` VARCHAR(191) NOT NULL,
    `address1` VARCHAR(191) NOT NULL,
    `address2` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_users_on_organizations` (
    `user_id` VARCHAR(191) NOT NULL,
    `organization_id` VARCHAR(191) NOT NULL,
    `display_name` VARCHAR(191) NULL,
    `display_image` VARCHAR(191) NULL,
    `added_at` DATETIME(3) NULL,
    `removed_at` DATETIME(3) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`user_id`, `organization_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_activities` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `images` JSON NOT NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_events` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `images` JSON NOT NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `planned_starts_at` DATETIME(3) NULL,
    `planned_ends_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_events_on_groups` (
    `group_id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`group_id`, `event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_events_on_organizations` (
    `organization_id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`organization_id`, `event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_likes` (
    `user_id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `posted_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`user_id`, `event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_comments` (
    `id` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `posted_at` DATETIME(3) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_targets` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `valid_from` DATETIME(3) NOT NULL,
    `valid_to` DATETIME(3) NOT NULL,
    `organization_id` VARCHAR(191) NULL,
    `group_id` VARCHAR(191) NULL,
    `index_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `m_agendas` (
    `id` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_agendas_on_users` (
    `user_id` VARCHAR(191) NOT NULL,
    `agenda_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`user_id`, `agenda_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_agendas_on_groups` (
    `group_id` VARCHAR(191) NOT NULL,
    `agenda_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`group_id`, `agenda_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_agendas_on_organizations` (
    `organization_id` VARCHAR(191) NOT NULL,
    `agenda_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`organization_id`, `agenda_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_agendas_on_events` (
    `event_id` VARCHAR(191) NOT NULL,
    `agenda_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`event_id`, `agenda_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `m_cities` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `state_code` VARCHAR(191) NOT NULL,
    `country_code` CHAR(2) NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `m_states` (
    `code` VARCHAR(191) NOT NULL,
    `country_code` CHAR(2) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`code`, `country_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_cities_on_users` (
    `user_id` VARCHAR(191) NOT NULL,
    `city_code` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`user_id`, `city_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_cities_on_groups` (
    `group_id` VARCHAR(191) NOT NULL,
    `city_code` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`group_id`, `city_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_cities_on_organizations` (
    `organization_id` VARCHAR(191) NOT NULL,
    `city_code` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`organization_id`, `city_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_cities_on_events` (
    `event_id` VARCHAR(191) NOT NULL,
    `city_code` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`event_id`, `city_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_indexes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `value_type` ENUM('INT', 'FLOAT') NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `t_groups` ADD CONSTRAINT `t_groups_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `t_groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_groups` ADD CONSTRAINT `t_groups_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_users_on_groups` ADD CONSTRAINT `t_users_on_groups_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_users_on_groups` ADD CONSTRAINT `t_users_on_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_organizations` ADD CONSTRAINT `t_organizations_state_code_state_country_code_fkey` FOREIGN KEY (`state_code`, `state_country_code`) REFERENCES `m_states`(`code`, `country_code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_organizations` ADD CONSTRAINT `t_organizations_city_code_fkey` FOREIGN KEY (`city_code`) REFERENCES `m_cities`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_users_on_organizations` ADD CONSTRAINT `t_users_on_organizations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_users_on_organizations` ADD CONSTRAINT `t_users_on_organizations_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_activities` ADD CONSTRAINT `t_activities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_activities` ADD CONSTRAINT `t_activities_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_events_on_groups` ADD CONSTRAINT `t_events_on_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_events_on_groups` ADD CONSTRAINT `t_events_on_groups_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_events_on_organizations` ADD CONSTRAINT `t_events_on_organizations_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_events_on_organizations` ADD CONSTRAINT `t_events_on_organizations_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_likes` ADD CONSTRAINT `t_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_likes` ADD CONSTRAINT `t_likes_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_comments` ADD CONSTRAINT `t_comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_comments` ADD CONSTRAINT `t_comments_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_targets` ADD CONSTRAINT `t_targets_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_targets` ADD CONSTRAINT `t_targets_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_targets` ADD CONSTRAINT `t_targets_index_id_fkey` FOREIGN KEY (`index_id`) REFERENCES `t_indexes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_users` ADD CONSTRAINT `t_agendas_on_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_users` ADD CONSTRAINT `t_agendas_on_users_agenda_id_fkey` FOREIGN KEY (`agenda_id`) REFERENCES `m_agendas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_groups` ADD CONSTRAINT `t_agendas_on_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_groups` ADD CONSTRAINT `t_agendas_on_groups_agenda_id_fkey` FOREIGN KEY (`agenda_id`) REFERENCES `m_agendas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_organizations` ADD CONSTRAINT `t_agendas_on_organizations_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_organizations` ADD CONSTRAINT `t_agendas_on_organizations_agenda_id_fkey` FOREIGN KEY (`agenda_id`) REFERENCES `m_agendas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_events` ADD CONSTRAINT `t_agendas_on_events_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_events` ADD CONSTRAINT `t_agendas_on_events_agenda_id_fkey` FOREIGN KEY (`agenda_id`) REFERENCES `m_agendas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `m_cities` ADD CONSTRAINT `m_cities_state_code_country_code_fkey` FOREIGN KEY (`state_code`, `country_code`) REFERENCES `m_states`(`code`, `country_code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_users` ADD CONSTRAINT `t_cities_on_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_users` ADD CONSTRAINT `t_cities_on_users_city_code_fkey` FOREIGN KEY (`city_code`) REFERENCES `m_cities`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_groups` ADD CONSTRAINT `t_cities_on_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_groups` ADD CONSTRAINT `t_cities_on_groups_city_code_fkey` FOREIGN KEY (`city_code`) REFERENCES `m_cities`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_organizations` ADD CONSTRAINT `t_cities_on_organizations_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_organizations` ADD CONSTRAINT `t_cities_on_organizations_city_code_fkey` FOREIGN KEY (`city_code`) REFERENCES `m_cities`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_events` ADD CONSTRAINT `t_cities_on_events_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_events` ADD CONSTRAINT `t_cities_on_events_city_code_fkey` FOREIGN KEY (`city_code`) REFERENCES `m_cities`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;
