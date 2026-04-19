import { cookies } from 'next/headers';
import { getMyDeals, getDealStages } from '../actions';
import KanbanBoard from './KanbanBoard';

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('auth_session')?.value;
  let user = null;
  if (sessionStr) {
    try { user = JSON.parse(sessionStr); } catch (e) {}
  }

  // Adminler de dahil sadece kendisine atananları görecekse:
  // Eğer adminin tümünü görmesini istiyorsanız: user?.role === 'admin' ? undefined : user?.id 
  // Fakat kullanıcı atanınca gitsin diyorsa, Kanban'ın "Kendi işlerim" olması beklenir.
  const deals = await getMyDeals(user?.id);
  const stages = await getDealStages();

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Fırsatlar (Kanban)</h1>
        <p className="page-subtitle">Atanmış lead'lerin yönetim ve takip alanı.</p>
      </div>
      <KanbanBoard initialDeals={deals} initialStages={stages} />
    </div>
  );
}
