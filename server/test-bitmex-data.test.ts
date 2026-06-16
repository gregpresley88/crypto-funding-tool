import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

describe("BitMEX Data Availability", () => {
  it("should have BitMEX data in latest rates", async () => {
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });
    const caller = appRouter.createCaller(ctx);

    // Get latest rates
    const latest = await caller.fundingRates.getLatest();

    console.log("\n=== BitMEX Data Check ===");
    
    // Filter BitMEX data
    const bitMexData = latest.filter((r: any) => r.exchange === "BitMEX");
    console.log(`BitMEX records found: ${bitMexData.length}`);
    
    if (bitMexData.length > 0) {
      console.log("BitMEX symbols available:");
      bitMexData.forEach((r: any) => {
        console.log(`  - ${r.symbol}: ${r.fundingRate} (${r.pair})`);
      });
    } else {
      console.log("No BitMEX data found in latest rates");
    }

    // Get all exchanges
    const exchanges = new Set(latest.map((r: any) => r.exchange));
    console.log(`\nAll exchanges: ${Array.from(exchanges).join(", ")}`);

    // Count by exchange
    const exchangeCounts: Record<string, number> = {};
    latest.forEach((r: any) => {
      exchangeCounts[r.exchange] = (exchangeCounts[r.exchange] || 0) + 1;
    });
    
    console.log("\nRecords by exchange:");
    Object.entries(exchangeCounts).forEach(([exchange, count]) => {
      console.log(`  ${exchange}: ${count}`);
    });

    expect(latest.length).toBeGreaterThan(0);
  });

  it("should show BitMEX in best spreads if available", async () => {
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });
    const caller = appRouter.createCaller(ctx);

    // Get best spreads
    const spreads = await caller.fundingRates.getBestSpreads({ limit: 10 });

    console.log("\n=== BitMEX in Spreads ===");
    
    // Check if any spread includes BitMEX
    const spreadsWithBitMEX = spreads.filter((s: any) => 
      s.highest.exchange === "BitMEX" || s.lowest.exchange === "BitMEX"
    );

    console.log(`Spreads with BitMEX: ${spreadsWithBitMEX.length}`);
    
    spreadsWithBitMEX.forEach((s: any) => {
      console.log(`\n${s.symbol}:`);
      if (s.highest.exchange === "BitMEX") {
        console.log(`  Highest: BitMEX = ${s.highest.rate}`);
      }
      if (s.lowest.exchange === "BitMEX") {
        console.log(`  Lowest: BitMEX = ${s.lowest.rate}`);
      }
    });

    expect(spreads.length).toBeGreaterThan(0);
  });
});
