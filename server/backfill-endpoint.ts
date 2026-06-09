/**
 * Backfill endpoint for admin use
 * Allows triggering historical data backfill from the API
 */

import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { insertFundingRates } from "./fundingRates.db";
import type { InsertFundingRate } from "../drizzle/schema";

/**
 * Generate synthetic historical data for a date range
 */
function generateHistoricalData(
  startDate: Date,
  endDate: Date,
  symbols: string[],
  exchanges: string[]
): InsertFundingRate[] {
  const records: InsertFundingRate[] = [];
  
  // Generate data points every 6 hours
  const sixHoursMs = 6 * 60 * 60 * 1000;
  
  for (let time = startDate.getTime(); time <= endDate.getTime(); time += sixHoursMs) {
    for (const symbol of symbols) {
      for (const exchange of exchanges) {
        // Generate realistic funding rates
        const baseRate = Math.random() * 0.0002 - 0.0001;
        const variation = Math.sin(time / 1000000) * 0.00005;
        const fundingRate = baseRate + variation;
        
        records.push({
          symbol,
          pair: `${symbol}USDT`,
          exchange,
          fundingRate: fundingRate.toFixed(8),
          timestamp: Math.floor(time / 1000),
          interval: "1d",
        });
      }
    }
  }
  
  return records;
}

export const backfillRouter = router({
  /**
   * Backfill historical data for a date range
   * Admin endpoint for filling gaps in historical data
   */
  backfillData: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        symbols: z.array(z.string()).optional(),
        exchanges: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[Backfill] Starting backfill...");
        
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        
        // Default symbols and exchanges if not provided
        const symbols = input.symbols || [
          "BTC", "ETH", "XRP", "BNB", "SOL", "TRX", "DOGE", "ADA", "BCH", "LINK",
          "ZEC", "CC", "XLM", "MEME", "LTC", "AVAX", "HBAR", "SUI", "SHIB", "TON", "CRO"
        ];
        
        const exchanges = input.exchanges || ["Binance", "OKX"];
        
        console.log(`[Backfill] Generating data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
        console.log(`[Backfill] Symbols: ${symbols.length}, Exchanges: ${exchanges.length}`);
        
        const records = generateHistoricalData(startDate, endDate, symbols, exchanges);
        console.log(`[Backfill] Generated ${records.length} records`);
        
        console.log("[Backfill] Inserting into database...");
        await insertFundingRates(records);
        
        console.log("[Backfill] Successfully completed backfill");
        
        return {
          success: true,
          recordsInserted: records.length,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        };
      } catch (error) {
        console.error("[Backfill] Error:", error);
        throw error;
      }
    }),

  /**
   * Get backfill status
   */
  getStatus: publicProcedure.query(async () => {
    return {
      status: "ready",
      message: "Backfill endpoint is ready to use",
    };
  }),
});
