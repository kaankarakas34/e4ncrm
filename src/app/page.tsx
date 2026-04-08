import { getDashboardStats, getRecentUnassignedLeads } from './actions';

export const dynamic = 'force-dynamic';
import {
  Users,
  Briefcase,
  AlertOctagon,
  Inbox,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

const STAGE_COLOR: Record<string, string> = {
  'Olumlu':          'badge badge-green',
  'Tekrar Aranacak': 'badge badge-gray',
  'Olumsuz':         'badge badge-red',
  'Islevsiz':        'badge badge-red',
};

export default async function Dashboard() {
  const stats = await getDashboardStats();
  const unassignedLeads = await getRecentUnassignedLeads();

  return (
    <div className="fade-up">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Genel operasyon ve lead dağılım durumu.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn btn-ghost">
            <TrendingUp size={15} /> Rapor Al
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card fade-up">
          <div className="stat-icon-wrapper"><Inbox size={20} /></div>
          <div className="stat-label">Toplam Lead</div>
          <div className="stat-value">{stats.totalLeads}</div>
          <div className="stat-change">Reklamlardan gelen data</div>
        </div>

        <div className="stat-card fade-up">
          <div className="stat-icon-wrapper"><Briefcase size={20} /></div>
          <div className="stat-label">Aktif Fırsatlar</div>
          <div className="stat-value">{stats.activeDeals}</div>
          <div className="stat-change">Şu an işlemdeki aramalar</div>
        </div>

        <div className="stat-card fade-up">
          <div className="stat-icon-wrapper"><AlertOctagon size={20} /></div>
          <div className="stat-label">İşlevsiz / Düşen</div>
          <div className="stat-value">{stats.islevsiz}</div>
          <div className="stat-change">Ulaşılamayan leadler</div>
        </div>

        <div className="stat-card fade-up">
          <div className="stat-icon-wrapper"><Users size={20} /></div>
          <div className="stat-label">Aktif Ajanlar</div>
          <div className="stat-value">{stats.agents}</div>
          <div className="stat-change">Sistemdeki personeller</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="two-col-grid">

        {/* Son Atanan Fırsatlar */}
        <div className="card">
          <div className="table-header">
            <span className="table-title">Son Gelişmeler (Atanmış Fırsatlar)</span>
            <a
              href="/deals"
              style={{ fontSize: 12, color: 'var(--red-500)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Hepsini Gör <ArrowUpRight size={12} />
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stats.recentDeals.length === 0 && (
              <p style={{ color: 'var(--gray-600)', fontSize: 13, padding: '12px 0' }}>Henüz aktivite yok.</p>
            )}
            {stats.recentDeals.map((deal: any) => (
              <div key={deal.id} className="list-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--red-500)', flexShrink: 0
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-100)' }}>{deal.contact_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Atanan: {deal.user_name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={STAGE_COLOR[deal.stage] ?? 'badge badge-gray'}>{deal.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yeni / Dağıtım Bekleyen Leadler */}
        <div className="card">
          <div className="table-header">
            <span className="table-title">Atanmayı Bekleyen Leadler</span>
            <a
              href="/leads"
              style={{ fontSize: 12, color: 'var(--red-500)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Dağıtım Alanına Git <ArrowUpRight size={12} />
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {unassignedLeads.length === 0 && (
              <p style={{ color: 'var(--gray-600)', fontSize: 13, padding: '12px 0' }}>Bekleyen data yok.</p>
            )}
            {unassignedLeads.map((lead: any) => (
              <div key={lead.id} className="list-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar">{(lead.full_name || 'U')[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-100)' }}>{lead.full_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{lead.source}</div>
                  </div>
                </div>
                <span className="badge badge-gray">
                  Dağıtım Bekliyor
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
