/**
 * Coinglass API Service
 * Handles all communication with the Coinglass API for funding rate data
 */

const COINGLASS_API_BASE = "https://open-api-v4.coinglass.com/api";

export interface FundingRateCandle {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface CoingglassResponse {
  code: string;
  msg: string;
  data: FundingRateCandle[];
}

/**
 * Top 30 cryptocurrencies by market cap
 */
export const TOP_30_SYMBOLS = [
  "BTC",
  "ETH",
  "USDT",
  "XRP",
  "BNB",
  "USDC",
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
  "DAI",
  "USD1",
  "LTC",
  "AVAX",
  "HBAR",
  "USDe",
  "SUI",
  "SHIB",
  "PYUSD",
  "TON",
  "CRO",
];

/**
 * Top 20 derivative exchanges by volume
 */
export const TOP_20_EXCHANGES = [
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
 * Fetch funding rate history from Coinglass API
 * @param exchange - Exchange name (e.g., "Binance")
 * @param symbol - Trading pair (e.g., "BTCUSDT")
 * @param interval - Time interval (e.g., "1d", "1h")
 * @param limit - Number of results to fetch (max 1000)
 * @param apiKey - Coinglass API key
 */
export async function fetchFundingRateHistory(
  exchange: string,
  symbol: string,
  interval: string = "1d",
  limit: number = 100,
  apiKey: string
): Promise<FundingRateCandle[]> {
  const url = new URL(`${COINGLASS_API_BASE}/futures/funding-rate/history`);
  url.searchParams.append("exchange", exchange);
  url.searchParams.append("symbol", symbol);
  url.searchParams.append("interval", interval);
  url.searchParams.append("limit", limit.toString());

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        "CG-API-KEY": apiKey,
      },
    });

    if (!response.ok) {
      console.error(`Coinglass API error for ${exchange}/${symbol}: ${response.status}`);
      return [];
    }

    const data: CoingglassResponse = await response.json();

    if (data.code !== "0") {
      console.error(`Coinglass API error: ${data.msg}`);
      return [];
    }

    return data.data || [];
  } catch (error) {
    console.error(`Error fetching funding rates for ${exchange}/${symbol}:`, error);
    return [];
  }
}

/**
 * Convert symbol to trading pair format (e.g., "BTC" -> "BTCUSDT")
 */
export function symbolToTradingPair(symbol: string): string {
  // Stablecoins are handled specially
  if (["USDT", "USDC", "DAI", "USD1", "USDe", "PYUSD"].includes(symbol)) {
    return `${symbol}USDT`;
  }
  return `${symbol}USDT`;
}

/**
 * Get trading pair for a symbol on a specific exchange
 * Most exchanges use USDT as the quote, but some may differ
 */
export function getTradingPairForExchange(symbol: string, exchange: string): string {
  // For now, use standard USDT pairs for all exchanges
  // This can be extended if specific exchanges use different quote currencies
  return symbolToTradingPair(symbol);
}

/**
 * Validate if a symbol and exchange combination is supported
 */
export function isValidSymbolExchangePair(symbol: string, exchange: string): boolean {
  // Exclude stablecoins from analysis (they don't have meaningful funding rates)
  const stablecoins = ["USDT", "USDC", "DAI", "USD1", "USDe", "PYUSD"];
  if (stablecoins.includes(symbol)) {
    return false;
  }

  return TOP_30_SYMBOLS.includes(symbol) && TOP_20_EXCHANGES.includes(exchange);
}

/**
 * Get all valid symbol-exchange pairs for fetching
 */
export function getValidPairs(): Array<{ symbol: string; exchange: string }> {
  const pairs: Array<{ symbol: string; exchange: string }> = [];

  for (const symbol of TOP_30_SYMBOLS) {
    if (["USDT", "USDC", "DAI", "USD1", "USDe", "PYUSD"].includes(symbol)) {
      continue; // Skip stablecoins
    }

    for (const exchange of TOP_20_EXCHANGES) {
      pairs.push({ symbol, exchange });
    }
  }

  return pairs;
}
