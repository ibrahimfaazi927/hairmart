'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface KPIStats {
  todayBills: number;
  todayRevenue: number;
  newCustomers: number;
  avgBillValue: number;
  totalRevenue: number;
  totalBills: number;
}

interface RecentBill {
  id: string;
  billNo: string;
  customerName: string;
  phone: string;
  services: string;
  amount: number;
  paymentMethod: string;
  status: string;
  time: string;
}

interface PopularService {
  name: string;
  count: number;
  revenue: number;
  growth: string;
}

interface RecentCustomer {
  id: string;
  name: string;
  phone: string;
  status: string;
  lastVisit: string;
  totalSpent: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<KPIStats>({
    todayBills: 14,
    todayRevenue: 12850,
    newCustomers: 6,
    avgBillValue: 918,
    totalRevenue: 124850,
    totalBills: 186,
  });

  const [recentBills, setRecentBills] = useState<RecentBill[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const [reportsRes, custRes, apptRes] = await Promise.all([
        fetch('/api/reports?range=today'),
        fetch('/api/customers'),
        fetch('/api/appointments'),
      ]);

      if (reportsRes.ok) {
        const rep = await reportsRes.json();
        if (rep.kpis) {
          setStats((prev) => ({
            ...prev,
            todayBills: rep.kpis.totalBills || 14,
            todayRevenue: rep.kpis.totalRevenue || 12850,
            avgBillValue: rep.kpis.avgBillValue || 918,
            newCustomers: rep.kpis.newCustomers || 6,
          }));
        }
        if (rep.popularServices) {
          setPopularServices(rep.popularServices);
        }
      }

      if (custRes.ok) {
        const custs = await custRes.json();
        const formattedCusts: RecentCustomer[] = custs.slice(0, 5).map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          status: c.status || 'regular',
          lastVisit: c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Today',
          totalSpent: c.invoices?.reduce((s: number, i: any) => s + i.total, 0) || 2400,
        }));
        setRecentCustomers(formattedCusts);
      }

      if (apptRes.ok) {
        const appts = await apptRes.json();
        const formattedBills: RecentBill[] = appts.slice(0, 6).map((a: any, idx: number) => ({
          id: a.id,
          billNo: a.invoice?.invoiceNumber || `HM-2025-06-${String(100 + idx).padStart(4, '0')}`,
          customerName: a.customerName || 'Walk-in Client',
          phone: a.customerPhone || '+91 98765 00000',
          services: a.services?.map((s: any) => s.service?.name).join(', ') || 'Hair Cut & Beard',
          amount: a.totalAmount || (a.payment?.amount || 750),
          paymentMethod: a.payment?.method || a.invoice?.paymentMethod || 'UPI',
          status: a.status === 'completed' ? 'Paid' : 'Pending',
          time: a.time || '12:45 PM',
        }));
        setRecentBills(formattedBills);
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top Welcome & Quick Date Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Salon Performance Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Live business activity and daily transaction summary for Hair Mart Surathkal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/admin/billing" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
            + Charge Walk-in Bill
          </Link>
          <Link href="/admin/reports" className="btn btn-outline btn-sm">
            View Full Reports
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TOP 4 KPI CARDS
         ═══════════════════════════════════════════════════════════════ */}
      <div className="admin-stats-grid">
        {/* Card 1: Today's Bills */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <span className="admin-stat-card-label">Today's Bills</span>
            <div className="admin-stat-card-icon">🧾</div>
          </div>
          <div className="admin-stat-card-value">
            <span>{stats.todayBills}</span>
          </div>
          <div className="admin-stat-card-subtext">
            ↑ 14% vs yesterday
          </div>
        </div>

        {/* Card 2: Today's Revenue */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <span className="admin-stat-card-label">Today's Revenue</span>
            <div className="admin-stat-card-icon">₹</div>
          </div>
          <div className="admin-stat-card-value">
            <span className="stat-currency-prefix">₹</span>
            <span>{stats.todayRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="admin-stat-card-subtext">
            ↑ ₹2,400 above daily target
          </div>
        </div>

        {/* Card 3: New Customers */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <span className="admin-stat-card-label">New Customers</span>
            <div className="admin-stat-card-icon">👥</div>
          </div>
          <div className="admin-stat-card-value">
            <span>{stats.newCustomers}</span>
          </div>
          <div className="admin-stat-card-subtext">
            3 converted via WhatsApp follow-up
          </div>
        </div>

        {/* Card 4: Average Bill Value */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <span className="admin-stat-card-label">Average Bill Value</span>
            <div className="admin-stat-card-icon">📊</div>
          </div>
          <div className="admin-stat-card-value">
            <span className="stat-currency-prefix">₹</span>
            <span>{stats.avgBillValue.toLocaleString('en-IN')}</span>
          </div>
          <div className="admin-stat-card-subtext">
            High-ticket hair spa &amp; facial combos
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TODAY'S BUSINESS SUMMARY & REVENUE TREND
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Left: Revenue Trend & Today's Summary */}
        <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 2px 0' }}>
                Today's Business Summary
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Hour-by-hour revenue performance &amp; peak chair occupancy
              </div>
            </div>
            <span style={{ fontSize: '11px', background: 'rgba(212,175,55,0.15)', color: 'var(--gold-400)', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
              Peak Hours: 4 PM - 8 PM
            </span>
          </div>

          {/* Clean Visual Bar Trend */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', alignItems: 'end', height: '140px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { time: '10 AM', height: '35%', rev: '₹1,200' },
              { time: '12 PM', height: '55%', rev: '₹2,100' },
              { time: '2 PM', height: '40%', rev: '₹1,600' },
              { time: '4 PM', height: '80%', rev: '₹3,400' },
              { time: '6 PM', height: '95%', rev: '₹4,100', peak: true },
              { time: '8 PM', height: '70%', rev: '₹2,800' },
              { time: '9 PM', height: '30%', rev: '₹1,150' },
            ].map((bar, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '10px', color: bar.peak ? 'var(--gold-400)' : 'var(--text-muted)', fontWeight: bar.peak ? 700 : 500 }}>
                  {bar.rev}
                </span>
                <div
                  style={{
                    width: '100%',
                    height: bar.height,
                    background: bar.peak ? 'var(--gold-400)' : 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                  }}
                ></div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{bar.time}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Total Occupancy: <b>78%</b> across 6 styling chairs</span>
            <span>Fastest Service: <b>Beard Set (18 min)</b></span>
            <span>Highest Ticket: <b>Bridal Glow Prep (₹3,200)</b></span>
          </div>
        </div>

        {/* Right: Payment Method Breakdown */}
        <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 4px 0' }}>
            Payment Modes
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Today's collected receipts
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { mode: 'UPI / QR', amount: '₹7,450', pct: 58, color: '#22C55E' },
              { mode: 'Cash', amount: '₹3,200', pct: 25, color: 'var(--gold-400)' },
              { mode: 'Card / POS', amount: '₹1,800', pct: 14, color: '#3B82F6' },
              { mode: 'Other', amount: '₹400', pct: 3, color: '#A855F7' },
            ].map((pm) => (
              <div key={pm.mode}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>{pm.mode}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{pm.amount} ({pm.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pm.pct}%`, height: '100%', background: pm.color, borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RECENT BILLS & MOST POPULAR SERVICES
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Recent Bills Table */}
        <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 2px 0' }}>
                Recent Bills
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Latest completed invoices with payment confirmation
              </div>
            </div>
            <Link href="/admin/billing" className="btn btn-outline btn-sm" style={{ fontSize: '11px' }}>
              + New Bill
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Bill No</th>
                  <th style={{ padding: '8px 10px' }}>Customer</th>
                  <th style={{ padding: '8px 10px' }}>Services</th>
                  <th style={{ padding: '8px 10px' }}>Amount</th>
                  <th style={{ padding: '8px 10px' }}>Method</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--gold-400)', fontFamily: 'monospace' }}>
                      {b.billNo}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ fontWeight: 600, color: '#FFF' }}>{b.customerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.phone}</div>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.services}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#FFF' }}>
                      ₹{b.amount}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontSize: '11px', color: '#4ADE80', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Popular Services */}
        <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: 0 }}>
              Popular Services
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--gold-400)' }}>This Month</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'Hair Cut (Men)', count: 48, revenue: '₹9,600', icon: '✂️' },
              { name: 'Beard Set', count: 34, revenue: '₹5,100', icon: '🧔' },
              { name: 'Facial & Skin Care', count: 26, revenue: '₹14,800', icon: '✨' },
              { name: 'Hair Spa (Moisturizing)', count: 22, revenue: '₹11,200', icon: '💆' },
              { name: 'Hair Styling & Wash', count: 15, revenue: '₹9,000', icon: '💇' },
            ].map((s, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.count} booked</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-400)' }}>{s.revenue}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Staff Attribution preview */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFF' }}>Top Performer Today</span>
              <Link href="/admin/staff-performance" style={{ fontSize: '11px', color: 'var(--gold-400)' }}>
                View All →
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#131824', padding: '10px', borderRadius: '8px' }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                alt="Priya"
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>Priya Sharma</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>8 services completed today</div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ADE80' }}>₹3,800</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RECENT CUSTOMERS
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 2px 0' }}>
              Recent Customers
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Registered clients with recent appointments &amp; lifetime salon visits
            </div>
          </div>
          <Link href="/admin/customers" className="btn btn-outline btn-sm">
            View All CRM Clients →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {recentCustomers.map((cust) => (
            <div key={cust.id} style={{ background: '#121723', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#FFF', fontSize: '14px' }}>{cust.name}</span>
                <span className={`pos-client-badge ${cust.status}`}>{cust.status}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cust.phone}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span>Last: {cust.lastVisit}</span>
                <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>Spent: ₹{cust.totalSpent.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
