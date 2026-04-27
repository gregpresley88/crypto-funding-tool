-- Create funding_rates table for historical OHLC data
CREATE TABLE IF NOT EXISTS `funding_rates` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `symbol` varchar(20) NOT NULL,
  `pair` varchar(30) NOT NULL,
  `exchange` varchar(50) NOT NULL,
  `open` decimal(10, 8) NOT NULL,
  `high` decimal(10, 8) NOT NULL,
  `low` decimal(10, 8) NOT NULL,
  `close` decimal(10, 8) NOT NULL,
  `timestamp` int NOT NULL,
  `interval` varchar(10) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_funding_rate` (`symbol`, `pair`, `exchange`, `timestamp`, `interval`),
  INDEX `idx_symbol` (`symbol`),
  INDEX `idx_exchange` (`exchange`),
  INDEX `idx_timestamp` (`timestamp`)
);

-- Create funding_rates_latest table for caching latest rates
CREATE TABLE IF NOT EXISTS `funding_rates_latest` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `symbol` varchar(20) NOT NULL,
  `pair` varchar(30) NOT NULL,
  `exchange` varchar(50) NOT NULL,
  `funding_rate` decimal(10, 8) NOT NULL,
  `timestamp` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_latest_rate` (`symbol`, `exchange`),
  INDEX `idx_symbol` (`symbol`),
  INDEX `idx_exchange` (`exchange`),
  INDEX `idx_updated` (`updatedAt`)
);
