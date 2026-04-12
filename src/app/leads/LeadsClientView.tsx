'use client';

import { useState } from 'react';
import { LayoutList, KanbanSquare, Upload, Trash2, Armchair, Award } from 'lucide-react';
import { deleteLeads, sendLeadsToDoluKoltuk, sendLeadsToMembers } from '../actions';
import AssignButton from './AssignButton';
import LeadImportModal from './LeadImportModal';

export default function LeadsClientView({ initialLeads, users }: { initialLeads: any[], users: any[] }) {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [leads, setLeads] = useState(initialLeads);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [sendingToFilled, setSendingToFilled] = useState(false);
  const [sendingToMembers, setSendingToMembers] = useState(false);

  const handleLeadAssigned = (leadId: number) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setSelectedIds(prev => prev.filter(id => id !== leadId));
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(leads.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Seçili ${selectedIds.length} datayı kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    
    setDeleting(true);
    try {
      await deleteLeads(selectedIds);
      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
      setSelectedIds([]);
    } catch (err) {
      alert('Silme işlemi başarısız oldu.');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkSendToFilled = async (ids: number[] = selectedIds) => {
    if (ids.length === 0) return;
    if (ids.length > 1 && !confirm(`Seçili ${ids.length} datayı Dolu Koltuk havuzuna göndermek istediğinize emin misiniz?`)) return;
    
    setSendingToFilled(true);
    try {
      await sendLeadsToDoluKoltuk(ids);
      setLeads(prev => prev.filter(l => !ids.includes(l.id)));
      if (ids === selectedIds) setSelectedIds([]);
    } catch (err) {
      alert('Gönderme işlemi başarısız oldu.');
    } finally {
      setSendingToFilled(false);
    }
  };

  const handleBulkSendToMembers = async (ids: number[] = selectedIds) => {
    if (ids.length === 0) return;
    if (ids.length > 1 && !confirm(`Seçili ${ids.length} datayı Üye Olanlar alanına göndermek istediğinize emin misiniz?`)) return;
    
    setSendingToMembers(true);
    try {
      await sendLeadsToMembers(ids);
      setLeads(prev => prev.filter(l => !ids.includes(l.id)));
      if (ids === selectedIds) setSelectedIds([]);
    } catch (err) {
      alert('Gönderme işlemi başarısız oldu.');
    } finally {
      setSendingToMembers(false);
    }
  };

  // Table View Component
  const renderTable = () => (
    <div className="data-table-container fade-up">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input 
                 type="checkbox" 
                 checked={selectedIds.length === leads.length && leads.length > 0}
                 onChange={(e) => handleSelectAll(e.target.checked)}
                 style={{ width: '14px', height: '14px', accentColor: 'var(--red-500)', cursor: 'pointer' }}
              />
            </th>
            <th>Adı Soyadı</th>
            <th>Meslek / Sektör</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Şehir</th>
            <th>Kaynak</th>
            <th>Tarih</th>
            <th>İşlem Yap</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '24px' }}>Dağıtım bekleyen data yok.</td>
            </tr>
          )}
          {leads.map(lead => (
            <tr key={lead.id} style={{ background: selectedIds.includes(lead.id) ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
              <td>
                <input 
                   type="checkbox" 
                   checked={selectedIds.includes(lead.id)}
                   onChange={() => handleToggleSelect(lead.id)}
                   style={{ width: '14px', height: '14px', accentColor: 'var(--red-500)', cursor: 'pointer' }}
                />
              </td>
              <td style={{ fontWeight: 600 }}>{lead.full_name}</td>
              <td style={{ color: 'var(--gray-400)' }}>{lead.profession || '-'}</td>
              <td>{lead.email}</td>
              <td>{lead.phone}</td>
              <td>{lead.city || '-'}</td>
              <td><span className="badge badge-gray">{lead.source}</span></td>
              <td style={{ color: 'var(--gray-500)' }}>{new Date(lead.created_at).toLocaleDateString()}</td>
              <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AssignButton leadId={lead.id} users={users} onAssign={() => handleLeadAssigned(lead.id)} />
                <button 
                  onClick={() => handleBulkSendToFilled([lead.id])}
                  disabled={sendingToFilled}
                  style={{ background: 'var(--orange-600)', border: 'none', color: '#fff', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                  title="Dolu Koltuğa Gönder"
                >
                  <Armchair size={13} />
                </button>
                <button 
                  onClick={() => handleBulkSendToMembers([lead.id])}
                  disabled={sendingToMembers}
                  style={{ background: 'var(--blue-600)', border: 'none', color: '#fff', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                  title="Üye Olanlara At"
                >
                  <Award size={13} />
                </button>
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
              background: selectedIds.includes(lead.id) ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-elevated)', 
              padding: '16px', 
              borderRadius: 'var(--radius-lg)', 
              border: selectedIds.includes(lead.id) ? '1px solid var(--red-500)' : '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <input 
                 type="checkbox" 
                 checked={selectedIds.includes(lead.id)}
                 onChange={() => handleToggleSelect(lead.id)}
                 style={{ width: '16px', height: '16px', accentColor: 'var(--red-500)', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px', paddingRight: '24px' }}>{lead.full_name}</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '4px' }}>{lead.profession || 'Meslek Belirtilmedi'}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{lead.phone} • {lead.city || 'Şehir Yok'}</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span className="badge badge-gray">{lead.source}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleBulkSendToMembers([lead.id])}
                  disabled={sendingToMembers}
                  style={{ background: 'var(--blue-600)', border: 'none', color: '#fff', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                  title="Üye Olanlara At"
                >
                  <Award size={13} />
                </button>
                <button 
                  onClick={() => handleBulkSendToFilled([lead.id])}
                  disabled={sendingToFilled}
                  style={{ background: 'var(--orange-600)', border: 'none', color: '#fff', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                  title="Dolu Koltuğa Gönder"
                >
                  <Armchair size={13} />
                </button>
                <AssignButton leadId={lead.id} users={users} onAssign={() => handleLeadAssigned(lead.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex-between mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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

      {/* Bulk Actions Header */}
      {selectedIds.length > 0 && (
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             {viewMode === 'kanban' && (
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === leads.length && leads.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--red-500)', cursor: 'pointer' }}
                />
             )}
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedIds.length} data seçili</span>
           </div>
           
           <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
             <button
               onClick={() => handleBulkSendToMembers(selectedIds)}
               disabled={sendingToMembers}
               className="btn btn-primary"
               style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--blue-600)' }}
             >
               {sendingToMembers ? 'Gönderiliyor...' : <><Award size={14} /> Seçilenleri Üye Yap</>}
             </button>
             <button
               onClick={() => handleBulkSendToFilled(selectedIds)}
               disabled={sendingToFilled}
               className="btn btn-primary"
               style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--orange-600)' }}
             >
               {sendingToFilled ? 'Gönderiliyor...' : <><Armchair size={14} /> Seçilenleri Dolu Koltuğa At</>}
             </button>
             <button
               onClick={handleBulkDelete}
               disabled={deleting}
               className="btn btn-primary"
               style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--red-600)' }}
             >
               {deleting ? 'Siliniyor...' : <><Trash2 size={14} /> Seçilenleri Sil</>}
             </button>
           </div>
         </div>
      )}

      <LeadImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImported={() => window.location.reload()}
      />

      {viewMode === 'table' ? renderTable() : renderKanban()}
    </>
  );
}
