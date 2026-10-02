'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
];

const PHONE = '0824-4060938';
const WHATSAPP = '8660549348';
const WHATSAPP_LINK = `https://wa.me/91${WHATSAPP}?text=Hi%20Hair%20Mart%2C%20I%27d%20like%20to%20enquire%20about%20your%20services.`;

function PhoneIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ClockIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-links">
            <a href={`tel:${PHONE.replace(/-/g, '')}`} className="topbar-link">
              <PhoneIcon />
              <span>{PHONE}</span>
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="topbar-link">
              <WhatsAppIcon />
              <span>{WHATSAPP}</span>
            </a>
          </div>
          <div className="topbar-hours">
            <ClockIcon />
            <span>Mon–Sat: 9:30 AM – 9:00 PM | Sun: 10:00 AM – 8:30 PM</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <Logo size="sm" showText={true} />
          </Link>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar-cta">
            <a
              href={`tel:${PHONE.replace(/-/g, '')}`}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <PhoneIcon size={14} />
              Call {PHONE}
            </a>
          </div>

          <button
            className={`navbar-mobile-btn ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="mobile-menu-link"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', width: '80%', maxWidth: '280px' }}>
          <a
            href={`tel:${PHONE.replace(/-/g, '')}`}
            className="btn btn-primary btn-md w-full"
            onClick={() => setMobileOpen(false)}
          >
            <PhoneIcon size={16} />
            Call {PHONE}
          </a>
        </div>
      </div>
    </>
  );
}
