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
    "Bybit": (pair) => `https://www.bybit.com/trade/usdt/${pair}`,
    "Gate": (pair) => `https://www.gate.io/futures/usdt/${pair.toLowerCase()}`,
    "Bitget": (pair) => `https://www.bitget.com/spot/trading/${pair}`,
    "KuCoin": (pair) => `https://www.kucoin.com/trade/${pair}`,
    "BingX": (pair) => `https://bingx.com/trade/${pair}`,
    "XT.COM": (pair) => `https://www.xt.com/trade/${pair}`,
    "HTX": (pair) => `https://www.htx.com/trade/swap/${pair}`,
    "Kraken": (pair) => `https://www.kraken.com/prices/charts/xbtusd`,
    "Deribit": (pair) => `https://www.deribit.com/`,
    "MEXC": (pair) => `https://www.mexc.com/exchange/${pair}`,
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

  // Calculate average funding rate for each symbol-exchange pair
  const averagesByPair = useMemo(() => {
    if (!latestRates) return {};
    
    const map: Record<string, number> = {};
    const pairs: Record<string, number[]> = {};
    
    // Group rates by symbol-exchange pair
    (latestRates as FundingRateData[]).forEach((rate) => {
      const key = `${rate.symbol}-${rate.exchange}`;
      if (!pairs[key]) pairs[key] = [];
      pairs[key].push(parseFloat(rate.fundingRate));
    });
    
    // Calculate average for each pair
    Object.entries(pairs).forEach(([key, rates]) => {
      map[key] = rates.reduce((a, b) => a + b, 0) / rates.length;
    });
    
    return map;
  }, [latestRates]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!latestRates) return [];

    let filtered = latestRates as FundingRateData[];

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
  }, [latestRates, filterSymbol, filterExchange, sortBy]);

  // Calculate summary statistics
  const statistics = useMemo(() => {
    if (!filteredData.length) return null;

    const rates = filteredData.map((r) => parseFloat(r.fundingRate));
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const min = Math.min(...rates);
    const max = Math.max(...rates);

    return {
      avg,
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
            <Select value={filterSymbol || "all"} onValueChange={(v) => setFilterSymbol(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All symbols" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All symbols</SelectItem>
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
            <Select value={filterExchange || "all"} onValueChange={(v) => setFilterExchange(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All exchanges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All exchanges</SelectItem>
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
                <SelectItem value="rate-desc">Highest First</SelectItem>
                <SelectItem value="rate-asc">Lowest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex-1"
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
            <Button
              onClick={handleDownloadCSV}
              className="flex-1"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Average Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{formatFundingRate(statistics.avg)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Min Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatFundingRate(statistics.min)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Max Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatFundingRate(statistics.max)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Spread</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{formatFundingRate(statistics.spread)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Funding Rates</CardTitle>
            <CardDescription>
              {filteredData.length} results • Last updated: {lastRefresh.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !latestRates ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No data available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Symbol</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Exchange</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Avg ({selectedTimeFrame}d)</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Funding Rate</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Period</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">24h Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, idx) => {
                      const rate = parseFloat(row.fundingRate);
                      const colorClass = getFundingRateColor(rate);

                      return (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-medium">
                            <button
                              onClick={() => navigate(`/chart?symbol=${row.symbol}&exchange=${row.exchange}`)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                              title="Click to view historical chart"
                            >
                              {row.symbol}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <a
                              href={getExchangeLink(row.exchange, row.pair)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center gap-1"
                              title={`Open ${row.exchange} perpetual trading page`}
                            >
                              {row.exchange}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            <span className="font-medium">{formatFundingRate(averagesByPair[`${row.symbol}-${row.exchange}`] || 0)}</span>
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${colorClass} rounded`}>
                            {formatFundingRate(rate)}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600 font-medium">
                            {row.fundingPeriod || "8h"}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            <span className="text-slate-500">-</span>
                          </td>
                        </tr>
                      );
                    })}
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
