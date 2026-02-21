ALTER TABLE `agents` ADD `persona_id` text REFERENCES personas(id);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_name_unique` ON `teams` (`name`);