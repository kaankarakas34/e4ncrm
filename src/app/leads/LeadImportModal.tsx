'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Check, Users, Phone, Mail, Tag, MapPin, Briefcase, FileSpreadsheet, Download } from 'lucide-react';
import { importLeads } from '../actions';
import * as XLSX from 'xlsx';

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only parse manual text areas if there's no preview populated from Excel
    if (names || phones || professions || emails || cities || sources) {
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
    }
  }, [names, phones, professions, emails, cities, sources]);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
        ["Ad Soyad", "Meslek / Sektör", "Email", "Telefon", "Şehir", "Kaynak"],
        ["Örnek Kişi", "Mühendis", "ornek@mail.com", "0555 555 5555", "İstanbul", "Meta Ads"]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sablon");
    XLSX.writeFile(wb, "E4N_CRM_Data_Sablonu.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Skip header row
            const parsed: ParsedLead[] = [];
            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (!row || row.length === 0 || (!row[0] && !row[3])) continue; // Need at least name or phone
                
                parsed.push({
                    full_name: row[0]?.toString().trim() || 'İsimsiz',
                    profession: row[1]?.toString().trim() || '',
                    email: row[2]?.toString().trim() || '',
                    phone: row[3]?.toString().trim() || 'Telefon Yok',
                    city: row[4]?.toString().trim() || '',
                    source: row[5]?.toString().trim() || 'Excel Import'
                });
            }
            setPreview(parsed);
            
            // Clear manual inputs if uploading
            setNames(''); setPhones(''); setProfessions(''); setEmails(''); setCities(''); setSources('');
        } catch (error) {
            alert('Excel dosyası okunamadı. Lütfen şablonu kullandığınızdan emin olun.');
        }
    };
    reader.readAsBinaryString(file);
    // Reset input value to allow uploading same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Data Ekle / İçeri Aktar</h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>Excel dosyasını doğrudan aktarın veya ilgili alanlara kopyala-yapıştır yapın.</p>
          </div>
          <X size={20} style={{ cursor: 'pointer', color: 'var(--gray-500)' }} onClick={onClose} />
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Direct Excel Upload Section */}
          <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--gray-700)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px', color: 'var(--green-500)' }}>
                   <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Excel Dosyasından Otomatik Aktarım</h3>
                  <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>Önce şablonu indirin, verilerinizi doldurun ve ardından buraya yükleyin.</p>
                </div>
             </div>
             
             <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleDownloadTemplate} className="btn btn-ghost" style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', padding: '6px 12px' }}>
                   <Download size={14} /> Örnek Şablonu İndir
                </button>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                  id="excel-upload"
                />
                <label htmlFor="excel-upload" className="btn btn-primary" style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', padding: '6px 12px', cursor: 'pointer' }}>
                   <Upload size={14} /> Şablonu Yükle
                </label>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <hr style={{ flex: 1, borderColor: 'var(--gray-800)' }} />
             <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>VEYA MANUEL KOPYALA-YAPIŞTIR</span>
             <hr style={{ flex: 1, borderColor: 'var(--gray-800)' }} />
          </div>

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
          <button className="btn btn-ghost" onClick={() => { resetForm(); onClose(); }} disabled={loading}>Vazgeç</button>
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
