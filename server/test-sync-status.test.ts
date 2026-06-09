import { describe, it, expect } from "vitest";
import { getLatestFundingRates, getFundingRatesBySymbolAndExchange } from "./fundingRates.db";

describe("Check Sync Status", () => {
  it("should have latest funding rates in database", async () => {
    const latest = await getLatestFundingRates();
    
    console.log(`\nLatest funding rates in database: ${latest.length} records`);
    
    if (latest.length > 0) {
      const now = Math.floor(Date.now() / 1000);
      const timestamps = latest.map(r => r.timestamp);
      const newestTimestamp = Math.max(...timestamps);
      const oldestTimestamp = Math.min(...timestamps);
      
      console.log(`- Newest timestamp: ${newestTimestamp} (${now - newestTimestamp} seconds ago)`);
      console.log(`- Oldest timestamp: ${oldestTimestamp}`);
      
      // Group by exchange
      const byExchange: Record<string, number> = {};
      latest.forEach(r => {
        byExchange[r.exchange] = (byExchange[r.exchange] || 0) + 1;
      });
      
      console.log("\nLatest rates by exchange:");
      Object.entries(byExchange).forEach(([exchange, count]) => {
        console.log(`  ${exchange}: ${count} rates`);
      });
      
      // Show sample
      console.log("\nSample latest rates:");
      latest.slice(0, 5).forEach(r => {
        console.log(`  ${r.symbol}/${r.exchange}: ${r.fundingRate}`);
      });
    }

    expect(latest.length).toBeGreaterThan(0);
  });

  it("should have historical data for BTC/Binance", async () => {
    const history = await getFundingRatesBySymbolAndExchange("BTC", "Binance", 0, Math.floor(Date.now() / 1000));
    
    console.log(`\nHistorical data for BTC/Binance: ${history.length} records`);
    
    if (history.length > 0) {
      const timestamps = history.map(r => r.timestamp);
      console.log(`- Date range: ${new Date(Math.min(...timestamps) * 1000).toISOString()} to ${new Date(Math.max(...timestamps) * 1000).toISOString()}`);
      
      // Show sample
      console.log("\nSample historical rates:");
      history.slice(0, 5).forEach(r => {
        console.log(`  ${r.fundingRate} at ${new Date(r.timestamp * 1000).toISOString()}`);
      });
    }

    expect(history.length).toBeGreaterThan(0);
  });
});
