import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

describe("Best Spreads Calculation", () => {
  it("should calculate spreads for same symbol across exchanges", async () => {
    const mockReq = {
      headers: {},
      url: "/api/trpc",
    } as any;

    const mockRes = {} as any;

    const ctx = await createContext({ req: mockReq, res: mockRes });
    const caller = appRouter.createCaller(ctx);

    // Get best spreads
    const spreads = await caller.fundingRates.getBestSpreads({ limit: 10 });

    console.log("\n=== Best Spreads ===");
    console.log(`Total spreads found: ${spreads.length}`);

    spreads.forEach((spread: any, index: number) => {
      console.log(`\n#${index + 1}: ${spread.symbol}`);
      console.log(`  Spread: ${spread.spread}`);
      console.log(`  Highest: ${spread.highest.exchange} = ${spread.highest.rate}`);
      console.log(`  Lowest: ${spread.lowest.exchange} = ${spread.lowest.rate}`);
      console.log(`  Highest pair: ${spread.highest.pair}`);
      console.log(`  Lowest pair: ${spread.lowest.pair}`);
    });

    expect(spreads).toBeDefined();
    expect(spreads.length).toBeGreaterThan(0);

    // Verify each spread is for the same symbol
    spreads.forEach((spread: any) => {
      expect(spread.symbol).toBeDefined();
      expect(spread.highest.rate).toBeGreaterThanOrEqual(spread.lowest.rate);
      console.log(`✓ Spread for ${spread.symbol} is valid`);
    });
  });
});
