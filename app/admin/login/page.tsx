'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Admin login authentication is removed: redirect directly to Admin Dashboard
    router.replace('/admin');
  }, [router]);

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
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(246, 201, 38, 0.08)',
          border: '1px solid rgba(246, 201, 38, 0.25)',
          borderRadius: '16px',
        }}
      >
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
            marginBottom: '24px',
          }}
        >
          UNISEX FAMILY SALON &bull; SURATHKAL ADMIN
        </div>

        <div
          style={{
            background: 'rgba(246, 201, 38, 0.1)',
            border: '1px solid rgba(246, 201, 38, 0.25)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F6C926', marginBottom: '4px' }}>
            🔓 Direct Admin Access Enabled
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Admin login authentication is disabled. Redirecting to the admin dashboard...
          </p>
        </div>

        <Link
          href="/admin"
          className="btn btn-primary w-full"
          style={{ textDecoration: 'none', display: 'inline-flex', justifyContent: 'center' }}
        >
          Go to Admin Dashboard →
        </Link>
      </div>
    </div>
  );
}
