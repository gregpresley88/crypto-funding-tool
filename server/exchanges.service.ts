/**
 * Exchange Services for Fetching Funding Rates
 * Supports direct API calls to major exchanges without authentication
 */

export interface FundingRateData {
  symbol: string;
  exchange: string;
  fundingRate: number;
  fundingTime: number;
  markPrice?: number;
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
  "M",
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
 * Binance Futures API
 */
async function fetchBinanceFundingRates(): Promise<FundingRateData[]> {
  try {
    const results: FundingRateData[] = [];

    for (const symbol of TRADEABLE_SYMBOLS) {
      const pair = `${symbol}USDT`;
      const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${pair}&limit=1`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1];
          results.push({
            symbol,
            exchange: "Binance",
            fundingRate: parseFloat(latest.fundingRate),
            fundingTime: latest.fundingTime,
            markPrice: parseFloat(latest.markPrice),
          });
        }
      } catch (error) {
        console.error(`Error fetching Binance funding rate for ${pair}:`, error);
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
      const url = `https://www.okx.com/api/v5/public/funding-rate?instId=${instId}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.code === "0" && data.data && data.data.length > 0) {
          const latest = data.data[0];
          results.push({
            symbol,
            exchange: "OKX",
            fundingRate: parseFloat(latest.fundingRate),
            fundingTime: parseInt(latest.fundingTime),
          });
        }
      } catch (error) {
        console.error(`Error fetching OKX funding rate for ${instId}:`, error);
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
      const url = `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${pair}&limit=1`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.retCode === 0 && data.result && data.result.list && data.result.list.length > 0) {
          const latest = data.result.list[0];
          results.push({
            symbol,
            exchange: "Bybit",
            fundingRate: parseFloat(latest.fundingRate),
            fundingTime: parseInt(latest.fundingTimestamp),
          });
        }
      } catch (error) {
        console.error(`Error fetching Bybit funding rate for ${pair}:`, error);
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
      const url = `https://api.gateio.ws/api/v4/futures/usdt/funding_rate/${pair}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.funding_rate !== undefined) {
          results.push({
            symbol,
            exchange: "Gate",
            fundingRate: parseFloat(data.funding_rate),
            fundingTime: data.funding_time ? parseInt(data.funding_time) * 1000 : Date.now(),
          });
        }
      } catch (error) {
        console.error(`Error fetching Gate funding rate for ${pair}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching Gate funding rates:", error);
    return [];
  }
}

/**
 * Main function to fetch funding rates from all supported exchanges
 */
export async function fetchAllFundingRates(): Promise<FundingRateData[]> {
  const results: FundingRateData[] = [];

  // Fetch from all exchanges in parallel
  const [binanceRates, okxRates, bybitRates, gateRates] = await Promise.all([
    fetchBinanceFundingRates(),
    fetchOKXFundingRates(),
    fetchBybitFundingRates(),
    fetchGateFundingRates(),
  ]);

  results.push(...binanceRates, ...okxRates, ...bybitRates, ...gateRates);

  return results;
}

/**
 * Fetch funding rates for a specific exchange
 */
export async function fetchExchangeFundingRates(exchange: string): Promise<FundingRateData[]> {
  switch (exchange.toLowerCase()) {
    case "binance":
      return fetchBinanceFundingRates();
    case "okx":
      return fetchOKXFundingRates();
    case "bybit":
      return fetchBybitFundingRates();
    case "gate":
      return fetchGateFundingRates();
    default:
      console.warn(`Exchange ${exchange} not yet implemented`);
      return [];
  }
}

/**
 * Fetch funding rates for a specific symbol across all exchanges
 */
export async function fetchSymbolFundingRates(symbol: string): Promise<FundingRateData[]> {
  const allRates = await fetchAllFundingRates();
  return allRates.filter((rate) => rate.symbol === symbol);
}
