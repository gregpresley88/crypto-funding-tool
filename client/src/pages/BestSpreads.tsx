import { trpc } from "@/lib/trpc";
import { formatFundingRate } from "@/const";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";

interface SpreadData {
  symbol: string;
  highest: {
    exchange: string;
    rate: number;
    pair: string;
  };
  lowest: {
    exchange: string;
    rate: number;
    pair: string;
  };
  spread: number;
}

/**
 * Get the perpetual trading link for each exchange
 */
function getExchangeLink(exchange: string, pair: string): string {
  const links: Record<string, (pair: string) => string> = {
    "Binance": (pair) => `https://www.binance.com/en/futures/${pair.toLowerCase()}`,
    "OKX": (pair) => {
      const symbol = pair.replace("-USDT-SWAP", "").toLowerCase();
      return `https://www.okx.com/trade-swap/${symbol}-usdt`;
    },
    "Gate": (pair) => `https://www.gate.io/futures/usdt/${pair.toLowerCase()}`,
    "Bitget": (pair) => `https://www.bitget.com/spot/trading/${pair}`,
    "KuCoin": (pair) => `https://www.kucoin.com/trade/${pair}`,
    "BingX": (pair) => `https://bingx.com/trade/${pair}`,
    "XT.COM": (pair) => `https://www.xt.com/trade/${pair}`,
    "HTX": (pair) => `https://www.hbdm.vip/en-us/linear-swap/exchange/${pair.toLowerCase()}`,
    "Kraken": (pair) => `https://www.kraken.com/prices/charts/xbtusd`,
    "Deribit": (pair) => `https://www.deribit.com/`,
    "MEXC": (pair) => `https://www.mexc.com/exchange/${pair}`,
  };
  
  const linkGenerator = links[exchange];
  if (linkGenerator) {
    return linkGenerator(pair);
  }
  return "#";
}

export function BestSpreads() {
  const { data: spreads, isLoading } = trpc.fundingRates.getBestSpreads.useQuery(
    { limit: 5 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Best Funding Rate Spreads</h1>
          </div>
          <p className="text-slate-400">
            Top 5 cryptocurrencies with the largest funding rate differences across exchanges
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="ml-2 text-slate-400">Loading spreads...</span>
          </div>
        )}

        {/* Spreads Grid */}
        {!isLoading && spreads && spreads.length > 0 && (
          <div className="grid gap-6">
            {spreads.map((spread: SpreadData, index) => (
              <Card
                key={spread.symbol}
                className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-white">#{index + 1}</span>
                        <CardTitle className="text-2xl text-white">{spread.symbol}</CardTitle>
                      </div>
                      <CardDescription className="text-slate-400">
                        Spread: {formatFundingRate(spread.spread)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400">
                        {formatFundingRate(spread.spread)}
                      </div>
                      <p className="text-xs text-slate-500">difference</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Highest Rate */}
                    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                      <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
                        Highest Rate
                      </p>
                      <div className="mb-3">
                        <p className="text-2xl font-bold text-green-400">
                          {formatFundingRate(spread.highest.rate)}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">{spread.highest.exchange}</p>
                      </div>
                      <a
                        href={getExchangeLink(spread.highest.exchange, spread.highest.pair)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        View on {spread.highest.exchange} →
                      </a>
                    </div>

                    {/* Lowest Rate */}
                    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                      <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
                        Lowest Rate
                      </p>
                      <div className="mb-3">
                        <p className="text-2xl font-bold text-red-400">
                          {formatFundingRate(spread.lowest.rate)}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">{spread.lowest.exchange}</p>
                      </div>
                      <a
                        href={getExchangeLink(spread.lowest.exchange, spread.lowest.pair)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        View on {spread.lowest.exchange} →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!spreads || spreads.length === 0) && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-400">No funding rate data available yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
