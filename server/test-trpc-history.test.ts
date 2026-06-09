import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

describe("tRPC getHistory Procedure", () => {
  it("should return historical data for BTC/Binance with 7-day range", async () => {
    // Create a mock context
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });

    // Calculate 7-day time range
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startTime = Math.floor(sevenDaysAgo.getTime() / 1000);
    const endTime = Math.floor(now.getTime() / 1000);

    console.log("Testing tRPC getHistory procedure:");
    console.log(`- Symbol: BTC`);
    console.log(`- Exchange: Binance`);
    console.log(`- Start time: ${startTime} (${sevenDaysAgo.toISOString()})`);
    console.log(`- End time: ${endTime} (${now.toISOString()})`);

    // Call the procedure
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fundingRates.getHistory({
      symbol: "BTC",
      exchange: "Binance",
      startTime,
      endTime,
      interval: "1d",
    });

    console.log(`\nResult: ${result.length} records`);
    if (result.length > 0) {
      console.log("Sample records:");
      result.slice(0, 3).forEach((r: any) => {
        console.log(`  - ${r.fundingRate} at ${new Date(r.timestamp * 1000).toISOString()}`);
      });
    }

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return all historical data for BTC/Binance", async () => {
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });

    // Query with very old start time
    const caller = appRouter.createCaller(ctx);
    const result = await caller.fundingRates.getHistory({
      symbol: "BTC",
      exchange: "Binance",
      startTime: 0,
      endTime: Math.floor(Date.now() / 1000),
      interval: "1d",
    });

    console.log(`\nAll historical data for BTC/Binance: ${result.length} records`);
    if (result.length > 0) {
      const timestamps = result.map((r: any) => r.timestamp);
      const minTs = Math.min(...timestamps);
      const maxTs = Math.max(...timestamps);
      console.log(`- Date range: ${new Date(minTs * 1000).toISOString()} to ${new Date(maxTs * 1000).toISOString()}`);
    }

    expect(result).toBeDefined();
  });
});
