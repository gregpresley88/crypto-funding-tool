import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { fundingRates, fundingRatesLatest, InsertFundingRate, InsertFundingRateLatest } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Insert or update funding rate data
 */
export async function upsertFundingRate(data: InsertFundingRate): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(fundingRates)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        updatedAt: new Date(),
      },
    });
}

/**
 * Insert multiple funding rate records
 */
export async function insertFundingRates(records: InsertFundingRate[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (records.length === 0) return;

  // Insert in batches to avoid query size limits
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await db.insert(fundingRates).values(batch).onDuplicateKeyUpdate({
      set: {
        open: sql`VALUES(\`open\`)`,
        high: sql`VALUES(\`high\`)`,
        low: sql`VALUES(\`low\`)`,
        close: sql`VALUES(\`close\`)`,
        updatedAt: new Date(),
      },
    });
  }
}

/**
 * Get funding rate data for a specific symbol and exchange within a time range
 */
export async function getFundingRatesBySymbolAndExchange(
  symbol: string,
  exchange: string,
  startTime: number,
  endTime: number,
  interval: string = "1d"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(fundingRates)
    .where(
      and(
        eq(fundingRates.symbol, symbol),
        eq(fundingRates.exchange, exchange),
        eq(fundingRates.interval, interval),
        gte(fundingRates.timestamp, startTime),
        lte(fundingRates.timestamp, endTime)
      )
    )
    .orderBy(asc(fundingRates.timestamp));
}

/**
 * Get latest funding rates for all symbols and exchanges
 */
export async function getLatestFundingRates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(fundingRatesLatest).orderBy(desc(fundingRatesLatest.updatedAt));
}

/**
 * Get latest funding rates for a specific symbol across all exchanges
 */
export async function getLatestFundingRatesBySymbol(symbol: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(fundingRatesLatest)
    .where(eq(fundingRatesLatest.symbol, symbol))
    .orderBy(desc(fundingRatesLatest.exchange));
}

/**
 * Get latest funding rates for a specific exchange across all symbols
 */
export async function getLatestFundingRatesByExchange(exchange: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(fundingRatesLatest)
    .where(eq(fundingRatesLatest.exchange, exchange))
    .orderBy(desc(fundingRatesLatest.symbol));
}

/**
 * Upsert latest funding rate
 */
export async function upsertLatestFundingRate(data: InsertFundingRateLatest): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(fundingRatesLatest)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        fundingRate: data.fundingRate,
        timestamp: data.timestamp,
        updatedAt: new Date(),
      },
    });
}

/**
 * Upsert multiple latest funding rates
 */
export async function upsertLatestFundingRates(records: InsertFundingRateLatest[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (records.length === 0) return;

  for (const record of records) {
    await upsertLatestFundingRate(record);
  }
}

/**
 * Calculate average funding rate for a symbol across all exchanges
 */
export async function getAverageFundingRateBySymbol(
  symbol: string,
  startTime: number,
  endTime: number,
  interval: string = "1d"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      symbol: fundingRates.symbol,
      avgClose: sql<string>`AVG(CAST(${fundingRates.close} AS DECIMAL(10,8)))`,
      minClose: sql<string>`MIN(CAST(${fundingRates.close} AS DECIMAL(10,8)))`,
      maxClose: sql<string>`MAX(CAST(${fundingRates.close} AS DECIMAL(10,8)))`,
    })
    .from(fundingRates)
    .where(
      and(
        eq(fundingRates.symbol, symbol),
        eq(fundingRates.interval, interval),
        gte(fundingRates.timestamp, startTime),
        lte(fundingRates.timestamp, endTime)
      )
    )
    .groupBy(fundingRates.symbol);

  return result[0] || null;
}

/**
 * Get all unique symbols in the database
 */
export async function getAllSymbols() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .selectDistinct({ symbol: fundingRates.symbol })
    .from(fundingRates)
    .orderBy(asc(fundingRates.symbol));

  return result.map((r) => r.symbol);
}

/**
 * Get all unique exchanges in the database
 */
export async function getAllExchanges() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .selectDistinct({ exchange: fundingRates.exchange })
    .from(fundingRates)
    .orderBy(asc(fundingRates.exchange));

  return result.map((r) => r.exchange);
}


/**
 * Get average funding rate for a symbol-exchange pair over a time period
 * Used for time frame analysis (7, 14, 30 days)
 */
export async function getAverageFundingRateForTimeFrame(
  symbol: string,
  exchange: string,
  daysBack: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = Date.now();
  const startTime = now - daysBack * 24 * 60 * 60 * 1000;

  const result = await db
    .select({
      symbol: fundingRatesLatest.symbol,
      exchange: fundingRatesLatest.exchange,
      avgRate: sql<string>`AVG(CAST(${fundingRatesLatest.fundingRate} AS DECIMAL(10,8)))`,
      minRate: sql<string>`MIN(CAST(${fundingRatesLatest.fundingRate} AS DECIMAL(10,8)))`,
      maxRate: sql<string>`MAX(CAST(${fundingRatesLatest.fundingRate} AS DECIMAL(10,8)))`,
    })
    .from(fundingRatesLatest)
    .where(
      and(
        eq(fundingRatesLatest.symbol, symbol),
        eq(fundingRatesLatest.exchange, exchange),
        gte(fundingRatesLatest.updatedAt, new Date(startTime))
      )
    )
    .groupBy(fundingRatesLatest.symbol, fundingRatesLatest.exchange);

  return result[0] || null;
}
