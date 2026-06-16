async function testBitMEXFetch() {
  console.log('\n=== Testing BitMEX Fetch ===\n');

  const bitMexContracts = {
    "BTC": "XBTUSD",      // Bitcoin USD (actively trading)
    "ETH": "ETHXBT",      // Ethereum BTC-margined
    "LTC": "LTCXBT",      // Litecoin BTC-margined
  };

  for (const [symbol, contractSymbol] of Object.entries(bitMexContracts)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        `https://www.bitmex.com/api/v1/instrument?symbol=${contractSymbol}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`❌ ${symbol} (${contractSymbol}): HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const instrument = data[0];
        const fundingRate = parseFloat(instrument.fundingRate);
        
        console.log(`✅ ${symbol} (${contractSymbol})`);
        console.log(`   Funding Rate: ${fundingRate}`);
        console.log(`   State: ${instrument.state}`);
        console.log(`   Mark Price: ${instrument.markPrice}`);
      }
    } catch (error) {
      console.log(`❌ ${symbol} (${contractSymbol}): ${error.message}`);
    }
  }
}

testBitMEXFetch();
