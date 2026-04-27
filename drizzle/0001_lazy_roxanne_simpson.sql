CREATE TABLE `funding_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`pair` varchar(30) NOT NULL,
	`exchange` varchar(50) NOT NULL,
	`open` decimal(10,8) NOT NULL,
	`high` decimal(10,8) NOT NULL,
	`low` decimal(10,8) NOT NULL,
	`close` decimal(10,8) NOT NULL,
	`timestamp` int NOT NULL,
	`interval` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funding_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funding_rates_latest` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`pair` varchar(30) NOT NULL,
	`exchange` varchar(50) NOT NULL,
	`funding_rate` decimal(10,8) NOT NULL,
	`timestamp` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funding_rates_latest_id` PRIMARY KEY(`id`)
);
