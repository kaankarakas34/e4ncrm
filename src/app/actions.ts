'use server';
import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getDashboardStats() {
  const usersCount = await query('SELECT COUNT(*) FROM users');
  const leadsCount = await query('SELECT COUNT(*) FROM leads');
  const activeDealsCount = await query("SELECT COUNT(*) FROM deals WHERE stage != 'Islevsiz'");
  const islevsizCount = await query("SELECT COUNT(*) FROM deals WHERE stage = 'Islevsiz'");

  const recentAssigned = await query(`
    SELECT d.id, l.full_name as contact_name, l.source as title, d.stage, u.name as user_name
    FROM deals d 
    JOIN leads l ON d.lead_id = l.id 
    JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC 
    LIMIT 5
  `);

  return {
    agents: usersCount.rows[0].count,
    totalLeads: leadsCount.rows[0].count,
    activeDeals: activeDealsCount.rows[0].count,
    islevsiz: islevsizCount.rows[0].count,
    recentDeals: recentAssigned.rows
  };
}

export async function getRecentUnassignedLeads() {
  const res = await query("SELECT * FROM leads WHERE status = 'New' ORDER BY created_at DESC LIMIT 5");
  return res.rows;
}

export async function getLeads(statusFilter?: string) {
  let q = 'SELECT l.*, u.name as assigned_agent FROM leads l LEFT JOIN users u ON l.assigned_to = u.id';
  if (statusFilter) {
    q += ` WHERE l.status = '${statusFilter}'`;
  }
  q += ' ORDER BY l.created_at DESC';
  const res = await query(q);
  return res.rows;
}

export async function getUsers() {
  const res = await query('SELECT * FROM users ORDER BY name ASC');
  return res.rows;
}

export async function assignLeadToUser(leadId: number, userId: number) {
  // Update lead
  await query("UPDATE leads SET status = 'Assigned', assigned_to = $1 WHERE id = $2", [userId, leadId]);
  
  // Create deal
  await query("INSERT INTO deals (lead_id, user_id, stage) VALUES ($1, $2, 'Tekrar Aranacak') ON CONFLICT (lead_id) DO NOTHING", [leadId, userId]);
  
  revalidatePath('/leads');
  revalidatePath('/');
}

export async function getMyDeals(userId?: number) {
  let q = `
    SELECT d.id, d.stage, d.notes, d.user_id, l.full_name, l.phone, l.source, l.profession, l.city, u.name as agent_name 
    FROM deals d 
    JOIN leads l ON d.lead_id = l.id
    JOIN users u ON d.user_id = u.id
    WHERE l.status != 'Not_Qualified'
  `;
  if (userId) {
    q += ` AND d.user_id = ${userId}`;
  }
  const res = await query(q);
  return res.rows;
}

export async function updateDealStage(dealId: number, newStage: string) {
  // If moving to Islevsiz, Dolu Koltuk or Üye Olanlar, save the current stage so we can restore it later
  if (newStage === 'Islevsiz' || newStage === 'Dolu Koltuk' || newStage === 'Üye Olanlar') {
    await query(
      "UPDATE deals SET previous_stage = stage, stage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newStage, dealId]
    );
    if (newStage === 'Islevsiz') {
      // Mark the lead as Not_Qualified
      const res = await query("SELECT lead_id FROM deals WHERE id = $1", [dealId]);
      if (res.rows.length > 0) {
        await query("UPDATE leads SET status = 'Not_Qualified' WHERE id = $1", [res.rows[0].lead_id]);
      }
    }
  } else {
    await query(
      "UPDATE deals SET stage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newStage, dealId]
    );
  }

  revalidatePath('/deals');
}

export async function updateDealNotes(dealId: number, notes: string) {
  await query("UPDATE deals SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [notes, dealId]);
  revalidatePath('/deals');
}

export async function getDealStages() {
  const res = await query('SELECT * FROM deal_stages ORDER BY id ASC');
  return res.rows;
}

export async function createDealStage(name: string) {
  const res = await query(
    'INSERT INTO deal_stages (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    [name]
  );
  revalidatePath('/deals');
  if (res.rows.length === 0) {
    // Name already exists
    return null;
  }
  return res.rows[0];
}

export async function updateDealStageName(id: number, name: string) {
  await query('UPDATE deal_stages SET name = $1 WHERE id = $2', [name, id]);
  revalidatePath('/deals');
}

export async function deleteDealStage(id: number) {
  await query('DELETE FROM deal_stages WHERE id = $1', [id]);
  revalidatePath('/deals');
}

export async function revertUnqualifiedLead(leadId: number) {
  // Get the deal's previous stage
  const dealRes = await query(
    "SELECT id, previous_stage FROM deals WHERE lead_id = $1",
    [leadId]
  );
  
  const deal = dealRes.rows[0];
  const restoreStage = deal?.previous_stage || 'Tekrar Aranacak';
  
  // Restore the lead and the deal stage
  await query("UPDATE leads SET status = 'Assigned' WHERE id = $1", [leadId]);
  await query(
    "UPDATE deals SET stage = $1, previous_stage = NULL, updated_at = CURRENT_TIMESTAMP WHERE lead_id = $2",
    [restoreStage, leadId]
  );
  
  revalidatePath('/unqualified');
  revalidatePath('/deals');
  revalidatePath('/');
}

export async function getFilledDeals() {
  const q = `
    SELECT d.id, d.stage, d.notes, d.created_at as deal_created_at, l.id as lead_id, l.full_name, l.phone, l.source, l.profession, l.city, l.created_at, u.name as assigned_agent 
    FROM deals d 
    JOIN leads l ON d.lead_id = l.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.stage = 'Dolu Koltuk'
    ORDER BY d.updated_at DESC
  `;
  const res = await query(q);
  return res.rows;
}

export async function revertFilledDeal(dealId: number, newUserId: number) {
  const dealRes = await query(
    "SELECT lead_id, previous_stage FROM deals WHERE id = $1",
    [dealId]
  );
  
  const deal = dealRes.rows[0];
  if (!deal) return;
  
  const restoreStage = deal?.previous_stage || 'Tekrar Aranacak';
  
  await query("UPDATE leads SET assigned_to = $1 WHERE id = $2", [newUserId, deal.lead_id]);
  await query(
    "UPDATE deals SET user_id = $1, stage = $2, previous_stage = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
    [newUserId, restoreStage, dealId]
  );
  
  revalidatePath('/filled');
  revalidatePath('/deals');
  revalidatePath('/');
}

export async function getMembersDeals() {
  const q = `
    SELECT d.id, d.stage, d.notes, d.created_at as deal_created_at, l.id as lead_id, l.full_name, l.phone, l.source, l.profession, l.city, l.created_at, u.name as assigned_agent 
    FROM deals d 
    JOIN leads l ON d.lead_id = l.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.stage = 'Üye Olanlar'
    ORDER BY d.updated_at DESC
  `;
  const res = await query(q);
  return res.rows;
}

export async function revertMemberDeal(dealId: number, newUserId: number) {
  const dealRes = await query(
    "SELECT lead_id, previous_stage FROM deals WHERE id = $1",
    [dealId]
  );
  
  const deal = dealRes.rows[0];
  if (!deal) return;
  
  const restoreStage = deal?.previous_stage || 'Tekrar Aranacak';
  
  await query("UPDATE leads SET assigned_to = $1 WHERE id = $2", [newUserId, deal.lead_id]);
  await query(
    "UPDATE deals SET user_id = $1, stage = $2, previous_stage = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
    [newUserId, restoreStage, dealId]
  );
  
  revalidatePath('/members');
  revalidatePath('/deals');
  revalidatePath('/');
}

export async function analyzeImportLeads(leads: any[]) {
  const duplicates = [];
  const validLeads = [];

  for (const lead of leads) {
    if (!lead.full_name || !lead.phone) continue;

    let queryStr = "SELECT l.id, l.status, u.name as agent_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id WHERE l.phone = $1";
    let queryParams = [lead.phone];

    if (lead.email && lead.email.trim() !== '') {
      queryStr += " OR l.email = $2";
      queryParams.push(lead.email);
    }

    const checkRes = await query(queryStr, queryParams);

    if (checkRes.rows.length > 0) {
      duplicates.push({
        imported_name: lead.full_name,
        imported_phone: lead.phone,
        imported_email: lead.email,
        existing_status: checkRes.rows[0].status,
        agent_name: checkRes.rows[0].agent_name || 'Atanmamış (Dağıtım Havuzunda)'
      });
    } else {
      validLeads.push(lead);
    }
  }

  return { duplicates, validLeads };
}

export async function confirmImportLeads(leads: any[]) {
  for (const lead of leads) {
    if (!lead.full_name || !lead.phone) continue;
    await query(
      "INSERT INTO leads (full_name, phone, email, source, message, status, profession, city) VALUES ($1, $2, $3, $4, $5, 'New', $6, $7)",
      [
          lead.full_name, 
          lead.phone, 
          lead.email || '', 
          lead.source || 'Excel Import', 
          lead.message || '',
          lead.profession || '',
          lead.city || ''
      ]
    );
  }
  revalidatePath('/leads');
  revalidatePath('/');
}

export async function createUser(data: any) {
  await query(
    "INSERT INTO users (name, role, email, password) VALUES ($1, $2, $3, $4)",
    [data.name, data.role, data.email, data.password]
  );
  revalidatePath('/settings');
}

export async function deleteUser(id: number) {
  // Prevent deleting all admins? Or just delete.
  await query('DELETE FROM users WHERE id = $1', [id]);
  revalidatePath('/settings');
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const res = await query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
  const user = res.rows[0];

  if (user) {
    const sessionData = JSON.stringify({ id: user.id, name: user.name, role: user.role });
    (await cookies()).set('auth_session', sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
    return { success: true };
  }

  return { success: false, error: 'Hatalı email veya şifre.' };
}

export async function logout() {
  (await cookies()).delete('auth_session');
  const { redirect } = await import('next/navigation');
  redirect('/login');
}

export async function deleteLeads(leadIds: number[]) {
  if (!leadIds || leadIds.length === 0) return;
  // First delete associated deals to prevent foreign key errors
  await query('DELETE FROM deals WHERE lead_id = ANY($1::int[])', [leadIds]);
  // Then delete the leads
  await query('DELETE FROM leads WHERE id = ANY($1::int[])', [leadIds]);
  revalidatePath('/leads');
  revalidatePath('/unqualified');
  revalidatePath('/members');
  revalidatePath('/');
}

export async function sendLeadsToDoluKoltuk(leadIds: number[]) {
  if (!leadIds || leadIds.length === 0) return;
  
  // Set leads status to Assigned
  await query("UPDATE leads SET status = 'Assigned' WHERE id = ANY($1::int[])", [leadIds]);
  
  // Create or Update deals for these leads
  for (const leadId of leadIds) {
    await query(
      "INSERT INTO deals (lead_id, stage, previous_stage) VALUES ($1, 'Dolu Koltuk', 'Tekrar Aranacak') ON CONFLICT (lead_id) DO UPDATE SET stage = 'Dolu Koltuk', previous_stage = deals.stage",
      [leadId]
    );
  }
  
  revalidatePath('/leads');
  revalidatePath('/filled');
}

export async function sendLeadsToMembers(leadIds: number[]) {
  if (!leadIds || leadIds.length === 0) return;
  
  await query("UPDATE leads SET status = 'Assigned' WHERE id = ANY($1::int[])", [leadIds]);
  
  for (const leadId of leadIds) {
    await query(
      "INSERT INTO deals (lead_id, stage, previous_stage) VALUES ($1, 'Üye Olanlar', 'Tekrar Aranacak') ON CONFLICT (lead_id) DO UPDATE SET stage = 'Üye Olanlar', previous_stage = deals.stage",
      [leadId]
    );
  }
  
  revalidatePath('/leads');
  revalidatePath('/members');
}

export async function exportAdminDeals() {
  const q = `
    SELECT 
      l.full_name as "Ad Soyad",
      l.email as "E-Mail",
      l.phone as "Telefon",
      d.stage as "Segment",
      u.name as "Atanan Danışman"
    FROM deals d 
    JOIN leads l ON d.lead_id = l.id
    JOIN users u ON d.user_id = u.id
    WHERE d.stage IN ('Olumlu', 'Tekrar Aranacak')
  `;
  const res = await query(q);
  return res.rows;
}

export async function sendLeadsToUnqualified(leadIds: number[]) {
  if (!leadIds || leadIds.length === 0) return;
  
  await query("UPDATE leads SET status = 'Not_Qualified' WHERE id = ANY($1::int[])", [leadIds]);
  
  for (const leadId of leadIds) {
    await query(
      "INSERT INTO deals (lead_id, stage, previous_stage) VALUES ($1, 'Islevsiz', 'Tekrar Aranacak') ON CONFLICT (lead_id) DO UPDATE SET stage = 'Islevsiz', previous_stage = deals.stage",
      [leadId]
    );
  }
  
  revalidatePath('/leads');
  revalidatePath('/unqualified');
}

export async function reassignDeal(dealId: number, userId: number) {
  const dealRes = await query("SELECT lead_id FROM deals WHERE id = $1", [dealId]);
  const deal = dealRes.rows[0];
  if (deal && deal.lead_id) {
    await query("UPDATE leads SET assigned_to = $1 WHERE id = $2", [userId, deal.lead_id]);
  }
  await query("UPDATE deals SET user_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [userId, dealId]);
  
  revalidatePath('/deals');
  revalidatePath('/');
}
