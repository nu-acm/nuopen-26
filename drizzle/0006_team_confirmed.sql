ALTER TABLE `team` ADD `confirmed` integer DEFAULT false NOT NULL;--> statement-breakpoint
-- Teams start unconfirmed; those already numbered were confirmed when they got their number.
UPDATE `team` SET `confirmed` = true WHERE `number` IS NOT NULL;
