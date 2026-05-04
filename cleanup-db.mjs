#!/usr/bin/env node

/**
 * Database cleanup script
 * Truncates funding rate tables to remove old/invalid data
 */

import { createPool } from "mysql2/promise";

const pool = createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "crypto_funding_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function cleanup() {
  const connection = await pool.getConnection();

  try {
    console.log("🧹 Cleaning up database...");

    // Truncate tables
    await connection.query("TRUNCATE TABLE funding_rates");
    console.log("✅ Truncated funding_rates");

    await connection.query("TRUNCATE TABLE funding_rates_latest");
    console.log("✅ Truncated funding_rates_latest");

    await connection.query("TRUNCATE TABLE trading_volume");
    console.log("✅ Truncated trading_volume");

    // Verify
    const [ratesCount] = await connection.query(
      "SELECT COUNT(*) as count FROM funding_rates"
    );
    const [latestCount] = await connection.query(
      "SELECT COUNT(*) as count FROM funding_rates_latest"
    );

    console.log(
      `\n📊 Database cleanup complete:\n  - funding_rates: ${ratesCount[0].count} rows\n  - funding_rates_latest: ${latestCount[0].count} rows`
    );
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

cleanup();
