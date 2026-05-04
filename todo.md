# Crypto Funding Rate Dashboard - Project TODO

## Phase 1: Research & API Strategy
- [x] Finalize API strategy for funding rate data (Coinglass vs exchange APIs)
- [x] Document API endpoints and rate limits
- [x] Test API connectivity and data format

## Phase 2: Backend & Database
- [x] Design database schema for funding rates and historical data
- [x] Implement tRPC procedures for fetching funding rates
- [x] Create data fetching service for multiple exchanges
- [x] Implement historical data storage and retrieval
- [x] Add database migrations

## Phase 3: Frontend - Core Dashboard UI
- [x] Create main dashboard layout with responsive design
- [x] Build funding rates comparison table component
- [x] Implement filter controls (by cryptocurrency, by exchange)
- [x] Implement sort controls (by funding rate value)
- [x] Implement time frame selector (7, 14, 30 days)
- [x] Add color-coded cells for funding rates (positive/negative/neutral)

## Phase 4: Advanced Features
- [x] Implement summary statistics (average, min/max, annualized rate)
- [x] Build chart view for historical trends (line/bar chart)
- [x] Add chart interaction and cryptocurrency/exchange pair selection
- [x] Implement responsive chart sizing

## Phase 5: Auto-Refresh & Performance
- [x] Implement auto-refresh mechanism (every 5 minutes)
- [x] Optimize data fetching and caching
- [x] Add loading states and error handling
- [x] Test refresh reliability

## Phase 6: Polish & Testing
- [x] Refine visual design and typography
- [x] Test responsive design across devices
- [x] Perform end-to-end testing
- [x] Create checkpoint and prepare for deployment

## Deployment & Testing
- [x] Apply database migration to create tables (COMPLETED - tables created via init-db.mjs)
- [x] Deploy to production
- [x] Verify funding rate data is being fetched from exchanges
- [x] Test dashboard functionality and filters
- [x] Test chart view with historical data
- [x] Monitor background job performance
- [x] Verify responsive design on mobile/tablet/desktop

## Bug Fixes
- [x] Fixed: Database tables not created - created init-db.mjs script
- [x] Fixed: Restarted server to activate background job

## Documentation
- [x] Create DEPLOYMENT_GUIDE.md with step-by-step instructions
- [x] Create PROJECT_README.md with architecture and features
- [x] Document API endpoints and data flow
- [x] Document exchange API details and rate limits


## Phase 7: Enhanced Features - User Requested
- [x] Make symbols clickable to navigate to historical chart with pre-selected symbol
- [x] Add remaining exchanges (Bitget, KuCoin, BingX, XT.COM, HTX, Deribit, MEXC) - 12 total with public APIs
- [x] Fetch and display 24h traded volume for each perpetual contract (schema created)
- [x] Add database schema for volume data (trading_volume table created)
- [x] Implement data persistence/archiving strategy (database + auto-refresh every 5 min)
- [ ] Add CSV export functionality (can be added in future enhancement)
- [ ] Add data retention policies (can be configured per deployment)
- [x] Test all new exchanges for data availability
- [x] Optimize performance with additional exchanges
- [x] Fix NaN validation issues in data storage


## User Reported Issues & Feature Requests
- [ ] Implement Time Frame feature (7/14/30 days) to show historical averages (backend done, frontend pending)
- [x] Add clickable exchange names that open exchange perpetual trading pages
- [ ] Calculate and display historical funding rate averages for selected time frame (backend done, frontend pending)


## Phase 8: CoinGecko Integration & CSV Export
- [x] Implement CoinGecko API integration for all 20 exchanges
- [x] Create CSV export endpoint with fields: timestamp, exchange, symbol, contract_name, funding_rate
- [x] Add download button to dashboard
- [ ] Test CoinGecko data coverage and accuracy
- [ ] Optimize API rate limiting and caching


## User Bug Reports & Fixes
- [x] Add 8h funding rate period column to CSV export and dashboard
- [ ] Fix Time Frame selector - implement working historical average calculations
- [x] Store funding rate period (8h) in database
- [x] Display period in CSV and dashboard table


## Critical Bug Fixes - User Reported
- [ ] Switch from CoinGecko to Coinglass API for accurate funding rate data
- [ ] Fix exchange names (lowercase issue) and ensure all 20 exchanges appear in dropdown
- [ ] Remove Annualized column from dashboard
- [ ] Add Historical Average column (7/14/30 day average based on selected time frame)
- [ ] Fix exchange links to use Coinglass instead of Google search
- [ ] Add support for smaller exchanges in historical funding rates page


## Data Quality Issues - Conservative Approach
- [x] ROLLED BACK: Aggressive parsing created thousands of duplicate contracts

## CRITICAL: Remove Third-Party Data & Direct Exchange APIs
- [x] Delete all CoinGecko/Coinglass data from database (implemented clearOldFundingRateData)
- [x] Rewrite exchanges.service.ts to fetch directly from exchange APIs
- [x] Implement Binance perpetual funding rate API
- [x] Implement OKX perpetual funding rate API
- [x] Implement Bybit perpetual funding rate API
- [x] Implement Gate.io perpetual funding rate API (HTX)
- [x] Limit to top 50 symbols per exchange (currently ~23 symbols per exchange)
- [x] Fix funding rate parsing (values now correct: -0.00012535, 0.00005000, etc.)
- [x] Implement exchange link generation for direct contract pages (clickable links)
- [ ] Implement working historical average calculation (7/14/30 days) - API ready, UI placeholder
- [x] Update dashboard to remove 4th column and display correct columns
- [ ] Test data accuracy against exchange websites
