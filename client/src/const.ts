export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

/**
 * Crypto Funding Rate Dashboard Constants
 */

/**
 * Top 30 cryptocurrencies by market cap (excluding stablecoins for funding rate analysis)
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
 * Top 20 derivative exchanges by volume
 */
export const EXCHANGES = [
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
 * Time frame options for historical data analysis
 */
export const TIME_FRAMES = [
  { label: "7 Days", value: 7, days: 7 },
  { label: "14 Days", value: 14, days: 14 },
  { label: "30 Days", value: 30, days: 30 },
];

/**
 * Auto-refresh interval in milliseconds (5 minutes)
 */
export const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

/**
 * Funding rate thresholds (as decimals, e.g., 0.001 = 0.1%)
 */
export const FUNDING_RATE_THRESHOLDS = {
  highPositive: 0.0005, // 0.05%
  lowPositive: 0.0001, // 0.01%
  highNegative: -0.0005, // -0.05%
  lowNegative: -0.0001, // -0.01%
};

/**
 * Get funding rate color based on value
 */
export function getFundingRateColor(rate: number): string {
  if (rate > 0.0005) return "text-green-600 bg-green-50";
  if (rate > 0) return "text-green-500 bg-green-50";
  if (rate < -0.0005) return "text-red-600 bg-red-50";
  if (rate < 0) return "text-red-500 bg-red-50";
  return "text-gray-500 bg-gray-50";
}

/**
 * Format funding rate as percentage string
 */
export function formatFundingRate(rate: number | string): string {
  const num = typeof rate === "string" ? parseFloat(rate) : rate;
  return (num * 100).toFixed(4) + "%";
}

/**
 * Calculate annualized funding rate
 */
export function calculateAnnualizedRate(dailyRate: number): number {
  return dailyRate * 365;
}
