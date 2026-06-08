import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { TIME_FRAMES, AUTO_REFRESH_INTERVAL, formatFundingRate } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, ExternalLink, Download } from "lucide-react";

interface FundingRateData {
  id: number;
  symbol: string;
  pair: string;
  exchange: string;
  fundingRate: string;
  fundingPeriod?: string;
  timestamp: number;
  avgFundingRate?: number;
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
    "BitMEX": (pair) => `https://www.bitmex.com/trade/${pair.toLowerCase()}`,
  };
  
  const linkGenerator = links[exchange];
  if (linkGenerator) {
    return linkGenerator(pair);
  }
  
  return "https://www.google.com/search?q=" + encodeURIComponent(`${exchange} ${pair} perpetual`);
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(7);
  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterExchange, setFilterExchange] = useState("");
  const [sortBy, setSortBy] = useState<"rate-asc" | "rate-desc">("rate-desc");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch latest funding rates
  const { data: latestRates, isLoading, refetch } = trpc.fundingRates.getLatest.useQuery(undefined, {
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  // Fetch available symbols and exchanges
  const { data: symbols = [] } = trpc.fundingRates.getAllSymbols.useQuery();
  const { data: exchanges = [] } = trpc.fundingRates.getAllExchanges.useQuery();

  // Calculate time range for historical data
  const now = new Date();
  const startTime = Math.floor((now.getTime() - selectedTimeFrame * 24 * 60 * 60 * 1000) / 1000);
  const endTime = Math.floor(now.getTime() / 1000);

  // Fetch historical averages for the selected time frame
  const { data: historicalAverages = {} } = trpc.fundingRates.getHistoricalAverages.useQuery(
    { startTime, endTime },
    { enabled: true }
  );

  // Calculate average funding rate for each symbol-exchange pair from historical data
  const averagesByPair = useMemo(() => {
    const map: Record<string, number> = {};
    
    if (historicalAverages && typeof historicalAverages === 'object') {
      Object.entries(historicalAverages).forEach(([key, value]: [string, any]) => {
        map[key] = parseFloat(value) || 0;
      });
    }
    
    return map;
  }, [historicalAverages]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!latestRates) return [];

    let filtered = (latestRates as FundingRateData[]).map((rate) => ({
      ...rate,
      avgFundingRate: averagesByPair[`${rate.symbol}-${rate.exchange}`] || 0,
    }));

    if (filterSymbol) {
      filtered = filtered.filter((row) => row.symbol === filterSymbol);
    }

    if (filterExchange) {
      filtered = filtered.filter((row) => row.exchange === filterExchange);
    }

    // Sort
    filtered.sort((a, b) => {
      const rateA = parseFloat(a.fundingRate);
      const rateB = parseFloat(b.fundingRate);

      if (sortBy === "rate-asc") {
        return rateA - rateB;
      } else {
        return rateB - rateA;
      }
    });

    return filtered;
  }, [latestRates, filterSymbol, filterExchange, sortBy, averagesByPair]);

  // Calculate summary statistics
  const statistics = useMemo(() => {
    if (!filteredData.length) return null;

    const rates = filteredData.map((r) => parseFloat(r.fundingRate));
    const historicalRates = filteredData.map((r) => r.avgFundingRate || 0);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const historicalAvg = historicalRates.reduce((a, b) => a + b, 0) / historicalRates.length;
    const min = Math.min(...rates);
    const max = Math.max(...rates);

    return {
      avg,
      historicalAvg,
      min,
      max,
      spread: max - min,
      count: filteredData.length,
    };
  }, [filteredData]);

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  // CSV export functions
  const { data: csvData } = trpc.fundingRates.exportLatestAsCSV.useQuery();

  const handleDownloadCSV = () => {
    if (!csvData?.csv) return;

    const element = document.createElement("a");
    const file = new Blob([csvData.csv], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = csvData.filename || "funding-rates.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFundingRateColor = (rate: number) => {
    if (rate > 0.0005) return "text-green-600 bg-green-50";
    if (rate > 0) return "text-green-500 bg-green-50";
    if (rate < -0.0005) return "text-red-600 bg-red-50";
    if (rate < 0) return "text-red-500 bg-red-50";
    return "text-gray-500 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Funding Rate Dashboard</h1>
            <p className="text-slate-600">
              Compare perpetual contract funding rates across top exchanges and cryptocurrencies
            </p>
          </div>
          <Button onClick={() => navigate("/chart")} variant="outline">
            View Charts
          </Button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Time Frame</label>
            <Select value={selectedTimeFrame.toString()} onValueChange={(v) => setSelectedTimeFrame(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_FRAMES.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value.toString()}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Symbol</label>
            <Select value={filterSymbol} onValueChange={setFilterSymbol}>
              <SelectTrigger>
                <SelectValue placeholder="All symbols" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All symbols</SelectItem>
                {symbols.map((sym) => (
                  <SelectItem key={sym} value={sym}>
                    {sym}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Exchange</label>
            <Select value={filterExchange} onValueChange={setFilterExchange}>
              <SelectTrigger>
                <SelectValue placeholder="All exchanges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All exchanges</SelectItem>
                {exchanges.map((ex) => (
                  <SelectItem key={ex} value={ex}>
                    {ex}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "rate-asc" | "rate-desc")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rate-desc">Highest Rate</SelectItem>
                <SelectItem value="rate-asc">Lowest Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button onClick={handleDownloadCSV} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* Statistics Summary */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Avg Rate (Current)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {formatFundingRate(statistics.avg)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Avg Rate ({selectedTimeFrame}d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {formatFundingRate(statistics.historicalAvg)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Spread</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {formatFundingRate(statistics.spread)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pairs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{statistics.count}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Funding Rates</CardTitle>
            <CardDescription>
              {filteredData.length} pairs • Last updated: {lastRefresh.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No funding rates available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Symbol</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Exchange</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Avg ({selectedTimeFrame}d)</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Current Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Volume (24h)</th>
                      <th className="text-center py-3 px-4 font-medium text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row) => (
                      <tr
                        key={`${row.symbol}-${row.exchange}`}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/chart?symbol=${row.symbol}&exchange=${row.exchange}`)}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {row.symbol}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{row.exchange}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getFundingRateColor(row.avgFundingRate || 0)}`}>
                            {formatFundingRate(row.avgFundingRate || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getFundingRateColor(parseFloat(row.fundingRate))}`}>
                            {formatFundingRate(parseFloat(row.fundingRate))}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{row.fundingPeriod || "8h"}</td>
                        <td className="py-3 px-4 text-slate-700">-</td>
                        <td className="py-3 px-4 text-center">
                          <a
                            href={getExchangeLink(row.exchange, row.pair)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
