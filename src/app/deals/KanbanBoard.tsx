'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateDealStage, createDealStage, updateDealStageName, deleteDealStage } from '../actions';
import { Plus, Settings2, X, Check, Trash2, Edit2 } from 'lucide-react';
import DealModal from './DealModal';

export default function KanbanBoard({ initialDeals, initialStages }: { initialDeals: any[], initialStages: any[] }) {
  const router = useRouter();
  const [deals, setDeals] = useState(initialDeals);
  const [stages, setStages] = useState(initialStages);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // For editing
  const [editingStageId, setEditingStageId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // For Deal Modal
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  const handleStageChange = async (dealId: number, stageName: string) => {
    if (stageName === 'Islevsiz' || stageName === 'Dolu Koltuk' || stageName === 'Üye Olanlar') {
      setDeals(deals.filter(d => d.id !== dealId));
    } else {
      setDeals(deals.map(d => d.id === dealId ? { ...d, stage: stageName } : d));
    }
    await updateDealStage(dealId, stageName);
  };

  const handleAddStage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newStageName.trim() || loading) return;
    
    setLoading(true);
    try {
      const newStage = await createDealStage(newStageName);
      
      if (newStage) {
        window.location.reload();
        // Return early so we don't try to scroll or set loading false before reload happens
        return;
      } else {
        alert('Bu isimde bir segment zaten mevcut.');
        setLoading(false);
        return;
      }

      
    } catch (err: any) {
      console.error(err);
      alert('Hata: Aynı isme sahip bir segmentiniz zaten var veya bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (id: number) => {
    setLoading(true);
    try {
      await updateDealStageName(id, editingName);
      setEditingStageId(null);
      window.location.reload();
    } catch (err) {
      alert('Segment güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStage = async (id: number, stageName: string) => {
    const stageDeals = deals.filter(d => d.stage === stageName);
    if (stageDeals.length > 0) {
      alert(`"${stageName}" segmentinde ${stageDeals.length} adet lead bulunuyor. Silmek için önce bu lead'leri başka bir segmente taşıyın.`);
      return;
    }
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteDealStage(id);
      setStages(prev => prev.filter(s => s.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert('Segment silinemedi.');
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredDeals = deals.filter(deal => 
    (deal.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (deal.phone || '').includes(searchQuery) ||
    (deal.source?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleAddStage} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '400px' }}>
          <input 
            placeholder="Hızlı Segment Ekle... (örn: Toplantı)"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            disabled={loading}
            style={{ 
              flex: 1, 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border)', 
              color: '#fff', 
              borderRadius: '6px', 
              padding: '10px 14px',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !newStageName.trim()}>
            {loading ? '...' : <Plus size={18} />}
          </button>
        </form>
        
        <div style={{ flex: 1, maxWidth: '300px', display: 'flex', position: 'relative' }}>
          <input 
            placeholder="Panoda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        <button className="btn btn-ghost" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
          <Settings2 size={16} /> Düzenle
        </button>
      </div>

      {isSettingsOpen && (
        <div className="card" style={{ border: '1px solid var(--red-600)', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Segmentleri Düzenle / Sil</h3>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setIsSettingsOpen(false)} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {stages.map(stage => (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                {editingStageId === stage.id ? (
                  <>
                    <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)} style={{ background: 'var(--bg-base)', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Check size={14} color="var(--green-500)" style={{ cursor: 'pointer' }} onClick={() => handleUpdateStage(stage.id)} />
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '13px' }}>{stage.name}</span>
                    <button onClick={() => {setEditingStageId(stage.id); setEditingName(stage.name); setConfirmDeleteId(null);}} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer' }}>
                      <Settings2 size={12} />
                    </button>
                    {confirmDeleteId === stage.id ? (
                      <>
                        <span style={{ fontSize: '10px', color: 'var(--red-400)' }}>Emin misin?</span>
                        <button
                          onClick={() => handleConfirmDelete(stage.id)}
                          disabled={loading}
                          style={{ background: 'none', border: 'none', color: 'var(--red-500)', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}
                        >
                          {loading ? '...' : 'Evet'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', fontSize: '10px' }}
                        >
                          İptal
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleDeleteStage(stage.id, stage.name)} style={{ background: 'none', border: 'none', color: 'var(--red-500)', cursor: 'pointer' }}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div 
        ref={scrollContainerRef}
        style={{ 
          display: 'flex', 
          gap: '20px', 
          overflowX: 'auto', 
          overflowY: 'visible',
          paddingBottom: '24px',
          alignItems: 'start'
        }}>
        {stages.filter(stage => stage.name !== 'Islevsiz' && stage.name !== 'Dolu Koltuk' && stage.name !== 'Üye Olanlar').map(stage => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage.name);
          return (
            <div 
              key={stage.id}
              style={{
                minWidth: '320px',
                width: '320px',
                flexShrink: 0,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{stage.name}</h4>
                <span className="badge badge-gray">{stageDeals.length}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stageDeals.map(deal => (
                  <div 
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--red-500)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{deal.full_name}</div>
                      <Edit2 size={14} style={{ color: 'var(--gray-500)' }} />
                    </div>
                    
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>{deal.phone}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center', gap: '8px' }}>
                       <span style={{ fontSize: '10px', color: 'var(--gray-600)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{deal.source}</span>
                       <div style={{ display: 'flex', gap: '6px', alignItems: 'center', minWidth: 0 }}>
                         <select 
                           value={deal.stage}
                           onChange={(e) => handleStageChange(deal.id, e.target.value)}
                           onClick={(e) => e.stopPropagation()}
                           style={{ 
                             background: 'var(--bg-surface)', 
                             color: 'var(--gray-300)', 
                             border: '1px solid var(--gray-700)', 
                             borderRadius: '4px', 
                             fontSize: '10px',
                             outline: 'none',
                             padding: '3px 4px',
                             cursor: 'pointer',
                             width: 'auto',
                             maxWidth: '90px'
                           }}
                         >
                           {stages.filter(s => s.name !== 'Islevsiz' && s.name !== 'Dolu Koltuk' && s.name !== 'Üye Olanlar').map(s => (
                             <option key={s.id} value={s.name} style={{ background: '#1a1a1a', color: 'white' }}>{s.name}</option>
                           ))}
                           <option value="Dolu Koltuk" style={{ background: '#3a200f', color: '#ffb16b' }}>Dolu Koltuk</option>
                           <option value="Üye Olanlar" style={{ background: '#0f203a', color: '#6ba3ff' }}>Üye Olanlar</option>
                           <option value="Islevsiz" style={{ background: '#3a0f0f', color: '#ff6b6b' }}>İşlevsiz</option>
                         </select>
                         <div className="avatar" style={{ width: '20px', height: '20px', fontSize: '9px', flexShrink: 0 }}>{(deal.agent_name || 'U')[0]}</div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div style={{ minWidth: '40px', height: '10px' }} />
      </div>

      <DealModal 
        deal={selectedDeal} 
        isOpen={selectedDeal !== null} 
        onClose={() => setSelectedDeal(null)} 
        onUpdated={(newNotes, fetchNeeded) => {
          if (fetchNeeded) {
            window.location.reload();
          } else {
            setDeals(deals.map(d => d.id === selectedDeal.id ? { ...d, notes: newNotes } : d));
          }
        }}
      />
    </div>
  );
}
