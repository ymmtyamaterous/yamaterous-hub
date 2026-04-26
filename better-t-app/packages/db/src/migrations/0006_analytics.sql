CREATE TABLE IF NOT EXISTS `page_view` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`referrer` text,
	`ip_hash` text,
	`user_agent` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `page_view_path_idx` ON `page_view` (`path`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `page_view_created_at_idx` ON `page_view` (`created_at`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `click_event` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`target_id` text NOT NULL,
	`target_title` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `click_event_type_idx` ON `click_event` (`event_type`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `click_event_target_id_idx` ON `click_event` (`target_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `click_event_created_at_idx` ON `click_event` (`created_at`);
