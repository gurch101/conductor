CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'working',
	`summary` text,
	`tokens_used` integer DEFAULT 0,
	`input_schema` text,
	`output_schema` text,
	`pos_x` real DEFAULT 0,
	`pos_y` real DEFAULT 0,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` text NOT NULL,
	`source_id` text NOT NULL,
	`source_handle` text,
	`target_id` text NOT NULL,
	`target_handle` text,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` text NOT NULL,
	`content` text NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `personas` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`system_prompt` text NOT NULL,
	`input_schema` text DEFAULT '[]',
	`output_schema` text DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`objective` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
