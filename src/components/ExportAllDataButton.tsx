'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getAllCrmDataExport } from '@/app/actions';
import * as XLSX from 'xlsx';

interface ExportAllDataButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ExportAllDataButton({ className, style }: ExportAllDataButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await getAllCrmDataExport();
      const wb = XLSX.utils.book_new();

      // 1. Aday Havuzu (Leads)
      const newLeadsWS = data.newLeads.length > 0 
        ? XLSX.utils.json_to_sheet(data.newLeads)
        : XLSX.utils.json_to_sheet([{ "Durum": "Havuzda bekleyen aday bulunmamaktadır." }]);
      XLSX.utils.book_append_sheet(wb, newLeadsWS, "Aday Havuzu (Leads)");

      // 2. Tüm Aktif Fırsatlar (Deals)
      const activeDealsWS = data.activeDeals.length > 0
        ? XLSX.utils.json_to_sheet(data.activeDeals)
        : XLSX.utils.json_to_sheet([{ "Durum": "Aktif fırsat bulunmamaktadır." }]);
      XLSX.utils.book_append_sheet(wb, activeDealsWS, "Tüm Aktif Fırsatlar (Deals)");

      // 3. Her bir aktif segment için dinamik sayfa
      if (data.activeDeals.length > 0) {
        // Group by segment
        const dealsBySegment: Record<string, any[]> = {};
        for (const deal of data.activeDeals) {
          const segmentName = deal["Segment"] || "Tanımsız";
          if (!dealsBySegment[segmentName]) {
            dealsBySegment[segmentName] = [];
          }
          // Remove redundant Segment column inside the segment-specific sheets
          const { "Segment": _, ...dealWithoutSegment } = deal;
          dealsBySegment[segmentName].push(dealWithoutSegment);
        }

        // Add sheets for each segment
        for (const [segmentName, segmentDeals] of Object.entries(dealsBySegment)) {
          const wsSeg = XLSX.utils.json_to_sheet(segmentDeals);
          // Excel sheet name length limit is 31 characters, remove special characters
          const cleanName = segmentName.replace(/[\\\?\*\/\[\]]/g, '');
          const sheetName = `Seg - ${cleanName}`.substring(0, 31);
          XLSX.utils.book_append_sheet(wb, wsSeg, sheetName);
        }
      }

      // 4. Dolu Koltuk
      const doluKoltukWS = data.doluKoltuk.length > 0
        ? XLSX.utils.json_to_sheet(data.doluKoltuk)
        : XLSX.utils.json_to_sheet([{ "Durum": "Dolu koltukta kayıt bulunmamaktadır." }]);
      XLSX.utils.book_append_sheet(wb, doluKoltukWS, "Dolu Koltuk");

      // 5. Üye Olanlar
      const uyeOlanlarWS = data.uyeOlanlar.length > 0
        ? XLSX.utils.json_to_sheet(data.uyeOlanlar)
        : XLSX.utils.json_to_sheet([{ "Durum": "Üye olan kayıt bulunmamaktadır." }]);
      XLSX.utils.book_append_sheet(wb, uyeOlanlarWS, "Üye Olanlar");

      // 6. İşlevsiz Data
      const islevsizWS = data.islevsiz.length > 0
        ? XLSX.utils.json_to_sheet(data.islevsiz)
        : XLSX.utils.json_to_sheet([{ "Durum": "İşlevsiz kayıt bulunmamaktadır." }]);
      XLSX.utils.book_append_sheet(wb, islevsizWS, "İşlevsiz Data");

      // Write and download file
      const fileName = `E4N_CRM_Tum_Veriler_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
      alert("Veriler indirilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className={className || "btn btn-primary"} 
      onClick={handleExport} 
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        ...style
      }}
    >
      {loading ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Hazırlanıyor...
        </>
      ) : (
        <>
          <Download size={15} />
          Tüm Datayı Dışa Aktar (Excel)
        </>
      )}
    </button>
  );
}
