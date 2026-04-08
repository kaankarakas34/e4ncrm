require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function resetUsers() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Truncate and reset ID sequence
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    
    // Insert Admin
    await pool.query(
      'INSERT INTO users (name, role, email, password) VALUES ($1, $2, $3, $4)',
      ['Admin Yönetici', 'admin', 'admin@crm.com', 'admin123']
    );
    
    // Insert Agent
    await pool.query(
      'INSERT INTO users (name, role, email, password) VALUES ($1, $2, $3, $4)',
      ['Saha Temsilcisi', 'user', 'agent@crm.com', 'agent123']
    );
    
    console.log('✓ Kullanıcı tablosu sıfırlandı: 1 Admin ve 1 Agent oluşturuldu.');
    console.log('Admin: admin@crm.com / admin123');
    console.log('Agent: agent@crm.com / agent123');
  } catch (err) {
    console.error('Hata:', err.message);
  } finally {
    await pool.end();
  }
}

resetUsers();
