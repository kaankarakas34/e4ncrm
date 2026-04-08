require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Creating deal_stages table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deal_stages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT,
        position SERIAL
      );
    `);

    // Only insert if empty
    const check = await pool.query('SELECT COUNT(*) FROM deal_stages');
    if (parseInt(check.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO deal_stages (name) VALUES 
        ('Olumlu'),
        ('Tekrar Aranacak'),
        ('Olumsuz'),
        ('Islevsiz');
      `);
    }

    console.log('Deal stages table ready.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

run();
