'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, Tag, StickyNote, Save, Users, Briefcase, Mail, MapPin, Calendar, MessageSquare } from 'lucide-react';
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Briefcase size={12} /> MESLEK / SEKTÖR
              </label>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{deal.profession || '-'}</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Phone size={12} /> TELEFON
              </label>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{deal.phone}</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Mail size={12} /> E-POSTA
              </label>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500, wordBreak: 'break-all' }}>{deal.email || '-'}</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <MapPin size={12} /> ŞEHİR
              </label>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{deal.city || '-'}</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Tag size={12} /> KAYNAK
              </label>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{deal.source}</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Calendar size={12} /> KAYIT TARİHİ
              </label>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                {deal.created_at ? new Date(deal.created_at).toLocaleString('tr-TR') : '-'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Users size={12} /> DANIŞMAN ATAMASI
              </label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--gray-700)',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '13px',
                  outline: 'none',
                  marginTop: '4px'
                }}
              >
                <option value="">Seçiniz</option>
                {users.map(u => (
                   <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {deal.message && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} /> KAYIT ESNASINDAKİ MESAJ / TALEP
              </label>
              <div style={{ fontSize: '13px', color: 'var(--gray-300)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {deal.message}
              </div>
            </div>
          )}

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
