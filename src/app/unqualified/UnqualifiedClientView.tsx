'use client';

import { useState } from 'react';
import { AlertOctagon, Phone, Tag, Calendar, RefreshCcw } from 'lucide-react';
import { revertUnqualifiedLead } from '../actions';

export default function UnqualifiedClientView({ leads }: { leads: any[] }) {
  const [items, setItems] = useState(leads);
  const [revertingId, setRevertingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.length === 0 && (
        <p style={{ color: 'var(--gray-600)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
          İşlevsiz data bulunmuyor.
        </p>
      )}
      {items.map((lead) => (
        <div key={lead.id} className="list-row" style={{ padding: '16px', borderBottom: '1px solid var(--border)', cursor: 'default' }}>
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
