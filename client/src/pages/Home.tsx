import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Crypto Funding Rates</h1>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button onClick={() => navigate("/dashboard")} variant="default">
                  Dashboard
                </Button>
              </>
            ) : (
              <Button onClick={() => (window.location.href = getLoginUrl())} variant="default">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-3xl text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Compare Funding Rates Across Exchanges
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Track perpetual contract funding rates for the top 30 cryptocurrencies across the 20 largest derivative exchanges. Get real-time data, historical trends, and actionable insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="text-lg px-8 py-6"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => (window.location.href = getLoginUrl())}
                className="text-lg px-8 py-6"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-slate-800/50 border-t border-slate-700 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <h4 className="text-xl font-semibold text-white mb-3">Real-Time Data</h4>
              <p className="text-slate-300">
                Get live funding rates updated every 5 minutes from all major exchanges.
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <h4 className="text-xl font-semibold text-white mb-3">Historical Analysis</h4>
              <p className="text-slate-300">
                Analyze 7, 14, and 30-day historical trends to identify patterns and opportunities.
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <h4 className="text-xl font-semibold text-white mb-3">Advanced Filters</h4>
              <p className="text-slate-300">
                Filter by cryptocurrency or exchange, sort by funding rate, and compare across markets.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
