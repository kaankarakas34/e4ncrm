require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Initializing networking CRM database tables...');
    
    // Drop existing for clean rebuild
    await pool.query(`DROP TABLE IF EXISTS deals, leads, contacts, companies, users, deal_stages CASCADE;`);

    // Create Users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'Agent'
      );
    `);

    // Create Leads table
    await pool.query(`
      CREATE TABLE leads (
        id SERIAL PRIMARY KEY,
        source TEXT DEFAULT 'Meta Ads',
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        message TEXT,
        profession TEXT,
        city TEXT,
        status TEXT DEFAULT 'New', -- New, Assigned, Not_Qualified
        assigned_to INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Deals table
    await pool.query(`
      CREATE TABLE deals (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) UNIQUE,
        user_id INTEGER REFERENCES users(id),
        stage TEXT DEFAULT 'Tekrar Aranacak', -- Olumlu, Tekrar Aranacak, Olumsuz, Islevsiz
        previous_stage TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Deal Stages table
    await pool.query(`
      CREATE TABLE deal_stages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT,
        position SERIAL
      );
    `);

    console.log('Database tables created successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

run();
