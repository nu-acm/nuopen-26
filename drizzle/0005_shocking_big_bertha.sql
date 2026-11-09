ALTER TABLE `team` ADD `invite_token` text;--> statement-breakpoint
CREATE UNIQUE INDEX `team_invite_token_unique` ON `team` (`invite_token`);