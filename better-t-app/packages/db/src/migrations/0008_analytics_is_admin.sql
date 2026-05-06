ALTER TABLE `page_view` ADD COLUMN `is_admin` integer;
--> statement-breakpoint
ALTER TABLE `click_event` ADD COLUMN `is_admin` integer;
