// Direct fetch and update BitMEX data
async function updateBitMEX() {
  console.log('\n=== Updating BitMEX Data ===\n');

  const bitMexContracts = {
    "BTC": "XBTUSD",
    "ETH": "ETHXBT",
    "LTC": "LTCXBT",
  };

  const rates = [];

  for (const [symbol, contractSymbol] of Object.entries(bitMexContracts)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        `https://www.bitmex.com/api/v1/instrument?symbol=${contractSymbol}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) continue;

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const instrument = data[0];
        const fundingRate = parseFloat(instrument.fundingRate);
        
        if (!isNaN(fundingRate) && isFinite(fundingRate)) {
          rates.push({
            symbol,
            pair: contractSymbol,
            exchange: "BitMEX",
            fundingRate,
            timestamp: Math.floor(Date.now() / 1000),
          });
          
          console.log(`✅ ${symbol} (${contractSymbol}): ${fundingRate}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${symbol}: ${error.message}`);
    }
  }

  console.log(`\nTotal rates to update: ${rates.length}`);
  console.log('Rates:', JSON.stringify(rates, null, 2));
}

updateBitMEX();
