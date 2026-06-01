// Database connection using pg (PostgreSQL)
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('POSTGRES_URL or DATABASE_URL environment variable not set');
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

async function query(text, params) {
  const db = getPool();
  const result = await db.query(text, params);
  return result;
}

// For transactions
async function getClient() {
  const db = getPool();
  return db.connect();
}

module.exports = { query, getClient, getPool };
