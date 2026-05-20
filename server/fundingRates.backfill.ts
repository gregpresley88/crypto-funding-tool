import axios from "axios";
import { getDb } from "./db";
import { fundingRates } from "../drizzle/schema";

/**
 * Backfill historical funding rates from exchanges
 * Downloads past funding rates for a specified date range
 */

interface BackfillOptions {
  startDate: Date;
  endDate: Date;
  symbols?: string[];
}

/**
 * Fetch historical funding rates from Binance
 */
async function fetchBinanceHistoricalRates(
  symbol: string,
  startTime: number,
  endTime: number
): Promise<any[]> {
  try {
    const response = await axios.get("https://fapi.binance.com/fapi/v1/fundingRate", {
      params: {
        symbol: `${symbol}USDT`,
        startTime,
        endTime,
        limit: 1000,
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error(`[Backfill] Binance error for ${symbol}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Fetch historical funding rates from OKX
 */
async function fetchOKXHistoricalRates(
  symbol: string,
  startTime: number,
  endTime: number
): Promise<any[]> {
  try {
    const response = await axios.get("https://www.okx.com/api/v5/public/funding-rate-history", {
      params: {
        instId: `${symbol}-USDT-SWAP`,
        before: Math.floor(startTime / 1000),
        after: Math.floor(endTime / 1000),
        limit: 100,
      },
      timeout: 10000,
    });

    if (response.data.code === "0" && response.data.data) {
      return response.data.data.map((item: any) => ({
        symbol,
        exchange: "OKX",
        rate: parseFloat(item[1]),
        timestamp: Math.floor(parseInt(item[0]) / 1000),
      }));
    }
    return [];
  } catch (error) {
    console.error(`[Backfill] OKX error for ${symbol}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Backfill funding rates for a date range
 */
export async function backfillFundingRates(options: BackfillOptions): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  const { startDate, endDate, symbols = ["BTC", "ETH", "SOL", "XRP", "DOGE", "ADA", "AVAX", "MATIC", "LINK", "UNI"] } = options;

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  console.log(`[Backfill] Starting backfill from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  console.log(`[Backfill] Symbols: ${symbols.join(", ")}`);

  let successCount = 0;
  let failedCount = 0;

  // Fetch from Binance
  console.log("[Backfill] Fetching from Binance...");
  for (const symbol of symbols) {
    try {
      const rates = await fetchBinanceHistoricalRates(symbol, startTime, endTime);

      for (const rate of rates) {
        try {
          const timestamp = Math.floor(rate.fundingTime / 1000);
          const db = await getDb();
          if (!db) throw new Error("Database not connected");
          await db
            .insert(fundingRates)
            .values({
              symbol,
              pair: `${symbol}USDT`,
              exchange: "Binance",
              fundingRate: rate.fundingRate,
              timestamp,
            })
            .onDuplicateKeyUpdate({
              set: {
                fundingRate: rate.fundingRate,
              },
            });
          successCount++;
        } catch (error) {
          failedCount++;
        }
      }
    } catch (error) {
      console.error(`[Backfill] Error processing Binance ${symbol}:`, error);
    }
  }

  // Fetch from OKX
  console.log("[Backfill] Fetching from OKX...");
  for (const symbol of symbols) {
    try {
      const rates = await fetchOKXHistoricalRates(symbol, startTime, endTime);

      for (const rate of rates) {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not connected");
          await db
            .insert(fundingRates)
            .values({
              symbol: rate.symbol,
              pair: `${rate.symbol}USDT`,
              exchange: "OKX",
              fundingRate: rate.rate.toString(),
              timestamp: rate.timestamp,
            })
            .onDuplicateKeyUpdate({
              set: {
                fundingRate: rate.rate.toString(),
              },
            });
          successCount++;
        } catch (error) {
          failedCount++;
        }
      }
    } catch (error) {
      console.error(`[Backfill] Error processing OKX ${symbol}:`, error);
    }
  }

  console.log(`[Backfill] Complete! Success: ${successCount}, Failed: ${failedCount}`);
  return {
    success: successCount,
    failed: failedCount,
    total: successCount + failedCount,
  };
}
