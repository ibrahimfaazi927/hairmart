'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'SALON OPERATIONS',
    items: [
      { href: '/admin', label: 'Overview', icon: '📊' },
      { href: '/admin/billing', label: 'POS Billing', icon: '💳' },
      { href: '/admin/chairs', label: 'Chair Management', icon: '🪑' },
      { href: '/admin/staff', label: 'Staff & Attendance', icon: '👔' },
      { href: '/staff', label: 'Staff Terminal (Walk In/Out)', icon: '⏱️' },
      { href: '/admin/customers', label: 'Customers / CRM', icon: '👥' },
    ],
  },
  {
    title: 'CATALOGUE',
    items: [
      { href: '/admin/services', label: 'Services Catalogue', icon: '📋' },
      { href: '/admin/products', label: 'Professional Products', icon: '🧴' },
    ],
  },
  {
    title: 'REPORTS & AUDIT',
    items: [
      { href: '/admin/reports', label: 'Revenue & Reports', icon: '📑' },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      { href: '/admin/reviews', label: 'Reviews & Feedback', icon: '⭐' },
      { href: '/admin/gallery', label: 'Studio Gallery', icon: '🖼️' },
      { href: '/admin/settings', label: 'Salon Settings', icon: '⚙️' },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // If on login page, render children without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Load custom admin profile if saved, default to Sameer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hairmart_admin_auth');
      if (stored) {
        try {
          setAdminUser(JSON.parse(stored));
        } catch {
          setAdminUser({ name: 'Sameer', email: 'Sameer' });
        }
      } else {
        setAdminUser({ name: 'Sameer', email: 'Sameer' });
      }
    }
  }, []);

  // Update live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(`${dateStr} | ${timeStr}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExitAdmin = () => {
    router.push('/');
  };

  // Determine topbar page title
  let pageTitle = 'Hair Mart Studio';
  let pageSubtitle = 'Surathkal Salon Hub • Direct POS & CRM';

  if (pathname === '/admin') {
    pageTitle = 'Hair Mart Studio — Overview';
    pageSubtitle = 'Real-time salon KPIs, daily revenue and customer activity';
  } else if (pathname === '/admin/billing') {
    pageTitle = 'Hair Mart Studio — POS Billing';
    pageSubtitle = 'Touch POS: Select customer, chair, services and print receipt';
  } else if (pathname === '/admin/chairs') {
    pageTitle = 'Hair Mart Studio — Chair Management';
    pageSubtitle = 'Styling chairs (Men 1-4 & Women 1-2), staff assignment and active status';
  } else if (pathname === '/admin/staff') {
    pageTitle = 'Hair Mart Studio — Staff & Attendance Hub';
    pageSubtitle = 'Staff profiles, daily walk-in/walk-out, leave management and chair assignments';
  } else if (pathname === '/admin/customers') {
    pageTitle = 'Hair Mart Studio — Client Management';
    pageSubtitle = 'Manage your customers, visit history and contact profiles';
  } else if (pathname === '/admin/services') {
    pageTitle = 'Hair Mart Studio — Services Catalogue';
    pageSubtitle = 'Manage salon services, pricing, durations and POS images';
  } else if (pathname === '/admin/products') {
    pageTitle = 'Hair Mart Studio — Professional Products';
    pageSubtitle = 'Salon inventory, retail products and in-service kits';
  } else if (pathname === '/admin/reviews') {
    pageTitle = 'Hair Mart Studio — Reviews & Feedback';
    pageSubtitle = 'Customer ratings, service feedback and stylist appraisals';
  } else if (pathname === '/admin/gallery') {
    pageTitle = 'Hair Mart Studio — Studio Gallery';
    pageSubtitle = 'Interior, haircut, and styling showcase photography';
  } else if (pathname === '/admin/reports') {
    pageTitle = 'Hair Mart Studio — Business Reports';
    pageSubtitle = 'Sales breakdown, payment methods, chair-wise revenue and CSV export';
  } else if (pathname === '/admin/settings') {
    pageTitle = 'Hair Mart Studio — Salon Settings';
    pageSubtitle = 'Salon profile, printer connection, WhatsApp and payment settings';
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '11px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Logo size="sm" showText={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', fontSize: '18px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.05 }}>
              <span>Hair</span>
              <span style={{ color: '#F6C926' }}>Mart</span>
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, cursive", fontStyle: 'italic', fontSize: '11.5px', color: '#F6C926', lineHeight: 1, marginTop: '1px' }}>
              Studio
            </div>
            <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.7)', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px' }}>
              UNISEX SALON &bull; ADMIN
            </div>
          </div>
        </div>

        {navSections.map((sec) => (
          <div key={sec.title}>
            <div className="admin-sidebar-section">{sec.title}</div>
            <nav className="admin-sidebar-nav">
              {sec.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link
            href="/"
            target="_blank"
            className="admin-sidebar-link"
            style={{ marginBottom: '4px' }}
          >
            <span>🌐</span>
            <span>View Public Website ↗</span>
          </Link>
          <button
            type="button"
            onClick={handleExitAdmin}
            className="admin-sidebar-link"
            style={{ width: '100%', color: 'var(--text-secondary)' }}
          >
            <span>🚪</span>
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="flex items-center gap-3">
            <button
              className="navbar-mobile-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div>
              <div className="admin-topbar-title">{pageTitle}</div>
              <div className="admin-topbar-subtitle">{pageSubtitle}</div>
            </div>
          </div>

          <div className="admin-topbar-actions">
            {/* Live Clock */}
            {currentTime && (
              <div className="admin-live-clock">
                <span>🕒</span>
                <span>{currentTime}</span>
              </div>
            )}


            {/* Admin User Profile with Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                className="admin-user-pill"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F6C926 0%, #D4AF37 100%)',
                    color: '#0A0D14',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '12px',
                  }}
                >
                  {adminUser?.name?.charAt(0) || 'A'}
                </div>
                <span>{adminUser?.name || 'Sameer'} ▾</span>
              </div>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '220px',
                    background: '#111520',
                    border: '1px solid rgba(246, 201, 38, 0.25)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
                    padding: '8px 0',
                    zIndex: 200,
                  }}
                >
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                      {adminUser?.name || 'Salon Admin'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--gold-400)', marginTop: '1px' }}>
                      ID: {adminUser?.email || 'admin'}
                    </div>
                  </div>

                  <Link
                    href="/admin/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 14px',
                      color: 'var(--text-secondary)',
                      fontSize: '12.5px',
                      textDecoration: 'none',
                    }}
                  >
                    <span>⚙️</span>
                    <span>Salon Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleExitAdmin();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '9px 14px',
                      color: 'var(--text-secondary)',
                      fontSize: '12.5px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span>🚪</span>
                    <span>Exit Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick POS action button if not on billing */}
            {pathname !== '/admin/billing' && (
              <Link href="/admin/billing" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                + New POS Bill
              </Link>
            )}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
