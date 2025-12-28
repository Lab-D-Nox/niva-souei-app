CREATE TABLE `portfolio_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`position` enum('left','center','right') NOT NULL,
	`tier` enum('tier1','tier2','tier3','tier4','tier5') NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`description` text,
	`videoUrl` text,
	`thumbnailUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolio_items_id` PRIMARY KEY(`id`)
);
