CREATE TABLE `waitlistSignups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waitlistSignups_id` PRIMARY KEY(`id`),
	CONSTRAINT `waitlistSignups_email_unique` UNIQUE(`email`)
);
