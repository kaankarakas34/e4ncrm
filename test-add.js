require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Add previous_stage column to deals table if it doesn't exist
    await pool.query(`
      ALTER TABLE deals 
      ADD COLUMN IF NOT EXISTS previous_stage VARCHAR(100) DEFAULT NULL
    `);
    console.log('✓ previous_stage column added to deals table');
    
    // Show current deals
    const res = await pool.query('SELECT id, stage, previous_stage FROM deals');
    console.log('Current deals:', res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
migrate();
