/**
 * CoinGecko API Service for fetching funding rates
 * Free tier: 10-50 calls/minute depending on endpoint
 * Covers all major exchanges with public APIs
 */

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

interface FundingRateData {
  symbol: string;
  pair: string;
  exchange: string;
  fundingRate: number;
  timestamp: number;
  contractName: string;
}

/**
 * Map CoinGecko exchange names to display names
 */
const EXCHANGE_NAME_MAP: Record<string, string> = {
  "binance": "Binance",
  "okx": "OKX",
  "bybit": "Bybit",
  "gateio": "Gate",
  "bitget": "Bitget",
  "kucoin": "KuCoin",
  "bingx": "BingX",
  "xt": "XT.COM",
  "huobi": "HTX",
  "kraken": "Kraken",
  "deribit": "Deribit",
  "mexc": "MEXC",
  "bitmart": "BitMart",
  "bitfinex": "Bitfinex",
  "lbank": "LBank",
  "gemini": "Gemini",
  "cryptocom": "Crypto.com",
  "toobit": "Toobit",
  "btcc": "BTCC",
  "coinw": "CoinW",
};

/**
 * Get funding rates from CoinGecko for a specific exchange
 */
async function getFundingRatesFromCoinGecko(
  exchange: string
): Promise<FundingRateData[]> {
  try {
    // CoinGecko derivatives endpoint
    const url = `${COINGECKO_API_BASE}/derivatives?exchanges=${exchange}&order=open_interest_desc&per_page=250&page=1`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`[CoinGecko] Failed to fetch ${exchange}: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Map CoinGecko response to our format
    return data
      .filter((item: any) => item.funding_rate !== null && item.funding_rate !== undefined)
      .map((item: any) => ({
        symbol: item.symbol?.toUpperCase() || item.name || "UNKNOWN",
        pair: item.symbol || "UNKNOWN",
        exchange: EXCHANGE_NAME_MAP[exchange] || exchange,
        fundingRate: parseFloat(item.funding_rate) || 0,
        timestamp: Math.floor(Date.now() / 1000),
        contractName: item.symbol || "UNKNOWN",
      }));
  } catch (error) {
    console.error(`[CoinGecko] Error fetching ${exchange}:`, error);
    return [];
  }
}

/**
 * Fetch funding rates from all supported exchanges
 */
export async function fetchAllFundingRatesFromCoinGecko(): Promise<FundingRateData[]> {
  const exchangeIds = Object.keys(EXCHANGE_NAME_MAP);

  const allRates: FundingRateData[] = [];

  // Fetch from each exchange with rate limiting
  for (const exchangeId of exchangeIds) {
    try {
      const rates = await getFundingRatesFromCoinGecko(exchangeId);
      allRates.push(...rates);
      // Rate limiting: wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[CoinGecko] Error processing ${exchangeId}:`, error);
    }
  }

  console.log(`[CoinGecko] Fetched ${allRates.length} funding rates from ${exchangeIds.length} exchanges`);
  return allRates;
}

/**
 * Export the exchange name map for use in other modules
 */
export function getExchangeNameMap(): Record<string, string> {
  return EXCHANGE_NAME_MAP;
}
