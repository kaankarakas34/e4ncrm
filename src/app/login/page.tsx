'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Mail, Lock, AlertCircle, ChevronRight } from 'lucide-react';
import { login } from '../actions';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await login(formData);

    if (res.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(res.error || 'Giriş yapılamadı.');
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at top right, #1e1b4b, #020617)',
      position: 'fixed',
      inset: 0,
      zIndex: 9999
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'rgba(239, 68, 68, 0.05)', filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'rgba(30, 64, 175, 0.1)', filter: 'blur(100px)', borderRadius: '50%' }} />

      <div style={{ width: '100%', maxWidth: '440px', padding: '20px', position: 'relative' }}>
        
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'linear-gradient(135deg, var(--red-600), var(--red-500))', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px',
            boxShadow: '0 8px 16px rgba(220, 38, 38, 0.3)'
          }}>
            <Briefcase size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            E4N <span style={{ color: 'var(--red-500)' }}>CRM</span>
          </h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '8px', fontSize: '15px' }}>Premium Lead Management System</p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '40px', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-400)' }}>Email Adresi</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
                <input 
                  name="email"
                  type="email" 
                  required 
                  className="input" 
                  placeholder="admin@crm.com"
                  style={{ width: '100%', paddingLeft: '44px', background: 'rgba(15, 23, 42, 0.6)', height: '48px', fontSize: '15px', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-400)' }}>Şifre</label>
                <a href="#" style={{ fontSize: '12px', color: 'var(--red-500)', textDecoration: 'none' }}>Şifremi Unuttum</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }} />
                <input 
                  name="password"
                  type="password" 
                  required 
                  className="input" 
                  placeholder="••••••••"
                  style={{ width: '100%', paddingLeft: '44px', background: 'rgba(15, 23, 42, 0.6)', height: '48px', fontSize: '15px', color: '#fff' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '13px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary" 
              style={{ 
                height: '48px', 
                fontSize: '16px', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                marginTop: '8px'
              }}
            >
              {loading ? 'Giriş Yapılıyor...' : (
                <>
                  Giriş Yap <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--gray-600)', fontSize: '13px' }}>
          © 2026 E4N Digital. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
