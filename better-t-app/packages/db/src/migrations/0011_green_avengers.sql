CREATE TABLE `work_release_note` (
	`id` text PRIMARY KEY NOT NULL,
	`work_id` text NOT NULL,
	`version` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`work_id`) REFERENCES `work`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `work_release_note_work_id_idx` ON `work_release_note` (`work_id`);--> statement-breakpoint
CREATE INDEX `work_release_note_published_idx` ON `work_release_note` (`work_id`,`is_published`);--> statement-breakpoint
CREATE INDEX `work_release_note_published_at_idx` ON `work_release_note` (`published_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `work_release_note_work_version_idx` ON `work_release_note` (`work_id`,`version`);