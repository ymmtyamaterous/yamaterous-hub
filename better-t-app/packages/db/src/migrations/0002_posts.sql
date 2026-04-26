CREATE TABLE `post` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_slug_unique` ON `post` (`slug`);
--> statement-breakpoint
CREATE INDEX `post_slug_idx` ON `post` (`slug`);
--> statement-breakpoint
CREATE INDEX `post_is_published_idx` ON `post` (`is_published`);
--> statement-breakpoint
CREATE INDEX `post_published_at_idx` ON `post` (`published_at`);
