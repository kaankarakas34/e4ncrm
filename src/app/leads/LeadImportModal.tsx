'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Check, Users, Phone, Mail, Tag, MapPin, Briefcase } from 'lucide-react';
import { importLeads } from '../actions';

interface ParsedLead {
  full_name: string;
  phone: string;
  email?: string;
  source?: string;
  profession?: string;
  city?: string;
}

export default function LeadImportModal({ isOpen, onClose, onImported }: { isOpen: boolean, onClose: () => void, onImported: () => void }) {
  const [names, setNames] = useState('');
  const [professions, setProfessions] = useState('');
  const [emails, setEmails] = useState('');
  const [phones, setPhones] = useState('');
  const [cities, setCities] = useState('');
  const [sources, setSources] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedLead[]>([]);

  useEffect(() => {
    const nameList = names.trim().split(/\r?\n/).map(v => v.trim()).filter(v => v);
    const phoneList = phones.trim().split(/\r?\n/).map(v => v.trim()).filter(v => v);
    const profList = professions.trim().split(/\r?\n/).map(v => v.trim());
    const emailList = emails.trim().split(/\r?\n/).map(v => v.trim());
    const cityList = cities.trim().split(/\r?\n/).map(v => v.trim());
    const sourceList = sources.trim().split(/\r?\n/).map(v => v.trim());

    const maxLines = Math.max(nameList.length, phoneList.length);
    const parsed: ParsedLead[] = [];

    for (let i = 0; i < maxLines; i++) {
        if (nameList[i] || phoneList[i]) {
            parsed.push({
                full_name: nameList[i] || 'İsimsiz',
                phone: phoneList[i] || 'Telefon Yok',
                profession: profList[i] || profList[0] || '',
                email: emailList[i] || '',
                city: cityList[i] || cityList[0] || '',
                source: sourceList[i] || sourceList[0] || 'Manuel Import'
            });
        }
    }
    setPreview(parsed);
  }, [names, phones, professions, emails, cities, sources]);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    try {
      await importLeads(preview);
      onImported();
      onClose();
      resetForm();
    } catch (error) {
      alert('Yükleme sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNames('');
    setPhones('');
    setProfessions('');
    setEmails('');
    setCities('');
    setSources('');
    setPreview([]);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '1200px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Data Dağıtım Tablosuna Göre Aktar</h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>Tüm kolonları Excel'den bağımsız kopyalayıp ilgili alana yapıştırabilirsiniz.</p>
          </div>
          <X size={20} style={{ cursor: 'pointer', color: 'var(--gray-500)' }} onClick={onClose} />
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} /> AD SOYAD
              </label>
              <textarea value={names} onChange={(e) => setNames(e.target.value)} placeholder="Ad Soyad..." style={textAreaStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Briefcase size={12} /> MESLEK / SEKTÖR
              </label>
              <textarea value={professions} onChange={(e) => setProfessions(e.target.value)} placeholder="Meslek..." style={textAreaStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} /> EMAİL
              </label>
              <textarea value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="Email..." style={textAreaStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> TELEFON
              </label>
              <textarea value={phones} onChange={(e) => setPhones(e.target.value)} placeholder="Telefon..." style={textAreaStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> ŞEHİR
              </label>
              <textarea value={cities} onChange={(e) => setCities(e.target.value)} placeholder="Şehir..." style={textAreaStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} /> KAYNAK
              </label>
              <textarea value={sources} onChange={(e) => setSources(e.target.value)} placeholder="Kaynak..." style={textAreaStyle} />
            </div>
          </div>

          {preview.length > 0 && (
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.05)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green-400)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={14} /> Dağıtım Tablosuna Hazır ({preview.length} Kayıt)
                </h4>
              </div>
              <div style={{ overflowX: 'auto', maxHeight: '200px' }}>
                <table className="data-table" style={{ fontSize: '11px', margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th>Adı Soyadı</th>
                      <th>Meslek</th>
                      <th>Email</th>
                      <th>Telefon</th>
                      <th>Şehir</th>
                      <th>Kaynak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 50).map((p, i) => (
                      <tr key={i}>
                        <td>{p.full_name}</td>
                        <td style={{ color: 'var(--gray-400)' }}>{p.profession || '-'}</td>
                        <td style={{ color: 'var(--gray-500)' }}>{p.email || '-'}</td>
                        <td style={{ color: p.phone === 'Telefon Yok' ? 'var(--red-500)' : 'inherit' }}>{p.phone}</td>
                        <td style={{ color: 'var(--gray-400)' }}>{p.city || '-'}</td>
                        <td><span className="badge badge-gray" style={{ fontSize: '9px' }}>{p.source}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Vazgeç</button>
          <button 
            className="btn btn-primary" 
            disabled={loading || preview.length === 0}
            onClick={handleImport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
          >
            <Upload size={18} /> {loading ? 'Aktarılıyor...' : `${preview.length} Kaydı Dağıtıma Gönder`}
          </button>
        </div>
      </div>
    </div>
  );
}

const textAreaStyle: React.CSSProperties = {
    width: '100%', 
    height: '140px', 
    background: 'var(--bg-base)', 
    border: '1px solid var(--gray-700)', 
    borderRadius: '6px', 
    color: '#fff', 
    padding: '10px', 
    fontSize: '11px', 
    resize: 'none', 
    outline: 'none'
};
