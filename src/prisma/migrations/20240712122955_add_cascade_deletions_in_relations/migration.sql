-- DropForeignKey
ALTER TABLE `t_activities` DROP FOREIGN KEY `t_activities_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_activities` DROP FOREIGN KEY `t_activities_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_agendas_on_events` DROP FOREIGN KEY `t_agendas_on_events_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_agendas_on_groups` DROP FOREIGN KEY `t_agendas_on_groups_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_agendas_on_organizations` DROP FOREIGN KEY `t_agendas_on_organizations_organization_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_agendas_on_users` DROP FOREIGN KEY `t_agendas_on_users_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_cities_on_events` DROP FOREIGN KEY `t_cities_on_events_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_cities_on_groups` DROP FOREIGN KEY `t_cities_on_groups_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_cities_on_organizations` DROP FOREIGN KEY `t_cities_on_organizations_organization_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_cities_on_users` DROP FOREIGN KEY `t_cities_on_users_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_comments` DROP FOREIGN KEY `t_comments_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_comments` DROP FOREIGN KEY `t_comments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_events_on_groups` DROP FOREIGN KEY `t_events_on_groups_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_events_on_groups` DROP FOREIGN KEY `t_events_on_groups_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_events_on_organizations` DROP FOREIGN KEY `t_events_on_organizations_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_events_on_organizations` DROP FOREIGN KEY `t_events_on_organizations_organization_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_groups` DROP FOREIGN KEY `t_groups_organization_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_likes` DROP FOREIGN KEY `t_likes_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_likes` DROP FOREIGN KEY `t_likes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_targets` DROP FOREIGN KEY `t_targets_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_targets` DROP FOREIGN KEY `t_targets_organization_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_users_on_groups` DROP FOREIGN KEY `t_users_on_groups_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_users_on_groups` DROP FOREIGN KEY `t_users_on_groups_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_users_on_organizations` DROP FOREIGN KEY `t_users_on_organizations_organization_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_users_on_organizations` DROP FOREIGN KEY `t_users_on_organizations_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `t_groups` ADD CONSTRAINT `t_groups_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_users_on_groups` ADD CONSTRAINT `t_users_on_groups_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_users_on_groups` ADD CONSTRAINT `t_users_on_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_users_on_organizations` ADD CONSTRAINT `t_users_on_organizations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_users_on_organizations` ADD CONSTRAINT `t_users_on_organizations_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_activities` ADD CONSTRAINT `t_activities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_activities` ADD CONSTRAINT `t_activities_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_events_on_groups` ADD CONSTRAINT `t_events_on_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_events_on_groups` ADD CONSTRAINT `t_events_on_groups_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_events_on_organizations` ADD CONSTRAINT `t_events_on_organizations_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_events_on_organizations` ADD CONSTRAINT `t_events_on_organizations_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_likes` ADD CONSTRAINT `t_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_likes` ADD CONSTRAINT `t_likes_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_comments` ADD CONSTRAINT `t_comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_comments` ADD CONSTRAINT `t_comments_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_targets` ADD CONSTRAINT `t_targets_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_targets` ADD CONSTRAINT `t_targets_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_users` ADD CONSTRAINT `t_agendas_on_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_groups` ADD CONSTRAINT `t_agendas_on_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_organizations` ADD CONSTRAINT `t_agendas_on_organizations_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_agendas_on_events` ADD CONSTRAINT `t_agendas_on_events_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_users` ADD CONSTRAINT `t_cities_on_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_groups` ADD CONSTRAINT `t_cities_on_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `t_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_organizations` ADD CONSTRAINT `t_cities_on_organizations_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_cities_on_events` ADD CONSTRAINT `t_cities_on_events_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
