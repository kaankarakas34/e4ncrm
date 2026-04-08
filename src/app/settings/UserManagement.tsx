'use client';

import { useState } from 'react';
import { UserPlus, Trash2, Shield, User as UserIcon, Mail, Lock } from 'lucide-react';
import { createUser, deleteUser } from '../actions';

export default function UserManagement({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;
    
    setLoading(true);
    try {
      await createUser(formData);
      // In a real app we'd get the new user back, but for now let's just refresh or append
      window.location.reload(); 
    } catch (error) {
      alert('Kullanıcı oluşturulurken bir hata oluştu. Email adresi zaten kullanımda olabilir.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      alert('Kullanıcı silinemedi.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Create User Form */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} className="text-primary" /> Yeni Kullanıcı / Agent Ekle
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-400)' }}>Ad Soyad</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
              <input 
                className="input" 
                style={{ paddingLeft: '36px', width: '100%' }} 
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-400)' }}>Email Adresi</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
              <input 
                className="input" 
                type="email"
                style={{ paddingLeft: '36px', width: '100%' }} 
                placeholder="email@crm.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-400)' }}>Şifre</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
              <input 
                className="input" 
                type="password"
                style={{ paddingLeft: '36px', width: '100%' }} 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-400)' }}>Yetki Rolü</label>
            <select 
              className="input" 
              style={{ padding: '0 12px', height: '42px', width: '100%' }}
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">Agent (Satış Temsilcisi)</option>
              <option value="admin">Admin (Yönetici)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px' }}>
            {loading ? 'Ekleniyor...' : 'Kullanıcıyı Kaydet'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="card">
        <div className="table-header">
          <span className="table-title">Kayıtlı Kullanıcılar ({users.length})</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Email</th>
              <th>Rol</th>
              <th style={{ textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td style={{ color: 'var(--gray-500)' }}>{user.email || '-'}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-gray'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                    {user.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                    {user.role === 'admin' ? 'Yönetici' : 'Agent'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="btn btn-ghost" 
                    style={{ color: 'var(--red-500)', padding: '6px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
