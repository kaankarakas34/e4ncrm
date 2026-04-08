require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Seeding networking CRM database tables...');
    
    // Seed Users (3 Agents)
    const userRes = await pool.query(`
      INSERT INTO users (name) VALUES 
      ('Agent 1 (Ali)'),
      ('Agent 2 (Ayşe)'),
      ('Agent 3 (Mehmet)')
      RETURNING id;
    `);
    const users = userRes.rows.map(r => r.id);

    // Seed Unassigned Leads (Waiting in Pool)
    await pool.query(`
      INSERT INTO leads (source, full_name, phone, email, message, status) VALUES 
      ('Meta Ads', 'Kemal Sunal', '555-1001', 'kemal@test.com', 'İlgileniyorum', 'New'),
      ('Meta Ads', 'Şener Şen', '555-1002', 'sener@test.com', 'Bilgi alabilir miyim?', 'New'),
      ('Meta Ads', 'Adile Naşit', '555-1003', 'adile@test.com', 'Organizasyon detayları nedir?', 'New');
    `);

    // Seed Assigned Leads
    const assignedRes = await pool.query(`
      INSERT INTO leads (source, full_name, phone, email, message, status, assigned_to) VALUES 
      ('Meta Ads', 'Halit Akçatepe', '555-2001', 'halit@test.com', 'Katılmak istiyorum', 'Assigned', $1),
      ('Meta Ads', 'Tarik Akan', '555-2002', 'tarik@test.com', 'Şartlar nedir?', 'Assigned', $2),
      ('Word of Mouth', 'Münir Özkul', '555-2003', 'munir@test.com', 'Tavsiye ile geldim', 'Assigned', $3)
      RETURNING id, assigned_to;
    `, [users[0], users[1], users[2]]);

    // Create Deals for assigned leads
    for (const lead of assignedRes.rows) {
      const stages = ['Olumlu', 'Tekrar Aranacak', 'Olumsuz', 'Islevsiz'];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      await pool.query(`
        INSERT INTO deals (lead_id, user_id, stage, notes) VALUES 
        ($1, $2, $3, 'İlk görüşme notları...')
      `, [lead.id, lead.assigned_to, stage]);
    }

    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

run();
