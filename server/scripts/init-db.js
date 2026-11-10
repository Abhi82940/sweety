const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function initDb() {
  try {
    console.log('Connecting to database and running schema.sql...');
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(sql);
    console.log('Database schema created successfully!');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
