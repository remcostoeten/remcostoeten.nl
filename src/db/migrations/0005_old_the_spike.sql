CREATE TABLE `global_layout_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setting_key` text NOT NULL,
	`setting_value` text NOT NULL,
	`setting_type` text DEFAULT 'string' NOT NULL,
	`description` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `global_layout_settings_setting_key_unique` ON `global_layout_settings` (`setting_key`);--> statement-breakpoint
CREATE TABLE `layout_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page_id` integer,
	`setting_key` text NOT NULL,
	`setting_value` text NOT NULL,
	`setting_type` text DEFAULT 'string' NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `layout_settings_page_key_unique` ON `layout_settings` (`page_id`,`setting_key`);