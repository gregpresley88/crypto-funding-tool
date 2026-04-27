CREATE TABLE `trading_volume` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`pair` varchar(30) NOT NULL,
	`exchange` varchar(50) NOT NULL,
	`volume_24h` decimal(20,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trading_volume_id` PRIMARY KEY(`id`)
);
