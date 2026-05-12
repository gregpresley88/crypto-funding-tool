import { describe, it, expect, beforeAll } from "vitest";
import { getBestSpreads } from "./fundingRates.db";

describe("Best Spreads Calculation", () => {
  it("should calculate spreads from latest funding rates", async () => {
    const spreads = await getBestSpreads(5);
    
    console.log(`Found ${spreads.length} spreads`);
    
    if (spreads.length > 0) {
      console.log("Sample spread:", spreads[0]);
      
      // Verify spread structure
      expect(spreads[0]).toHaveProperty("symbol");
      expect(spreads[0]).toHaveProperty("highest");
      expect(spreads[0]).toHaveProperty("lowest");
      expect(spreads[0]).toHaveProperty("spread");
      
      // Verify highest and lowest have required fields
      expect(spreads[0].highest).toHaveProperty("exchange");
      expect(spreads[0].highest).toHaveProperty("rate");
      expect(spreads[0].highest).toHaveProperty("pair");
      
      expect(spreads[0].lowest).toHaveProperty("exchange");
      expect(spreads[0].lowest).toHaveProperty("rate");
      expect(spreads[0].lowest).toHaveProperty("pair");
      
      // Verify spread calculation
      const calculatedSpread = spreads[0].highest.rate - spreads[0].lowest.rate;
      expect(calculatedSpread).toBe(spreads[0].spread);
      expect(calculatedSpread).toBeGreaterThanOrEqual(0);
      
      // Verify highest is actually higher than lowest
      expect(spreads[0].highest.rate).toBeGreaterThanOrEqual(spreads[0].lowest.rate);
    } else {
      console.log("No spreads available - need data from multiple exchanges");
    }
  });

  it("should return spreads sorted by largest spread first", async () => {
    const spreads = await getBestSpreads(10);
    
    if (spreads.length > 1) {
      // Verify spreads are sorted in descending order
      for (let i = 0; i < spreads.length - 1; i++) {
        expect(spreads[i].spread).toBeGreaterThanOrEqual(spreads[i + 1].spread);
      }
      console.log(`✓ Spreads correctly sorted (${spreads.length} spreads)`);
    }
  });

  it("should respect the limit parameter", async () => {
    const limit3 = await getBestSpreads(3);
    const limit10 = await getBestSpreads(10);
    
    expect(limit3.length).toBeLessThanOrEqual(3);
    expect(limit10.length).toBeLessThanOrEqual(10);
    
    console.log(`Limit 3: ${limit3.length} spreads, Limit 10: ${limit10.length} spreads`);
  });
});
