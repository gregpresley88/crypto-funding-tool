import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { TRADEABLE_SYMBOLS, EXCHANGES, TIME_FRAMES, formatFundingRate } from "@/const";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ChartView() {
  const [location, navigate] = useLocation();
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [selectedExchange, setSelectedExchange] = useState("Binance");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(7);
  const [showPrice, setShowPrice] = useState(false);

  // Parse query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const symbol = params.get("symbol");
    const exchange = params.get("exchange");

    if (symbol && TRADEABLE_SYMBOLS.includes(symbol)) {
      setSelectedSymbol(symbol);
    }
    if (exchange && EXCHANGES.includes(exchange)) {
      setSelectedExchange(exchange);
    }
  }, [location]);

  // Calculate time range
  const now = new Date();
  const startTime = Math.floor((now.getTime() - selectedTimeFrame * 24 * 60 * 60 * 1000) / 1000);
  const endTime = Math.floor(now.getTime() / 1000);

  // Fetch historical data
  const { data: historyData, isLoading } = trpc.fundingRates.getHistory.useQuery(
    {
      symbol: selectedSymbol,
      exchange: selectedExchange,
      startTime,
      endTime,
    },
    { enabled: !!selectedSymbol && !!selectedExchange }
  );

  // Fetch price data if checkbox is enabled
  const [priceData, setPriceData] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!showPrice) return;
    
    const fetchPrices = async () => {
      try {
        // Fetch historical price data from CoinGecko
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${selectedSymbol.toLowerCase()}/market_chart?vs_currency=usd&days=${selectedTimeFrame}&interval=daily`
        );
        const data = await response.json();
        
        // Convert prices to a map by date
        const priceMap: Record<string, number> = {};
        if (data.prices) {
          data.prices.forEach((price: [number, number]) => {
            const date = new Date(price[0]).toLocaleDateString();
            priceMap[date] = price[1];
          });
        }
        setPriceData(priceMap);
      } catch (error) {
        console.error("Failed to fetch price data:", error);
      }
    };
    
    fetchPrices();
  }, [showPrice, selectedSymbol, selectedTimeFrame]);

  // Transform data for chart
  const chartData = (historyData || []).map((item: any) => {
    const time = new Date(item.timestamp * 1000).toLocaleDateString();
    return {
      time,
      rate: parseFloat(item.fundingRate) * 100, // Convert to percentage
      price: priceData[time] || null,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Historical Funding Rates</h1>
            <p className="text-slate-600">Analyze funding rate trends over time</p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Symbol</label>
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADEABLE_SYMBOLS.map((sym) => (
                  <SelectItem key={sym} value={sym}>
                    {sym}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Exchange</label>
            <Select value={selectedExchange} onValueChange={setSelectedExchange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXCHANGES.map((ex) => (
                  <SelectItem key={ex} value={ex}>
                    {ex}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-white">
              <Checkbox
                id="show-price"
                checked={showPrice}
                onCheckedChange={(checked) => setShowPrice(checked as boolean)}
              />
              <label htmlFor="show-price" className="text-sm cursor-pointer">
                Show Price
              </label>
            </div>
          </div>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedSymbol} / {selectedExchange}
            </CardTitle>
            <CardDescription>
              Funding rate history for the last {selectedTimeFrame} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No historical data available for this pair yet. Check back later as data accumulates.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" label={{ value: 'Funding Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value) => `${(typeof value === 'number' ? value : 0).toFixed(4)}%`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    dot={false}
                    name="Funding Rate (%)"
                    yAxisId="left"
                  />
                  {showPrice && (
                    <>
                      <YAxis yAxisId="right" orientation="right" />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        dot={false}
                        name={`${selectedSymbol} Price (USD)`}
                        yAxisId="right"
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {formatFundingRate((chartData.reduce((a, b) => a + b.rate, 0) / chartData.length) / 100)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Highest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatFundingRate(Math.max(...chartData.map((d) => d.rate)) / 100)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Lowest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatFundingRate(Math.min(...chartData.map((d) => d.rate)) / 100)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {formatFundingRate(
                    (Math.max(...chartData.map((d) => d.rate)) - Math.min(...chartData.map((d) => d.rate))) / 100
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
