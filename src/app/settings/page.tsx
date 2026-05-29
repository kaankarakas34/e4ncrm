import { getUsers } from '../actions';
import UserManagement from './UserManagement';
import { cookies } from 'next/headers';
import ExportAllDataButton from '@/components/ExportAllDataButton';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const users = await getUsers();
  
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('auth_session')?.value;
  let user = null;
  if (sessionStr) {
    try { user = JSON.parse(sessionStr); } catch (e) {}
  }
  const isAdmin = user?.role === 'admin';

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Ayarlar ve Yönetim</h1>
        <p className="page-subtitle">Sistem ayarları ve kullanıcı yönetimi.</p>
      </div>

      <div style={{ display: 'grid', gap: '40px' }}>
        <section>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Kullanıcı Yönetimi</h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Yeni agent/admin ekleyebilir veya mevcut kullanıcıları yönetebilirsiniz.</p>
          </div>
          <UserManagement initialUsers={users} />
        </section>

        {isAdmin && (
          <section className="card" style={{ padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Veri Yönetimi
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>
                Sistem içerisindeki tüm verileri (Aday havuzu, aktif fırsatlar, dolu koltuk, üye olanlar ve işlevsiz datalar) detaylı bir Excel dosyası halinde bilgisayarınıza indirebilirsiniz.
              </p>
            </div>
            <div style={{ width: 'fit-content' }}>
              <ExportAllDataButton />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
