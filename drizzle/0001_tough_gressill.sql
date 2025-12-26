CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int NOT NULL,
	`userId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`companyName` varchar(255),
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`inquiryType` enum('spot','standard','grand','other') NOT NULL DEFAULT 'other',
	`message` text NOT NULL,
	`budget` varchar(100),
	`deadline` varchar(100),
	`referenceUrls` text,
	`hearingSheetData` json,
	`status` enum('new','in_progress','completed','cancelled') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int NOT NULL,
	`userId` int,
	`anonFingerprint` varchar(64),
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`identifier` varchar(128) NOT NULL,
	`action` varchar(50) NOT NULL,
	`count` int NOT NULL DEFAULT 1,
	`windowStart` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rate_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(50) NOT NULL,
	`url` text NOT NULL,
	`displayName` varchar(100),
	`iconName` varchar(50),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `tools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`url` text,
	`iconUrl` text,
	`category` varchar(50),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tools_id` PRIMARY KEY(`id`),
	CONSTRAINT `tools_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `work_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `work_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_tools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int NOT NULL,
	`toolId` int NOT NULL,
	CONSTRAINT `work_tools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`type` enum('image','video','audio','text','web') NOT NULL,
	`audioSubtype` enum('music','bgm','voice','sfx','podcast'),
	`title` varchar(255) NOT NULL,
	`description` text,
	`thumbnailUrl` text,
	`mediaUrl` text,
	`externalUrl` text,
	`textContent` text,
	`origin` enum('client','personal') NOT NULL DEFAULT 'personal',
	`serviceTier` enum('spot','standard','grand'),
	`promptText` text,
	`negativePrompt` text,
	`promptVisibility` enum('public','private') NOT NULL DEFAULT 'private',
	`lyrics` text,
	`likeCount` int NOT NULL DEFAULT 0,
	`commentCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`socialLinkSetId` int,
	`externalPostUrlX` text,
	`externalPostUrlInstagram` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `works_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;