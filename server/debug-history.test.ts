import { describe, it, expect } from "vitest";
import { getFundingRatesBySymbolAndExchange } from "./fundingRates.db";

describe("Debug Historical Data Query", () => {
  it("should return BTC/Binance historical data for last 7 days", async () => {
    const now = Date.now();
    const sevenDaysAgo = Math.floor((now - 7 * 24 * 60 * 60 * 1000) / 1000);
    const nowSeconds = Math.floor(now / 1000);

    console.log("Query parameters:");
    console.log("- Symbol: BTC");
    console.log("- Exchange: Binance");
    console.log("- Start time (seconds):", sevenDaysAgo);
    console.log("- End time (seconds):", nowSeconds);
    console.log("- Start date:", new Date(sevenDaysAgo * 1000).toISOString());
    console.log("- End date:", new Date(nowSeconds * 1000).toISOString());

    const data = await getFundingRatesBySymbolAndExchange(
      "BTC",
      "Binance",
      sevenDaysAgo,
      nowSeconds,
      "1d"
    );

    console.log("\nQuery result:");
    console.log("- Records returned:", data.length);
    if (data.length > 0) {
      console.log("- First record:", data[0]);
      console.log("- Last record:", data[data.length - 1]);
    }

    expect(data).toBeDefined();
  });

  it("should return all available BTC/Binance data", async () => {
    // Query with very old start time to get all data
    const data = await getFundingRatesBySymbolAndExchange(
      "BTC",
      "Binance",
      0, // Very old timestamp
      Math.floor(Date.now() / 1000), // Now
      "1d"
    );

    console.log("\nAll BTC/Binance data:");
    console.log("- Total records:", data.length);
    if (data.length > 0) {
      console.log("- Date range:", new Date(data[0].timestamp * 1000).toISOString(), "to", new Date(data[data.length - 1].timestamp * 1000).toISOString());
    }

    expect(data).toBeDefined();
  });
});
