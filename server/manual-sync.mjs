import { db } from './db.ts';
import { fetchAllFundingRates } from './exchanges.service.ts';
import { fundingRatesLatest } from '../drizzle/schema.ts';
import { sql } from 'drizzle-orm';

async function manualSync() {
  console.log('Starting manual sync...');
  
  try {
    const rates = await fetchAllFundingRates();
    console.log(`Fetched ${rates.length} funding rates`);
    
    // Group by symbol-exchange
    const grouped = {};
    rates.forEach(rate => {
      const key = `${rate.symbol}-${rate.exchange}`;
      grouped[key] = rate;
    });
    
    console.log(`Unique symbol-exchange pairs: ${Object.keys(grouped).length}`);
    
    // Show BitMEX data
    const bitMexRates = rates.filter(r => r.exchange === 'BitMEX');
    console.log(`\nBitMEX rates: ${bitMexRates.length}`);
    bitMexRates.forEach(r => {
      console.log(`  ${r.symbol}: ${r.pair} = ${r.fundingRate}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

manualSync();
