CREATE TABLE IF NOT EXISTS `theme_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setting_key` text NOT NULL,
	`setting_value` text NOT NULL,
	`setting_type` text DEFAULT 'string' NOT NULL,
	`description` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `theme_settings_key_unique` ON `theme_settings` (`setting_key`);

INSERT OR IGNORE INTO `theme_settings` (setting_key, setting_value, setting_type, description, is_active) VALUES
('accent_color', '85 100% 65%', 'color', 'Primary accent color for the application', 1),
('accent_color_foreground', '0 0% 85%', 'color', 'Foreground color for accent elements', 1);
