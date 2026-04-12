'use client';

import { useState } from 'react';
import { Award, Phone, Tag, Calendar, Download } from 'lucide-react';
import { revertMemberDeal } from '../actions';

export default function MembersClientView({ initialDeals, users, currentUser }: { initialDeals: any[], users: any[], currentUser: any }) {
  const [items, setItems] = useState(initialDeals);
  const [revertingId, setRevertingId] = useState<number | null>(null);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.length === 0 && (
        <p style={{ color: 'var(--gray-600)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
          Üye olan müşteri kaydı bulunmuyor.
        </p>
      )}
      {items.map((deal) => (
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
