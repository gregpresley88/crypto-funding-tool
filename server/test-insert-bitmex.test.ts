import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { fundingRatesLatest } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Insert BitMEX Data", () => {
  it("should insert BitMEX data with correct contract names", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    console.log("\n=== Inserting BitMEX Data ===");

    // Delete old BitMEX data
    await db.delete(fundingRatesLatest).where(eq(fundingRatesLatest.exchange, "BitMEX"));
    console.log("Deleted old BitMEX data");

    // Insert new BitMEX data
    const bitMexData = [
      {
        symbol: "BTC",
        pair: "XBTUSD",
        exchange: "BitMEX",
        fundingRate: "-0.000189",
        timestamp: 1781600680,
        interval: "1d" as const,
      },
      {
        symbol: "ETH",
        pair: "ETHXBT",
        exchange: "BitMEX",
        fundingRate: "-0.005474",
        timestamp: 1781600681,
        interval: "1d" as const,
      },
      {
        symbol: "LTC",
        pair: "LTCXBT",
        exchange: "BitMEX",
        fundingRate: "0.000331",
        timestamp: 1781600682,
        interval: "1d" as const,
      },
    ];

    await db.insert(fundingRatesLatest).values(bitMexData);
    console.log(`Inserted ${bitMexData.length} BitMEX records`);

    // Verify insertion
    const inserted = await db
      .select()
      .from(fundingRatesLatest)
      .where(eq(fundingRatesLatest.exchange, "BitMEX"));

    console.log(`\nVerification - BitMEX records in database: ${inserted.length}`);
    inserted.forEach((r) => {
      console.log(`  ${r.symbol}: ${r.pair} = ${r.fundingRate}`);
    });

    expect(inserted.length).toBe(3);
    expect(inserted[0].pair).toBe("XBTUSD");
    expect(inserted[1].pair).toBe("ETHXBT");
    expect(inserted[2].pair).toBe("LTCXBT");
  });
});
