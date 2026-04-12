'use client';

import { useState } from 'react';
import { Award, Phone, Tag, Calendar, Download, Briefcase, Search } from 'lucide-react';
import { revertMemberDeal } from '../actions';

export default function MembersClientView({ initialDeals, users, currentUser }: { initialDeals: any[], users: any[], currentUser: any }) {
  const [items, setItems] = useState(initialDeals);
  const [revertingId, setRevertingId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleTakeBack = async (dealId: number) => {
    setRevertingId(dealId);
    try {
      await revertMemberDeal(dealId, currentUser.id);
      setItems(prev => prev.filter(l => l.id !== dealId));
    } catch (err) {
      alert('Data geri alınamadı.');
    } finally {
      setRevertingId(null);
    }
  };

  const filteredItems = items.filter(deal => 
    (deal.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (deal.phone || '').includes(searchQuery) ||
    (deal.profession?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.deal_created_at || b.created_at).getTime() - new Date(a.deal_created_at || a.created_at).getTime();
    if (sortBy === 'oldest') return new Date(a.deal_created_at || a.created_at).getTime() - new Date(b.deal_created_at || b.created_at).getTime();
    if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
    if (sortBy === 'name_desc') return (b.full_name || '').localeCompare(a.full_name || '');
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Search and Sort Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
          <input 
            type="text" 
            placeholder="İsim, telefon veya meslek ara..." 
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

      {filteredItems.length === 0 && (
        <p style={{ color: 'var(--gray-600)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
          Eşleşen data bulunmuyor.
        </p>
      )}
      {filteredItems.map((deal) => (
        <div key={deal.id} className="list-row" style={{ padding: '16px', borderBottom: '1px solid var(--border)', cursor: 'default' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div className="avatar" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--blue-600)', color: 'var(--blue-400)' }}>
                <Award size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px', color: '#fff' }}>
                  {deal.full_name}
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--gray-400)' }}>
                    <Briefcase size={12} /> {deal.profession || '-'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--gray-400)' }}>
                    <Phone size={12} /> {deal.phone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--gray-500)' }}>
                    <Tag size={12} /> Üye Yapan: {deal.assigned_agent || '-'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--gray-500)' }}>
                    <Calendar size={12} /> Kayıt Tarihi: {deal.created_at ? new Date(deal.created_at).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                {deal.notes && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--gray-400)', background: 'var(--bg-elevated)', padding: '6px 10px', borderRadius: '4px' }}>
                    <strong>Not:</strong> {deal.notes}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => handleTakeBack(deal.id)}
                disabled={revertingId === deal.id}
                style={{
                  background: 'var(--blue-600)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} /> {revertingId === deal.id ? 'Alınıyor...' : 'Üzerime Al'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
