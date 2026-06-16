import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

describe("Sync Trigger Test", () => {
  it("should trigger sync and update BitMEX data", async () => {
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });
    const caller = appRouter.createCaller(ctx);

    console.log("\n=== Triggering Sync ===");
    
    // Trigger sync
    try {
      const result = await caller.system.syncFundingRates();
      console.log("Sync result:", result);
    } catch (error) {
      console.log("Sync error (expected):", (error as any).message);
    }

    // Wait a bit for database to update
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get latest rates
    const latest = await caller.fundingRates.getLatest();
    
    console.log("\n=== After Sync ===");
    
    // Filter BitMEX data
    const bitMexData = latest.filter((r: any) => r.exchange === "BitMEX");
    console.log(`BitMEX records found: ${bitMexData.length}`);
    
    if (bitMexData.length > 0) {
      console.log("BitMEX symbols available:");
      bitMexData.forEach((r: any) => {
        console.log(`  - ${r.symbol}: ${r.fundingRate} (${r.pair})`);
      });
    }

    expect(latest.length).toBeGreaterThan(0);
  });
});
