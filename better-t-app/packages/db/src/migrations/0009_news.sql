CREATE TABLE `news` (
`id` text PRIMARY KEY NOT NULL,
`title` text NOT NULL,
`slug` text NOT NULL,
`content` text DEFAULT '' NOT NULL,
`excerpt` text DEFAULT '' NOT NULL,
`news_type` text DEFAULT 'personal' NOT NULL,
`is_published` integer DEFAULT false NOT NULL,
`published_at` integer,
`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_slug_unique` ON `news` (`slug`);--> statement-breakpoint
CREATE INDEX `news_slug_idx` ON `news` (`slug`);--> statement-breakpoint
CREATE INDEX `news_is_published_idx` ON `news` (`is_published`);--> statement-breakpoint
CREATE INDEX `news_published_at_idx` ON `news` (`published_at`);--> statement-breakpoint
CREATE INDEX `news_type_idx` ON `news` (`news_type`);
