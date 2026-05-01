CREATE TABLE `podcast` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`audio_url` text NOT NULL,
	`duration` integer,
	`file_size` integer,
	`mime_type` text,
	`is_published` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `podcast_slug_unique` ON `podcast` (`slug`);
--> statement-breakpoint
CREATE INDEX `podcast_slug_idx` ON `podcast` (`slug`);
--> statement-breakpoint
CREATE INDEX `podcast_is_published_idx` ON `podcast` (`is_published`);
--> statement-breakpoint
CREATE INDEX `podcast_published_at_idx` ON `podcast` (`published_at`);
--> statement-breakpoint
CREATE TABLE `podcast_category` (
	`podcast_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`podcast_id`, `category_id`),
	FOREIGN KEY (`podcast_id`) REFERENCES `podcast`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE cascade
);
