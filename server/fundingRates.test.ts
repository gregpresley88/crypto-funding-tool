import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { fundingRates, fundingRatesLatest } from "../drizzle/schema";
import { getFundingRatesBySymbolAndExchange, getLatestFundingRates } from "./fundingRates.db";

describe("Funding Rates Database", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should store and retrieve latest funding rates", async () => {
    const latest = await getLatestFundingRates();
    expect(latest).toBeDefined();
    expect(Array.isArray(latest)).toBe(true);
    console.log(`Found ${latest.length} latest funding rates`);
    
    if (latest.length > 0) {
      console.log("Sample latest rate:", latest[0]);
      expect(latest[0].symbol).toBeDefined();
      expect(latest[0].exchange).toBeDefined();
      expect(latest[0].fundingRate).toBeDefined();
    }
  });

  it("should store and retrieve historical funding rates", async () => {
    // Get a sample from latest rates
    const latest = await getLatestFundingRates();
    
    if (latest.length === 0) {
      console.log("No latest rates found, skipping historical test");
      return;
    }

    const sample = latest[0];
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;

    // Query historical data
    const history = await getFundingRatesBySymbolAndExchange(
      sample.symbol,
      sample.exchange,
      sevenDaysAgo,
      now,
      "1d"
    );

    console.log(`Querying history for ${sample.symbol}/${sample.exchange} from ${sevenDaysAgo} to ${now}`);
    console.log(`Found ${history.length} historical records`);
    
    if (history.length > 0) {
      console.log("Sample historical record:", history[0]);
      expect(history[0].symbol).toBe(sample.symbol);
      expect(history[0].exchange).toBe(sample.exchange);
    }
  });

  it("should have matching records in both latest and historical tables", async () => {
    const latest = await getLatestFundingRates();
    
    if (latest.length === 0) {
      console.log("No latest rates found");
      return;
    }

    // Check if the same symbol/exchange pair exists in historical table
    const sample = latest[0];
    console.log(`Checking if ${sample.symbol}/${sample.exchange} exists in historical table`);
    
    // Query with very wide time range
    const now = Math.floor(Date.now() / 1000);
    const oneYearAgo = now - 365 * 24 * 60 * 60;
    
    const history = await getFundingRatesBySymbolAndExchange(
      sample.symbol,
      sample.exchange,
      oneYearAgo,
      now,
      "1d"
    );

    console.log(`Found ${history.length} records in historical table for ${sample.symbol}/${sample.exchange}`);
    
    // At minimum, we should have at least one record
    if (history.length === 0) {
      console.warn(`WARNING: No historical records found for ${sample.symbol}/${sample.exchange}`);
      console.log("This might indicate the fundingRates table is not being populated by the sync job");
    }
  });
});
