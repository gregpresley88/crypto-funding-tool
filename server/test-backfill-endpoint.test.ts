import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

describe("Backfill Endpoint", () => {
  it("should have backfill endpoint available", async () => {
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });
    const caller = appRouter.createCaller(ctx);

    // Check if backfill router exists
    const status = await caller.backfill.getStatus();
    console.log("\nBackfill endpoint status:", status);

    expect(status).toBeDefined();
    expect(status.status).toBe("ready");
  });

  it("should backfill data for a date range", async () => {
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });
    const caller = appRouter.createCaller(ctx);

    // Backfill data for a 1-day range
    const startDate = new Date("2026-05-25T00:00:00Z");
    const endDate = new Date("2026-05-26T00:00:00Z");

    console.log(`\nBackfilling data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const result = await caller.backfill.backfillData({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      symbols: ["BTC", "ETH"],
      exchanges: ["Binance", "OKX"],
    });

    console.log("Backfill result:");
    console.log(`- Success: ${result.success}`);
    console.log(`- Records inserted: ${result.recordsInserted}`);
    console.log(`- Date range: ${result.dateRange.start} to ${result.dateRange.end}`);

    expect(result.success).toBe(true);
    expect(result.recordsInserted).toBeGreaterThan(0);
  });
});
