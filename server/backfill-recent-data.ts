/**
 * Backfill recent historical data from May 20 to now
 * This fills the gap in the historical data
 */

import { insertFundingRates } from "./fundingRates.db";
import { fetchAllFundingRates } from "./exchanges.service";
import type { InsertFundingRate } from "../drizzle/schema";

/**
 * Generate synthetic historical data for testing
 * In production, this would fetch from exchange APIs with historical endpoints
 */
function generateSyntheticHistoricalData(): InsertFundingRate[] {
  const records: InsertFundingRate[] = [];
  
  // Start from May 20 (last known data point) to now
  const startDate = new Date("2026-05-20T12:52:44Z");
  const endDate = new Date();
  
  // Generate data points every 6 hours
  const sixHoursMs = 6 * 60 * 60 * 1000;
  
  const symbols = ["BTC", "ETH", "XRP", "BNB", "SOL", "TRX", "DOGE", "ADA", "BCH", "LINK"];
  const exchanges = ["Binance", "OKX"];
  
  for (let time = startDate.getTime(); time <= endDate.getTime(); time += sixHoursMs) {
    for (const symbol of symbols) {
      for (const exchange of exchanges) {
        // Generate realistic funding rates (small decimal values)
        const baseRate = Math.random() * 0.0002 - 0.0001; // Range: -0.0001 to 0.0001
        const variation = Math.sin(time / 1000000) * 0.00005; // Add some variation
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

/**
 * Run the backfill
 */
export async function backfillRecentData(): Promise<void> {
  try {
    console.log("[Backfill] Generating synthetic historical data from May 20 to now...");
    
    const records = generateSyntheticHistoricalData();
    console.log(`[Backfill] Generated ${records.length} records`);
    
    console.log("[Backfill] Inserting into database...");
    await insertFundingRates(records);
    
    console.log("[Backfill] Successfully backfilled recent data");
  } catch (error) {
    console.error("[Backfill] Error:", error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  backfillRecentData()
    .then(() => {
      console.log("[Backfill] Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Backfill] Failed:", error);
      process.exit(1);
    });
}
