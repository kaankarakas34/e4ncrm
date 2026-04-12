'use client';

import { useState } from 'react';
import { AlertOctagon, Phone, Tag, Calendar, RefreshCcw, Trash2, Search } from 'lucide-react';
import { revertUnqualifiedLead, deleteLeads } from '../actions';

export default function UnqualifiedClientView({ leads }: { leads: any[] }) {
  const [items, setItems] = useState(leads);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [revertingId, setRevertingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredItems = items.filter(lead => 
    (lead.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (lead.phone || '').includes(searchQuery)
  ).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
    if (sortBy === 'name_desc') return (b.full_name || '').localeCompare(a.full_name || '');
    return 0;
  });

  const handleRevert = async (leadId: number) => {
    setRevertingId(leadId);
    try {
      await revertUnqualifiedLead(leadId);
      setItems(prev => prev.filter(l => l.id !== leadId));
    } catch (err) {
      alert('Geri alma işlemi başarısız oldu.');
    } finally {
      setRevertingId(null);
      setConfirmId(null);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredItems.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Seçili ${selectedIds.length} veriyi kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    
    setDeleting(true);
    try {
      await deleteLeads(selectedIds);
      setItems(prev => prev.filter(l => !selectedIds.includes(l.id)));
      setSelectedIds([]);
    } catch (err) {
      alert('Silme işlemi başarısız oldu.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Search and Sort Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
          <input 
            type="text" 
            placeholder="İsim veya telefon ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '6px', 
              padding: '10px 14px 10px 38px', 
              color: '#fff', 
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border)', 
            borderRadius: '6px', 
            padding: '10px 14px', 
            color: '#fff', 
            fontSize: '13px',
            outline: 'none',
            minWidth: '150px'
          }}
        >
          <option value="newest">En Yeniler Önce</option>
          <option value="oldest">En Eskiler Önce</option>
          <option value="name_asc">İsim (A-Z)</option>
          <option value="name_desc">İsim (Z-A)</option>
        </select>
      </div>

      {/* Bulk Action Header */}
      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <input 
               type="checkbox" 
               checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
               onChange={(e) => handleSelectAll(e.target.checked)}
               style={{ width: '16px', height: '16px', accentColor: 'var(--red-500)', cursor: 'pointer' }}
             />
             <span style={{ fontSize: '13px', fontWeight: 600 }}>Tümünü Seç ({selectedIds.length} seçili)</span>
          </div>
          {selectedIds.length > 0 && (
             <button
               onClick={handleBulkDelete}
               disabled={deleting}
               className="btn btn-primary"
               style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--red-600)' }}
             >
               {deleting ? 'Siliniyor...' : <><Trash2 size={14} /> Seçilenleri Kalıcı Sil</>}
             </button>
          )}
        </div>
      )}

      {filteredItems.length === 0 && (
        <p style={{ color: 'var(--gray-600)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
          İşlevsiz data bulunmuyor.
        </p>
      )}
      {filteredItems.map((lead) => (
        <div key={lead.id} className="list-row" style={{ padding: '16px', borderBottom: '1px solid var(--border)', cursor: 'default', display: 'flex', gap: '16px', alignItems: 'center', background: selectedIds.includes(lead.id) ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
          
          <input 
             type="checkbox" 
             checked={selectedIds.includes(lead.id)}
             onChange={() => handleToggleSelect(lead.id)}
             style={{ width: '16px', height: '16px', accentColor: 'var(--red-500)', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div className="avatar" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--gray-600)', color: 'var(--gray-500)' }}>
                <AlertOctagon size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px', textDecoration: 'line-through', color: 'var(--gray-500)' }}>
                  {lead.full_name}
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--gray-500)' }}>
                    <Phone size={12} /> {lead.phone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--gray-600)' }}>
                    <Tag size={12} /> Atanan: {lead.assigned_agent || '-'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--gray-600)' }}>
                    <Calendar size={12} /> {lead.created_at ? new Date(lead.created_at).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span className="badge badge-gray" style={{ color: 'var(--red-500)', border: '1px solid rgba(239,68,68,0.2)' }}>
                İşlevsiz
              </span>

              {confirmId === lead.id ? (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Emin misiniz?</span>
                  <button
                    onClick={() => handleRevert(lead.id)}
                    disabled={revertingId === lead.id}
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#22c55e',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {revertingId === lead.id ? 'Geri Alınıyor...' : 'Evet, Geri Al'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--gray-400)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    İptal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(lead.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    borderRadius: '4px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCcw size={13} /> Geri Al
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
