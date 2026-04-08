import { getUsers } from '../actions';
import UserManagement from './UserManagement';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const users = await getUsers();

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
      </div>
    </div>
  );
}
