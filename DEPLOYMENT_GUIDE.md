# Crypto Funding Rate Dashboard - Deployment Guide

## Overview

This guide walks you through deploying the Crypto Funding Rate Dashboard and verifying it works correctly.

## Prerequisites

- Manus account with web development project
- Access to the Management UI
- Database connection configured

## Deployment Steps

### Step 1: Apply Database Migration

The application requires two database tables to store funding rate data.

1. Open the **Management UI** → **Database** panel
2. Look for the pending migration: `0001_lazy_roxanne_simpson.sql`
3. Click **Apply Migration** to create the tables:
   - `funding_rates` - Stores historical OHLC funding rate data
   - `funding_rates_latest` - Stores the most recent funding rates

### Step 2: Deploy to Production

1. In the Management UI, click the **Publish** button (top-right)
2. Wait for the deployment to complete
3. Once deployed, you'll get a public URL for your application

### Step 3: Verify Application is Running

1. Visit the public URL in your browser
2. You should see the landing page with "Compare Funding Rates Across Exchanges"
3. Click **Get Started** or **Go to Dashboard**

## Testing the Application

### Test 1: Home Page Navigation

- [ ] Landing page displays correctly
- [ ] "Features" section shows three feature cards
- [ ] Navigation buttons work (Dashboard, Sign In)

### Test 2: Dashboard Functionality

1. Navigate to the Dashboard
2. Verify the following:
   - [ ] Table displays funding rates (may be empty initially if data hasn't synced)
   - [ ] Time frame selector (7, 14, 30 days) works
   - [ ] Symbol filter dropdown populates with cryptocurrencies
   - [ ] Exchange filter dropdown populates with exchanges
   - [ ] Sort controls (Highest First / Lowest First) work
   - [ ] Refresh button updates the data
   - [ ] Summary statistics display (Average, Min, Max, Spread, Annualized)

### Test 3: Data Fetching

The background job runs every 5 minutes to fetch funding rates from exchanges.

1. Check the server logs for messages like:
   ```
   [FundingRates Job] Starting funding rate sync...
   [FundingRates Job] Fetched X funding rates
   [FundingRates Job] Successfully synced funding rates
   ```

2. Verify data appears in the dashboard table within 5 minutes of deployment

3. Check which exchanges have data:
   - **Binance**: Most reliable, should have data for all symbols
   - **OKX**: May have limited symbols
   - **Bybit**: May have limited symbols
   - **Gate.io**: May have limited symbols

### Test 4: Chart View

1. Click **View Charts** button on the dashboard
2. Verify the following:
   - [ ] Chart page loads
   - [ ] Symbol dropdown works
   - [ ] Exchange dropdown works
   - [ ] Time frame selector works
   - [ ] Chart displays (if historical data exists)
   - [ ] Statistics cards show (Average, Highest, Lowest, Volatility)

### Test 5: Responsive Design

Test on different screen sizes:

- [ ] **Desktop (1920x1080)**: All elements visible, layout looks good
- [ ] **Tablet (768x1024)**: Grid adjusts to 2-3 columns, readable
- [ ] **Mobile (375x667)**: Single column layout, touch-friendly buttons

### Test 6: Auto-Refresh

1. Open the dashboard
2. Note the "Last updated" timestamp
3. Wait 5+ minutes
4. Verify the timestamp updates automatically (no manual refresh needed)

## Troubleshooting

### No Data Appearing in Dashboard

**Possible causes:**
- Database migration not applied
- Background job not running
- Exchange APIs are temporarily unavailable

**Solutions:**
1. Verify migration was applied in Database panel
2. Check server logs for job errors
3. Try clicking the Refresh button manually
4. Wait 5-10 minutes for the next automatic sync

### Chart View Not Showing Data

**Possible causes:**
- Historical data not yet collected (requires multiple sync cycles)
- Selected symbol/exchange combination has no data

**Solutions:**
1. Wait 10-15 minutes for multiple data points to accumulate
2. Try different symbol/exchange combinations
3. Check if the exchange supports that symbol

### Slow Performance

**Possible causes:**
- Large dataset being fetched
- Database queries not optimized
- Network latency

**Solutions:**
1. Try filtering by specific symbol or exchange
2. Use shorter time frames (7 days instead of 30)
3. Clear browser cache and reload

## Performance Metrics

Expected performance:

- **Dashboard load time**: < 2 seconds
- **Chart load time**: < 3 seconds
- **Data refresh interval**: 5 minutes
- **Exchange API response time**: 1-5 seconds per symbol

## Monitoring

Monitor these metrics in production:

1. **Data Sync Success Rate**: Should be > 95%
2. **Average Response Time**: Should be < 1 second
3. **Database Query Time**: Should be < 500ms
4. **Background Job Duration**: Should be < 2 minutes

## Supported Exchanges and Symbols

### Exchanges (20 total)

- Binance (primary)
- OKX
- Bybit
- Gate.io
- Plus 16 others (partial support)

### Cryptocurrencies (24 tradeable)

BTC, ETH, XRP, BNB, SOL, TRX, DOGE, HYPE, LEO, ADA, BCH, XMR, LINK, ZEC, CC, XLM, M, LTC, AVAX, HBAR, SUI, SHIB, TON, CRO

## Next Steps

After successful deployment and testing:

1. Monitor the application for 24-48 hours
2. Collect historical data for better trend analysis
3. Consider adding more exchanges for broader coverage
4. Optimize database indexes for faster queries
5. Set up alerts for funding rate anomalies

## Support

For issues or questions:

1. Check the server logs in the Management UI
2. Review this guide's troubleshooting section
3. Contact Manus support if needed

---

**Last Updated**: April 27, 2026
**Version**: 1.0.0
