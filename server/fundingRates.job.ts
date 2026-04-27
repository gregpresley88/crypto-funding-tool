/**
 * Background Job for Fetching and Storing Funding Rates
 * Runs periodically to keep the database updated with latest funding rates
 */

import { fetchAllFundingRates } from "./exchanges.service";
import { upsertLatestFundingRates, insertFundingRates } from "./fundingRates.db";
import type { InsertFundingRate, InsertFundingRateLatest } from "../drizzle/schema";

/**
 * Main job function to fetch and store funding rates
 */
export async function syncFundingRates(): Promise<void> {
  try {
    console.log("[FundingRates Job] Starting funding rate sync...");

    // Fetch latest funding rates from all exchanges
    const fundingRates = await fetchAllFundingRates();

    if (fundingRates.length === 0) {
      console.warn("[FundingRates Job] No funding rates fetched");
      return;
    }

    console.log(`[FundingRates Job] Fetched ${fundingRates.length} funding rates`);

    // Filter out invalid rates (NaN, Infinity, etc.)
    const validRates = fundingRates.filter((rate) => {
      return (
        typeof rate.fundingRate === "number" &&
        !isNaN(rate.fundingRate) &&
        isFinite(rate.fundingRate)
      );
    });

    if (validRates.length === 0) {
      console.warn("[FundingRates Job] No valid funding rates after filtering");
      return;
    }

    console.log(
      `[FundingRates Job] ${validRates.length} valid rates after filtering`
    );

    // Prepare data for storage
    const latestRates: InsertFundingRateLatest[] = validRates.map((rate) => ({
      symbol: rate.symbol,
      pair: `${rate.symbol}USDT`,
      exchange: rate.exchange,
      fundingRate: rate.fundingRate.toString(),
      timestamp: Math.floor(rate.fundingTime / 1000), // Convert to seconds
    }));

    // Store historical OHLC data (for now, using close price as all OHLC values)
    const historicalRates: InsertFundingRate[] = validRates.map((rate) => ({
      symbol: rate.symbol,
      pair: `${rate.symbol}USDT`,
      exchange: rate.exchange,
      open: rate.fundingRate.toString(),
      high: rate.fundingRate.toString(),
      low: rate.fundingRate.toString(),
      close: rate.fundingRate.toString(),
      timestamp: Math.floor(rate.fundingTime / 1000),
      interval: "1d",
    }));

    // Store data
    await Promise.all([
      upsertLatestFundingRates(latestRates),
      insertFundingRates(historicalRates),
    ]);

    console.log("[FundingRates Job] Successfully synced funding rates");
  } catch (error) {
    console.error("[FundingRates Job] Error syncing funding rates:", error);
    throw error;
  }
}

/**
 * Start the background job with a specified interval
 * @param intervalMs - Interval in milliseconds (default: 5 minutes)
 */
export function startFundingRatesJob(
  intervalMs: number = 5 * 60 * 1000
): NodeJS.Timer {
  console.log(`[FundingRates Job] Starting job with ${intervalMs}ms interval`);

  // Run immediately on startup
  syncFundingRates().catch((error) => {
    console.error("[FundingRates Job] Initial sync failed:", error);
  });

  // Then run periodically
  return setInterval(() => {
    syncFundingRates().catch((error) => {
      console.error("[FundingRates Job] Periodic sync failed:", error);
    });
  }, intervalMs);
}
