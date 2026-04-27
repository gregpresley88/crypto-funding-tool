#!/usr/bin/env node

/**
 * Database initialization script
 * Creates the funding_rates and funding_rates_latest tables
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    
    const connection = await mysql.createConnection(DATABASE_URL);
    console.log('✅ Connected to database');

    // Create funding_rates table
    console.log('📝 Creating funding_rates table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`funding_rates\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`symbol\` varchar(20) NOT NULL,
        \`pair\` varchar(30) NOT NULL,
        \`exchange\` varchar(50) NOT NULL,
        \`open\` decimal(10, 8) NOT NULL,
        \`high\` decimal(10, 8) NOT NULL,
        \`low\` decimal(10, 8) NOT NULL,
        \`close\` decimal(10, 8) NOT NULL,
        \`timestamp\` int NOT NULL,
        \`interval\` varchar(10) NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_funding_rate\` (\`symbol\`, \`pair\`, \`exchange\`, \`timestamp\`, \`interval\`),
        INDEX \`idx_symbol\` (\`symbol\`),
        INDEX \`idx_exchange\` (\`exchange\`),
        INDEX \`idx_timestamp\` (\`timestamp\`)
      )
    `);
    console.log('✅ funding_rates table created');

    // Create funding_rates_latest table
    console.log('📝 Creating funding_rates_latest table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`funding_rates_latest\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`symbol\` varchar(20) NOT NULL,
        \`pair\` varchar(30) NOT NULL,
        \`exchange\` varchar(50) NOT NULL,
        \`funding_rate\` decimal(10, 8) NOT NULL,
        \`timestamp\` int NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_latest_rate\` (\`symbol\`, \`exchange\`),
        INDEX \`idx_symbol\` (\`symbol\`),
        INDEX \`idx_exchange\` (\`exchange\`),
        INDEX \`idx_updated\` (\`updatedAt\`)
      )
    `);
    console.log('✅ funding_rates_latest table created');

    await connection.end();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
