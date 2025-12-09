CREATE TABLE `agentExecutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deploymentId` int NOT NULL,
	`status` enum('pending','running','completed','failed','timeout') NOT NULL DEFAULT 'pending',
	`input` json,
	`output` json,
	`error` text,
	`executionTimeMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `agentExecutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agentReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentTools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`toolName` varchar(255) NOT NULL,
	`toolType` enum('python','rest','cli','terraform','shell') NOT NULL,
	`description` text,
	`inputSchema` json,
	`outputSchema` json,
	`permissionLevel` enum('read','write','admin') NOT NULL DEFAULT 'read',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentTools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`version` varchar(50) NOT NULL DEFAULT '1.0.0',
	`status` enum('draft','verified','published','deprecated','retired') NOT NULL DEFAULT 'draft',
	`developerId` int NOT NULL,
	`icon` varchar(512),
	`basePrice` int DEFAULT 0,
	`billingModel` enum('per-task','monthly','per-agent') NOT NULL DEFAULT 'per-task',
	`rating` decimal(3,2) DEFAULT '0',
	`reviewCount` int DEFAULT 0,
	`downloadCount` int DEFAULT 0,
	`manifestUrl` varchar(512),
	`containerImage` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cloudCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cloudProvider` enum('gcp','aws','azure','on-prem') NOT NULL,
	`credentialsEncrypted` text NOT NULL,
	`isVerified` boolean DEFAULT false,
	`lastVerifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cloudCredentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deployments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentId` int NOT NULL,
	`deploymentType` enum('saas','byoc') NOT NULL,
	`status` enum('pending','deploying','running','failed','stopped') NOT NULL DEFAULT 'pending',
	`cloudProvider` enum('gcp','aws','azure','on-prem'),
	`config` json,
	`credentialsId` int,
	`deploymentUrl` varchar(512),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deployments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriptionId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`status` enum('draft','sent','paid','failed','refunded') NOT NULL DEFAULT 'draft',
	`stripeInvoiceId` varchar(255),
	`pdfUrl` varchar(512),
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`dueAt` timestamp,
	`paidAt` timestamp,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`ownerId` int NOT NULL,
	`description` text,
	`logo` varchar(512),
	`website` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentId` int NOT NULL,
	`billingModel` enum('per-task','monthly','per-agent') NOT NULL,
	`status` enum('active','paused','cancelled','expired') NOT NULL DEFAULT 'active',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`pricePerUnit` int,
	`currentUsage` int DEFAULT 0,
	`renewalDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','developer','operator') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `organizationId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `profilePicture` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;