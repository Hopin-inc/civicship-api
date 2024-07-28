-- DropForeignKey
ALTER TABLE `m_issue_categories_on_issues` DROP FOREIGN KEY `m_issue_categories_on_issues_issue_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `m_issue_categories_on_users` DROP FOREIGN KEY `m_issue_categories_on_users_issue_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_likes` DROP FOREIGN KEY `t_likes_event_id_fkey`;

-- AddForeignKey
ALTER TABLE `t_likes` ADD CONSTRAINT `t_likes_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `t_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `m_issue_categories_on_issues` ADD CONSTRAINT `m_issue_categories_on_issues_issue_category_id_fkey` FOREIGN KEY (`issue_category_id`) REFERENCES `m_issue_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `m_issue_categories_on_users` ADD CONSTRAINT `m_issue_categories_on_users_issue_category_id_fkey` FOREIGN KEY (`issue_category_id`) REFERENCES `m_issue_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
