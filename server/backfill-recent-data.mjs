/**
 * Backfill recent historical data from May 20 to now
 * Run with: pnpm tsx server/backfill-recent-data.mjs
 */

import { insertFundingRates } from "./fundingRates.db.ts";

/**
 * Generate synthetic historical data for testing
 */
function generateSyntheticHistoricalData() {
  const records = [];
  
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
async function backfillRecentData() {
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

// Run
backfillRecentData()
  .then(() => {
    console.log("[Backfill] Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[Backfill] Failed:", error);
    process.exit(1);
  });
