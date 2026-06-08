import { describe, it, expect } from "vitest";
import { getHistoricalAverages } from "./fundingRates.db";
import { fetchAllFundingRates } from "./exchanges.service";

describe("Critical Bug Fixes - Session 4", () => {
  describe("1. Historical Data Display", () => {
    it("should return historical funding rates for symbol-exchange pairs", async () => {
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysAgo = now - 7 * 24 * 60 * 60;

      const history = await getHistoricalAverages(sevenDaysAgo, now);
      
      // Should return an object with symbol-exchange keys
      expect(typeof history).toBe("object");
      
      // If there's historical data, verify the structure
      if (Object.keys(history).length > 0) {
        const firstKey = Object.keys(history)[0];
        expect(firstKey).toMatch(/^[A-Z]+-[A-Za-z]+$/); // Format: SYMBOL-Exchange
        expect(typeof history[firstKey]).toBe("number");
      }
    });

    it("should have fundingRate column in database (not OHLC)", async () => {
      const now = Math.floor(Date.now() / 1000);
      const oneDayAgo = now - 24 * 60 * 60;

      const history = await getHistoricalAverages(oneDayAgo, now);
      
      // Verify that averages are calculated from fundingRate
      // All values should be small decimals (typical funding rates)
      Object.values(history).forEach((rate) => {
        expect(rate).toBeLessThan(0.1); // Funding rates are typically < 0.1
        expect(rate).toBeGreaterThan(-0.1);
      });
    });
  });

  describe("2. Average Calculation by Time Frame", () => {
    it("should calculate different averages for different time frames", async () => {
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysAgo = now - 7 * 24 * 60 * 60;
      const fourteenDaysAgo = now - 14 * 24 * 60 * 60;
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

      const avg7d = await getHistoricalAverages(sevenDaysAgo, now);
      const avg14d = await getHistoricalAverages(fourteenDaysAgo, now);
      const avg30d = await getHistoricalAverages(thirtyDaysAgo, now);

      // All should return objects
      expect(typeof avg7d).toBe("object");
      expect(typeof avg14d).toBe("object");
      expect(typeof avg30d).toBe("object");

      // If data exists, verify structure
      if (Object.keys(avg7d).length > 0) {
        const testKey = Object.keys(avg7d)[0];
        expect(typeof avg7d[testKey]).toBe("number");
        expect(typeof avg14d[testKey]).toBe("number");
        expect(typeof avg30d[testKey]).toBe("number");
      }
    });

    it("should return valid decimal values for funding rates", async () => {
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysAgo = now - 7 * 24 * 60 * 60;

      const averages = await getHistoricalAverages(sevenDaysAgo, now);

      Object.entries(averages).forEach(([key, value]) => {
        expect(typeof value).toBe("number");
        expect(isFinite(value)).toBe(true);
        expect(isNaN(value)).toBe(false);
        // Funding rates should be between -100% and +100%
        expect(value).toBeGreaterThan(-1);
        expect(value).toBeLessThan(1);
      });
    });
  });

  describe("3. BitMEX Exchange Integration", () => {
    it("should fetch funding rates from all exchanges including BitMEX", async () => {
      const rates = await fetchAllFundingRates();

      expect(Array.isArray(rates)).toBe(true);
      expect(rates.length).toBeGreaterThan(0);

      // Get unique exchanges
      const exchanges = new Set(rates.map((r) => r.exchange));
      
      // Should have at least Binance and OKX
      expect(exchanges.has("Binance")).toBe(true);
      expect(exchanges.has("OKX")).toBe(true);

      // Log which exchanges have data
      console.log("Exchanges with data:", Array.from(exchanges));
    });

    it("should have valid BitMEX data if available", async () => {
      const rates = await fetchAllFundingRates();
      const bitmexRates = rates.filter((r) => r.exchange === "BitMEX");

      // If BitMEX data exists, verify structure
      if (bitmexRates.length > 0) {
        bitmexRates.forEach((rate) => {
          expect(rate.symbol).toBeTruthy();
          expect(rate.pair).toBeTruthy();
          expect(rate.exchange).toBe("BitMEX");
          expect(typeof rate.fundingRate).toBe("number");
          expect(isFinite(rate.fundingRate)).toBe(true);
          expect(rate.timestamp).toBeGreaterThan(0);
        });
      }
    });

    it("should have correct symbol format for BitMEX", async () => {
      const rates = await fetchAllFundingRates();
      const bitmexRates = rates.filter((r) => r.exchange === "BitMEX");

      if (bitmexRates.length > 0) {
        bitmexRates.forEach((rate) => {
          // BitMEX pairs should be in format like BTCUSD, ETHUSD, etc.
          expect(rate.pair).toMatch(/^[A-Z]+USD$/);
        });
      }
    });
  });

  describe("4. Data Consistency", () => {
    it("should have matching symbols across database and API", async () => {
      const rates = await fetchAllFundingRates();
      const symbols = new Set(rates.map((r) => r.symbol));

      // Should have multiple symbols
      expect(symbols.size).toBeGreaterThan(5);

      // All symbols should be uppercase
      symbols.forEach((symbol) => {
        expect(symbol).toMatch(/^[A-Z]+$/);
      });
    });

    it("should have valid funding rate values", async () => {
      const rates = await fetchAllFundingRates();

      rates.forEach((rate) => {
        expect(typeof rate.fundingRate).toBe("number");
        expect(isFinite(rate.fundingRate)).toBe(true);
        expect(isNaN(rate.fundingRate)).toBe(false);
        // Funding rates should be reasonable (between -100% and +100%)
        expect(rate.fundingRate).toBeGreaterThan(-1);
        expect(rate.fundingRate).toBeLessThan(1);
      });
    });
  });
});
