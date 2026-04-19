'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, Tag, StickyNote, Save, Users, Briefcase } from 'lucide-react';
import { updateDealNotes, getUsers, reassignDeal } from '../actions';

export default function DealModal({ deal, isOpen, onClose, onUpdated }: { deal: any, isOpen: boolean, onClose: () => void, onUpdated: (newNotes: string, fetchNeeded?: boolean) => void }) {
  const [notes, setNotes] = useState(deal?.notes || '');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    if (deal) {
      setNotes(deal?.notes || '');
      setSelectedUser(deal?.user_id?.toString() || '');
    }
  }, [deal]);

  useEffect(() => {
    if (isOpen && users.length === 0) {
      getUsers().then(setUsers);
    }
  }, [isOpen, users.length]);

  if (!isOpen || !deal) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDealNotes(deal.id, notes);
      let fetchNeeded = false;
      if (selectedUser && selectedUser !== (deal.user_id?.toString() || '')) {
         await reassignDeal(deal.id, parseInt(selectedUser, 10));
         fetchNeeded = true;
      }
      onUpdated(notes, fetchNeeded);
      onClose();
    } catch (err) {
      alert('Kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 20px 20px', backdropFilter: 'blur(4px)', overflowY: 'auto' }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
        
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--gray-600)' }}>
              <User size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{deal.full_name}</h2>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '2px' }}>{deal.stage} Aşamasında</p>
            </div>
          </div>
          <X size={20} style={{ cursor: 'pointer', color: 'var(--gray-500)' }} onClick={onClose} />
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '70vh' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Briefcase size={12} /> MESLEK
              </label>
              <div style={{ fontSize: '14px', color: '#fff' }}>{deal.profession || '-'}</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Phone size={12} /> TELEFON
              </label>
              <div style={{ fontSize: '14px', color: '#fff' }}>{deal.phone}</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Tag size={12} /> KAYNAK
              </label>
              <div style={{ fontSize: '14px', color: '#fff' }}>{deal.source}</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Users size={12} /> ATANAN KİŞİ
              </label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="">Seçiniz</option>
                {users.map(u => (
                   <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StickyNote size={14} /> GÖRÜŞME NOTLARI
            </label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Müşteri görüşme detaylarını, talepleri ve sonraki adımları buraya yazabilirsiniz..."
              style={{
                width: '100%',
                minHeight: '180px',
                background: 'var(--bg-base)',
                border: '1px solid var(--gray-700)',
                borderRadius: '8px',
                padding: '16px',
                color: '#fff',
                fontSize: '13px',
                resize: 'none',
                outline: 'none',
                lineHeight: '1.5'
              }}
            />
          </div>

        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Kapat</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} /> {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>

      </div>
    </div>
  );
}
