ALTER TABLE `personas` ADD `skill` text NOT NULL DEFAULT 'product-owner-discovery-spec';--> statement-breakpoint
ALTER TABLE `personas` DROP COLUMN `system_prompt`;--> statement-breakpoint
ALTER TABLE `personas` DROP COLUMN `input_schema`;--> statement-breakpoint
ALTER TABLE `personas` DROP COLUMN `output_schema`;
