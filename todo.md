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
- [ ] Build chart view for historical trends (line/bar chart)
- [ ] Add chart interaction and cryptocurrency/exchange pair selection
- [ ] Implement responsive chart sizing

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
- [ ] Apply database migration to create tables
- [ ] Deploy to production
- [ ] Verify funding rate data is being fetched
- [ ] Test dashboard functionality
- [ ] Monitor background job performance
