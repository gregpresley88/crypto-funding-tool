import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Funding rate data table storing historical funding rates for cryptocurrencies across exchanges.
 * Each record represents a single OHLC (open, high, low, close) candle for a trading pair on an exchange.
 */
export const fundingRates = mysqlTable("funding_rates", {
  id: int("id").autoincrement().primaryKey(),
  /** Cryptocurrency symbol (e.g., "BTC", "ETH") */
  symbol: varchar("symbol", { length: 20 }).notNull(),
  /** Trading pair (e.g., "BTCUSDT") */
  pair: varchar("pair", { length: 30 }).notNull(),
  /** Exchange name (e.g., "Binance", "OKX") */
  exchange: varchar("exchange", { length: 50 }).notNull(),
  /** Opening funding rate for the period */
  open: decimal("open", { precision: 10, scale: 8 }).notNull(),
  /** Highest funding rate during the period */
  high: decimal("high", { precision: 10, scale: 8 }).notNull(),
  /** Lowest funding rate during the period */
  low: decimal("low", { precision: 10, scale: 8 }).notNull(),
  /** Closing funding rate for the period */
  close: decimal("close", { precision: 10, scale: 8 }).notNull(),
  /** Timestamp of the candle (milliseconds since epoch) */
  timestamp: int("timestamp").notNull(),
  /** Time interval of the candle (e.g., "1h", "1d") */
  interval: varchar("interval", { length: 10 }).notNull(),
  /** When this record was created in the database */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** When this record was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingRate = typeof fundingRates.$inferSelect;
export type InsertFundingRate = typeof fundingRates.$inferInsert;

/**
 * Cache table for latest funding rates to optimize dashboard performance.
 * Stores the most recent funding rate for each symbol-exchange pair.
 */
export const fundingRatesLatest = mysqlTable("funding_rates_latest", {
  id: int("id").autoincrement().primaryKey(),
  /** Cryptocurrency symbol (e.g., "BTC", "ETH") */
  symbol: varchar("symbol", { length: 20 }).notNull(),
  /** Trading pair (e.g., "BTCUSDT") */
  pair: varchar("pair", { length: 30 }).notNull(),
  /** Exchange name (e.g., "Binance", "OKX") */
  exchange: varchar("exchange", { length: 50 }).notNull(),
  /** Current funding rate */
  fundingRate: decimal("funding_rate", { precision: 10, scale: 8 }).notNull(),
  /** Timestamp of the latest data (milliseconds since epoch) */
  timestamp: int("timestamp").notNull(),
  /** When this record was created in the database */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** When this record was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingRateLatest = typeof fundingRatesLatest.$inferSelect;
export type InsertFundingRateLatest = typeof fundingRatesLatest.$inferInsert;
/**
 * 24-hour trading volume table for perpetual contracts.
 * Stores the 24h volume for each symbol-exchange pair.
 */
export const tradingVolume = mysqlTable("trading_volume", {
  id: int("id").autoincrement().primaryKey(),
  /** Cryptocurrency symbol (e.g., "BTC", "ETH") */
  symbol: varchar("symbol", { length: 20 }).notNull(),
  /** Trading pair (e.g., "BTCUSDT") */
  pair: varchar("pair", { length: 30 }).notNull(),
  /** Exchange name (e.g., "Binance", "OKX") */
  exchange: varchar("exchange", { length: 50 }).notNull(),
  /** 24-hour trading volume in USDT */
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }).notNull(),
  /** When this record was created in the database */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** When this record was last updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TradingVolume = typeof tradingVolume.$inferSelect;
export type InsertTradingVolume = typeof tradingVolume.$inferInsert;
