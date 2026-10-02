'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid Admin ID or Password');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('hairmart_admin_auth', JSON.stringify(data.user));
      }
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your connection.');
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setLoginId('Sameer');
    setPassword('Sameer@123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080A0E',
        backgroundImage: 'radial-gradient(ellipse at center, rgba(246, 201, 38, 0.08) 0%, #080A0E 70%)',
        padding: '20px',
      }}
    >
      <div
        className="card-premium"
        style={{
          maxWidth: '430px',
          width: '100%',
          padding: '36px 32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(246, 201, 38, 0.08)',
          border: '1px solid rgba(246, 201, 38, 0.25)',
          borderRadius: '16px',
        }}
      >
        {/* Salon Real Logo Badge */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <Logo size="lg" showText={false} />
          </div>
          <div
            style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: '24px',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Hair <span style={{ color: '#F6C926' }}>Mart</span>
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, cursive",
              fontStyle: 'italic',
              fontSize: '15px',
              color: '#F6C926',
              marginTop: '1px',
              marginBottom: '4px',
            }}
          >
            Studio
          </div>
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--text-muted)',
            }}
          >
            UNISEX FAMILY SALON &bull; SURATHKAL ADMIN
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#F87171',
              borderRadius: '8px',
              marginBottom: '20px',
              padding: '10px 14px',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Admin ID / Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Admin ID / Username / Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="e.g. admin or admin@hairmart.com"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#10141E',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#FFF',
                  padding: '12px 14px',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', opacity: 0.5 }}>
                👤
              </span>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Admin Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  fontSize: '11px',
                  color: 'var(--gold-400)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: '#10141E',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#FFF',
                  padding: '12px 14px',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', opacity: 0.5 }}>
                🔒
              </span>
            </div>
          </div>

          {/* Quick Default Credentials Pill */}
          <div
            style={{
              background: 'rgba(246, 201, 38, 0.08)',
              border: '1px solid rgba(246, 201, 38, 0.2)',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#F6C926' }}>Default Admin Access:</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>ID: <b style={{ color: '#FFFFFF' }}>Sameer</b> &bull; Pass: <b style={{ color: '#FFFFFF' }}>Sameer@123</b></div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '10px', padding: '4px 8px', borderColor: 'rgba(246, 201, 38, 0.4)', color: '#F6C926' }}
            >
              Fill Credentials
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-md w-full"
            style={{
              padding: '13px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>{loading ? 'Authenticating Admin...' : 'Sign In to Studio Admin'}</span>
            <span>&rarr;</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px' }}>
          <Link href="/" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            &larr; Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
