import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { TRADEABLE_SYMBOLS, EXCHANGES, TIME_FRAMES, formatFundingRate } from "@/const";
import { Button } from "@/components/ui/button";
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
  const [, navigate] = useLocation();
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [selectedExchange, setSelectedExchange] = useState("Binance");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(7);

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
      interval: "1d",
    },
    { enabled: !!selectedSymbol && !!selectedExchange }
  );

  // Transform data for chart
  const chartData = (historyData || []).map((item: any) => ({
    time: new Date(item.timestamp * 1000).toLocaleDateString(),
    rate: parseFloat(item.close) * 100, // Convert to percentage
    open: parseFloat(item.open) * 100,
    high: parseFloat(item.high) * 100,
    low: parseFloat(item.low) * 100,
  }));

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                No historical data available for this pair
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: "Funding Rate (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value) => {
                      if (typeof value === "number") return value.toFixed(4) + "%";
                      return value;
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    dot={false}
                    name="Close Rate"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="#10b981"
                    dot={false}
                    name="High"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="#ef4444"
                    dot={false}
                    name="Low"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
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
                <CardTitle className="text-sm font-medium text-slate-600">Average Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {formatFundingRate(chartData.reduce((a, b) => a + b.rate / 100, 0) / chartData.length)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Highest Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatFundingRate(Math.max(...chartData.map((d) => d.high)) / 100)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Lowest Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatFundingRate(Math.min(...chartData.map((d) => d.low)) / 100)}
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
                    (Math.max(...chartData.map((d) => d.high)) - Math.min(...chartData.map((d) => d.low))) / 100
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
