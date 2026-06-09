import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const [location, navigate] = useLocation();
  const [startDate, setStartDate] = useState("2026-05-20");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  const backfillMutation = trpc.backfill.backfillData.useMutation();

  const handleBackfill = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    try {
      const result = await backfillMutation.mutateAsync({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });

      toast.success(`Successfully backfilled ${result.recordsInserted} records`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Backfill failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
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
            <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-slate-600">Manage historical data backfill</p>
          </div>
        </div>

        {/* Backfill Card */}
        <Card>
          <CardHeader>
            <CardTitle>Historical Data Backfill</CardTitle>
            <CardDescription>
              Fill gaps in historical funding rate data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                This will generate synthetic historical funding rate data for the selected date range.
                Data will be created for all major symbols and exchanges with realistic variations.
              </p>
            </div>

            {/* Backfill Button */}
            <Button
              onClick={handleBackfill}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Backfilling...
                </>
              ) : (
                "Start Backfill"
              )}
            </Button>

            {/* Status */}
            {backfillMutation.isPending && (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600">Processing backfill...</p>
              </div>
            )}

            {backfillMutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Backfill completed successfully!
                  <br />
                  Records inserted: {backfillMutation.data?.recordsInserted}
                </p>
              </div>
            )}

            {backfillMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  ✗ Backfill failed: {backfillMutation.error.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
