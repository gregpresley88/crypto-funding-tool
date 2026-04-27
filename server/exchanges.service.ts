/**
 * Exchange Services for Fetching Funding Rates and Volume Data
 * Supports direct API calls to all major exchanges without authentication
 */

export interface FundingRateData {
  symbol: string;
  exchange: string;
  fundingRate: number;
  fundingTime: number;
  markPrice?: number;
  volume24h?: number;
}

/**
 * Top 30 cryptocurrencies by market cap (excluding stablecoins)
 */
export const TRADEABLE_SYMBOLS = [
  "BTC",
  "ETH",
  "XRP",
  "BNB",
  "SOL",
  "TRX",
  "DOGE",
  "HYPE",
  "LEO",
  "ADA",
  "BCH",
  "XMR",
  "LINK",
  "ZEC",
  "CC",
  "XLM",
  "MEME",
  "LTC",
  "AVAX",
  "HBAR",
  "SUI",
  "SHIB",
  "TON",
  "CRO",
];

/**
 * Top 20 derivative exchanges
 */
export const SUPPORTED_EXCHANGES = [
  "Binance",
  "OKX",
  "Bybit",
  "Gate",
  "Bitget",
  "KuCoin",
  "BingX",
  "XT.COM",
  "HTX",
  "Kraken",
  "Deribit",
  "MEXC",
  "BitMart",
  "Bitfinex",
  "LBank",
  "Gemini",
  "Crypto.com",
  "Toobit",
  "BTCC",
  "CoinW",
];

/**
 * Helper function to validate funding rate data
 */
function isValidFundingRate(rate: any): boolean {
  return typeof rate === "number" && !isNaN(rate) && isFinite(rate);
}

/**
 * Binance Futures API
 */
async function fetchBinanceFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol}USDT`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${pair}&limit=1`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1];
          const fundingRate = parseFloat(latest.fundingRate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "Binance",
              fundingRate,
              fundingTime: latest.fundingTime,
              markPrice: parseFloat(latest.markPrice),
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching Binance funding rates:", error);
    return [];
  }
}

/**
 * OKX API
 */
async function fetchOKXFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const instId = `${symbol}-USDT-SWAP`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://www.okx.com/api/v5/public/funding-rate?instId=${instId}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.code === "0" && data.data && data.data.length > 0) {
          const latest = data.data[0];
          const fundingRate = parseFloat(latest.fundingRate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "OKX",
              fundingRate,
              fundingTime: parseInt(latest.fundingTime),
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching OKX funding rates:", error);
    return [];
  }
}

/**
 * Bybit API
 */
async function fetchBybitFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol}USDT`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${pair}&limit=1`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (
          data.retCode === 0 &&
          data.result &&
          data.result.list &&
          data.result.list.length > 0
        ) {
          const latest = data.result.list[0];
          const fundingRate = parseFloat(latest.fundingRate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "Bybit",
              fundingRate,
              fundingTime: parseInt(latest.fundingRateTimestamp),
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching Bybit funding rates:", error);
    return [];
  }
}

/**
 * Gate.io API
 */
async function fetchGateFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol}_USDT`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://api.gateio.ws/api/v4/futures/usdt/funding_rate/${pair}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.funding_rate !== undefined) {
          const fundingRate = parseFloat(data.funding_rate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "Gate",
              fundingRate,
              fundingTime: data.funding_time
                ? parseInt(data.funding_time) * 1000
                : Date.now(),
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching Gate funding rates:", error);
    return [];
  }
}

/**
 * Bitget API
 */
async function fetchBitgetFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol}USDT`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://api.bitget.com/v2/public/market/funding-rate?symbol=${pair}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.code === "00000" && data.data) {
          const fundingRate = parseFloat(data.data.fundingRate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "Bitget",
              fundingRate,
              fundingTime: parseInt(data.data.fundingTime),
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching Bitget funding rates:", error);
    return [];
  }
}

/**
 * KuCoin API
 */
async function fetchKuCoinFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol}M`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://api.kucoin.com/api/v1/mark-price/${pair}/current`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (
          data.code === "200000" &&
          data.data &&
          data.data.fundingRate !== undefined
        ) {
          const fundingRate = parseFloat(data.data.fundingRate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "KuCoin",
              fundingRate,
              fundingTime: parseInt(data.data.timePoint),
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching KuCoin funding rates:", error);
    return [];
  }
}

/**
 * BingX API
 */
async function fetchBingXFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol}-USDT`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://open-api.bingx.com/openApi/swap/v2/public/currentFundingRate?symbol=${pair}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.code === 0 && data.data) {
          const fundingRate = parseFloat(data.data.fundingRate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "BingX",
              fundingRate,
              fundingTime: parseInt(data.data.fundingTime),
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching BingX funding rates:", error);
    return [];
  }
}

/**
 * XT.COM API
 */
async function fetchXTCOMFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol}USDT`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://api.xt.com/v4/public/funding-rate?symbol=${pair}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.code === 0 && data.data) {
          const fundingRate = parseFloat(data.data.fundingRate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "XT.COM",
              fundingRate,
              fundingTime: parseInt(data.data.timestamp),
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching XT.COM funding rates:", error);
    return [];
  }
}

/**
 * HTX (Huobi) API
 */
async function fetchHTXFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol.toLowerCase()}-usdt`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://api.hbdm.com/linear-swap-api/v1/swap_funding_rate?contract_code=${pair}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.status === "ok" && data.data) {
          const fundingRate = parseFloat(data.data.funding_rate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "HTX",
              fundingRate,
              fundingTime: data.data.funding_time,
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching HTX funding rates:", error);
    return [];
  }
}

/**
 * Kraken API - Note: Kraken doesn't expose funding rate in public API
 */
async function fetchKrakenFundingRates(): Promise<FundingRateData[]> {
  // Kraken doesn't have a public funding rate API endpoint
  return [];
}

/**
 * Deribit API
 */
async function fetchDeribitFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    // Deribit primarily supports BTC and ETH
    const deribitSymbols = ["BTC", "ETH"];

    for (const symbol of deribitSymbols) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://www.deribit.com/api/v2/public/get_funding_rate_history?instrument_name=${symbol}-PERPETUAL&count=1`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.result && data.result.length > 0) {
          const latest = data.result[0];
          const fundingRate = parseFloat(latest.interest_rate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "Deribit",
              fundingRate,
              fundingTime: latest.timestamp,
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching Deribit funding rates:", error);
    return [];
  }
}

/**
 * MEXC API
 */
async function fetchMEXCFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol}USDT`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `https://contract.mexc.com/api/v1/contract/funding_rate/${pair}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.code === 0 && data.data) {
          const fundingRate = parseFloat(data.data.fundingRate);

          if (isValidFundingRate(fundingRate)) {
            results.push({
              symbol,
              exchange: "MEXC",
              fundingRate,
              fundingTime: parseInt(data.data.fundingTime),
            });
          }
        }
      } catch (error) {
        // Silently continue on error
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching MEXC funding rates:", error);
    return [];
  }
}

/**
 * BitMart, Bitfinex, LBank, Gemini, Crypto.com, Toobit, BTCC, CoinW
 * These exchanges have limited or no public funding rate APIs
 * Placeholder implementations for future enhancement
 */
async function fetchOtherExchangesFundingRates(): Promise<FundingRateData[]> {
  // These exchanges either don't have public funding rate APIs or require authentication
  // They can be added in the future with proper API integration
  return [];
}

/**
 * Main function to fetch funding rates from all supported exchanges
 */
export async function fetchAllFundingRates(): Promise<FundingRateData[]> {
  const results: FundingRateData[] = [];

  // Fetch from all exchanges in parallel with error handling
  const [
    binanceRates,
    okxRates,
    bybitRates,
    gateRates,
    bitgetRates,
    kuCoinRates,
    bingXRates,
    xtcomRates,
    htxRates,
    krakenRates,
    deribitRates,
    mexcRates,
  ] = await Promise.allSettled([
    fetchBinanceFundingRates(),
    fetchOKXFundingRates(),
    fetchBybitFundingRates(),
    fetchGateFundingRates(),
    fetchBitgetFundingRates(),
    fetchKuCoinFundingRates(),
    fetchBingXFundingRates(),
    fetchXTCOMFundingRates(),
    fetchHTXFundingRates(),
    fetchKrakenFundingRates(),
    fetchDeribitFundingRates(),
    fetchMEXCFundingRates(),
  ]).then((settled) =>
    settled.map((result) => (result.status === "fulfilled" ? result.value : []))
  );

  results.push(
    ...binanceRates,
    ...okxRates,
    ...bybitRates,
    ...gateRates,
    ...bitgetRates,
    ...kuCoinRates,
    ...bingXRates,
    ...xtcomRates,
    ...htxRates,
    ...krakenRates,
    ...deribitRates,
    ...mexcRates
  );

  console.log(
    `[Exchanges] Fetched ${results.length} funding rates from ${new Set(results.map((r) => r.exchange)).size} exchanges`
  );

  return results;
}
