import { getLeads } from '../actions';
import UnqualifiedClientView from './UnqualifiedClientView';

export const dynamic = 'force-dynamic';

export default async function UnqualifiedPage() {
  const leads = await getLeads('Not_Qualified');

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">İşlevsiz Datalar</h1>
          <p className="page-subtitle">Ulaşılamayan veya olumsuz sonuçlanıp düşen lead kayıtları.</p>
        </div>
      </div>

      <div className="card">
        <div className="table-header">
          <span className="table-title">İşlevsiz Havuzu ({leads.length})</span>
        </div>
        <UnqualifiedClientView leads={leads} />
      </div>
    </div>
  );
}
