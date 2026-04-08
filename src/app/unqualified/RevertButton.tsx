'use client';

import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { revertUnqualifiedLead } from '../actions';

export default function RevertButton({ leadId }: { leadId: number }) {
  const [loading, setLoading] = useState(false);

  const handleRevert = async () => {
    if (!confirm('Bu kaydı tekrar aktif satış listesine (Tekrar Aranacak) döndürmek istediğinize emin misiniz?')) return;
    
    setLoading(true);
    try {
      await revertUnqualifiedLead(leadId);
    } catch (error) {
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRevert}
      disabled={loading}
      className="btn btn-ghost"
      style={{ 
        padding: '6px 12px', 
        fontSize: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        color: 'var(--green-500)',
        borderColor: 'rgba(34, 197, 94, 0.2)'
      }}
    >
      <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
      {loading ? 'Geri Alınıyor...' : 'Geri Al'}
    </button>
  );
}
