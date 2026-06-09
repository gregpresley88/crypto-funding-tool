import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

describe("ChartView Integration Test", () => {
  it("should have data available for the chart", async () => {
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });

    // Get latest rates to see what data is available
    const caller = appRouter.createCaller(ctx);
    const latest = await caller.fundingRates.getLatest();

    console.log(`\nLatest funding rates available: ${latest.length} records`);
    
    if (latest.length > 0) {
      // Group by symbol and exchange
      const pairs: Record<string, number> = {};
      latest.forEach((r: any) => {
        const key = `${r.symbol}/${r.exchange}`;
        pairs[key] = (pairs[key] || 0) + 1;
      });

      console.log("Available symbol/exchange pairs:");
      Object.entries(pairs).slice(0, 10).forEach(([pair, count]) => {
        console.log(`  ${pair}`);
      });

      // Test getting historical data for the first available pair
      const firstPair = latest[0];
      console.log(`\nTesting historical data for ${firstPair.symbol}/${firstPair.exchange}...`);

      const now = Math.floor(Date.now() / 1000);
      const sevenDaysAgo = now - 7 * 24 * 60 * 60;

      const history = await caller.fundingRates.getHistory({
        symbol: firstPair.symbol,
        exchange: firstPair.exchange,
        startTime: sevenDaysAgo,
        endTime: now,
        interval: "1d",
      });

      console.log(`- Historical records (7 days): ${history.length}`);
      
      if (history.length > 0) {
        console.log("- Sample data:");
        history.slice(0, 3).forEach((h: any) => {
          const date = new Date(h.timestamp * 1000).toISOString();
          console.log(`  ${date}: ${h.fundingRate}`);
        });
      }
    }

    expect(latest.length).toBeGreaterThan(0);
  });

  it("should calculate averages correctly", async () => {
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });

    const caller = appRouter.createCaller(ctx);

    // Test average for BTC/Binance
    const average = await caller.fundingRates.getAverageForTimeFrame({
      symbol: "BTC",
      exchange: "Binance",
      daysBack: 7,
    });

    console.log(`\nAverage funding rate for BTC/Binance (7 days):`);
    console.log(`- Average: ${average?.avgRate || "N/A"}`);
    console.log(`- Min: ${average?.minRate || "N/A"}`);
    console.log(`- Max: ${average?.maxRate || "N/A"}`);

    expect(average).toBeDefined();
  });
});
