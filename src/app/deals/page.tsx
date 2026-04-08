import { getMyDeals, getDealStages } from '../actions';
import KanbanBoard from './KanbanBoard';

export default async function DealsPage() {
  const deals = await getMyDeals();
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
