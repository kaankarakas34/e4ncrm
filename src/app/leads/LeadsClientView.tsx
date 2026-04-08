'use client';

import { useState } from 'react';
import { LayoutList, KanbanSquare, UserPlus, Upload } from 'lucide-react';
import { assignLeadToUser } from '../actions';
import AssignButton from './AssignButton';
import LeadImportModal from './LeadImportModal';

export default function LeadsClientView({ initialLeads, users }: { initialLeads: any[], users: any[] }) {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [leads, setLeads] = useState(initialLeads);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleLeadAssigned = (leadId: number) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  // Table View Component
  const renderTable = () => (
    <div className="data-table-container fade-up">
      <table className="data-table">
        <thead>
          <tr>
            <th>Adı Soyadı</th>
            <th>Meslek / Sektör</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Şehir</th>
            <th>Kaynak</th>
            <th>Tarih</th>
            <th>Ata (Agent)</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>Dağıtım bekleyen data yok.</td>
            </tr>
          )}
          {leads.map(lead => (
            <tr key={lead.id}>
              <td style={{ fontWeight: 600 }}>{lead.full_name}</td>
              <td style={{ color: 'var(--gray-400)' }}>{lead.profession || '-'}</td>
              <td>{lead.email}</td>
              <td>{lead.phone}</td>
              <td>{lead.city || '-'}</td>
              <td><span className="badge badge-gray">{lead.source}</span></td>
              <td style={{ color: 'var(--gray-500)' }}>{new Date(lead.created_at).toLocaleDateString()}</td>
              <td>
                <AssignButton leadId={lead.id} users={users} onAssign={() => handleLeadAssigned(lead.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Kanban View Component (No Drag, just cards)
  const renderKanban = () => {
    return (
      <div className="fade-up" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '16px', 
        alignItems: 'start' 
      }}>
        {leads.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-500)', gridColumn: '1 / -1' }}>
            Dağıtım bekleyen data yok.
          </div>
        )}
        {leads.map(lead => (
          <div 
            key={lead.id} 
            style={{ 
              background: 'var(--bg-elevated)', 
              padding: '16px', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{lead.full_name}</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '4px' }}>{lead.profession || 'Meslek Belirtilmedi'}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{lead.phone} • {lead.city || 'Şehir Yok'}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span className="badge badge-gray">{lead.source}</span>
              <AssignButton leadId={lead.id} users={users} onAssign={() => handleLeadAssigned(lead.id)} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex-between mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Data Dağıtım Alanı</h1>
          <p className="page-subtitle">Gelen talepleri Excel listesi veya Kanban (Sürükle bırak) formatında inceleyin.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setIsImportModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
          >
            <Upload size={18} /> Toplu Veri Ekle (Excel)
          </button>
          
          {/* View Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
            <button 
              onClick={() => setViewMode('table')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: viewMode === 'table' ? 'var(--bg-elevated)' : 'transparent',
                color: viewMode === 'table' ? 'var(--red-500)' : 'var(--gray-500)',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <LayoutList size={16} /> Liste
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                background: viewMode === 'kanban' ? 'var(--bg-elevated)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--red-500)' : 'var(--gray-500)',
                boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <KanbanSquare size={16} /> Dağıtım
            </button>
          </div>
        </div>
      </div>

      <LeadImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImported={() => window.location.reload()}
      />

      {viewMode === 'table' ? renderTable() : renderKanban()}
    </>
  );
}
