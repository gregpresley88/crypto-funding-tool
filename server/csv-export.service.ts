import { getDb } from "./db";
import { fundingRates } from "../drizzle/schema";

interface CSVRow {
  timestamp: string;
  exchange: string;
  symbol: string;
  contract_name: string;
  funding_rate: string;
}

/**
 * Export all funding rates as CSV
 * Fields: timestamp, exchange, symbol, contract_name, funding_rate
 */
export async function exportFundingRatesAsCSV(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch all funding rate records
  const records = await db.select().from(fundingRates).orderBy(fundingRates.timestamp);

  // Convert to CSV format
  const csvRows: CSVRow[] = records.map((record: any) => ({
    timestamp: new Date(record.timestamp * 1000).toISOString(),
    exchange: record.exchange,
    symbol: record.symbol,
    contract_name: record.pair,
    funding_rate: record.close,
  }));

  // Create CSV header
  const header = "timestamp,exchange,symbol,contract_name,funding_rate\n";

  // Create CSV body
  const body = csvRows
    .map(
      (row) =>
        `"${row.timestamp}","${row.exchange}","${row.symbol}","${row.contract_name}","${row.funding_rate}"`
    )
    .join("\n");

  return header + body;
}

/**
 * Export latest funding rates as CSV
 */
export async function exportLatestFundingRatesAsCSV(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch latest funding rates
  const { fundingRatesLatest } = await import("../drizzle/schema");
  const records = await db.select().from(fundingRatesLatest);

  // Convert to CSV format
  const csvRows: CSVRow[] = records.map((record: any) => ({
    timestamp: new Date(record.timestamp * 1000).toISOString(),
    exchange: record.exchange,
    symbol: record.symbol,
    contract_name: record.pair,
    funding_rate: record.fundingRate,
  }));

  // Create CSV header
  const header = "timestamp,exchange,symbol,contract_name,funding_rate\n";

  // Create CSV body
  const body = csvRows
    .map(
      (row) =>
        `"${row.timestamp}","${row.exchange}","${row.symbol}","${row.contract_name}","${row.funding_rate}"`
    )
    .join("\n");

  return header + body;
}

/**
 * Export funding rates for a specific date range as CSV
 */
export async function exportFundingRatesByDateRangeAsCSV(
  startDate: Date,
  endDate: Date
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  // Fetch records within date range
  const { gte, lte } = await import("drizzle-orm");
  const records = await db
    .select()
    .from(fundingRates)
    .where(
      gte(fundingRates.timestamp, startTimestamp) &&
        lte(fundingRates.timestamp, endTimestamp)
    )
    .orderBy(fundingRates.timestamp);

  // Convert to CSV format
  const csvRows: CSVRow[] = records.map((record: any) => ({
    timestamp: new Date(record.timestamp * 1000).toISOString(),
    exchange: record.exchange,
    symbol: record.symbol,
    contract_name: record.pair,
    funding_rate: record.close,
  }));

  // Create CSV header
  const header = "timestamp,exchange,symbol,contract_name,funding_rate\n";

  // Create CSV body
  const body = csvRows
    .map(
      (row) =>
        `"${row.timestamp}","${row.exchange}","${row.symbol}","${row.contract_name}","${row.funding_rate}"`
    )
    .join("\n");

  return header + body;
}
