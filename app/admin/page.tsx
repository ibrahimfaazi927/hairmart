'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface KPIStats {
  todayBills: number;
  todayRevenue: number;
  monthlyRevenue: number;
  avgBillValue: number;
  totalRevenue: number;
  totalBills: number;
}

interface ChairStatItem {
  id: string;
  name: string;
  section: string;
  staffName: string | null;
  revenue: number;
  billsCount: number;
}

interface ChairWiseRevenue {
  men: ChairStatItem[];
  women: ChairStatItem[];
  unassigned: {
    name: string;
    revenue: number;
    billsCount: number;
  };
}

interface AttendanceSummary {
  totalStaff: number;
  presentToday: number;
  absentToday: number;
  leaveToday: number;
}

interface RecentBill {
  id: string;
  billNo: string;
  customerName: string;
  phone: string;
  services: string;
  chairName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  time: string;
}

interface PopularService {
  name: string;
  count: number;
  revenue: number;
  icon?: string;
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
    todayBills: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    avgBillValue: 0,
    totalRevenue: 0,
    totalBills: 0,
  });

  const [chairRevenue, setChairRevenue] = useState<ChairWiseRevenue>({
    men: [],
    women: [],
    unassigned: { name: 'Not Assigned', revenue: 0, billsCount: 0 },
  });

  const [attendance, setAttendance] = useState<AttendanceSummary>({
    totalStaff: 0,
    presentToday: 0,
    absentToday: 0,
    leaveToday: 0,
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
      const [statsRes, custRes, apptRes, reportsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/customers'),
        fetch('/api/appointments'),
        fetch('/api/reports?range=today'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.kpis) {
          setStats(data.kpis);
        }
        if (data.chairWiseRevenue) {
          setChairRevenue(data.chairWiseRevenue);
        }
        if (data.attendanceSummary) {
          setAttendance(data.attendanceSummary);
        }
      }

      if (reportsRes.ok) {
        const rep = await reportsRes.json();
        if (rep.popularServices) {
          setPopularServices(rep.popularServices);
        }
      }

      if (custRes.ok) {
        const custs = await custRes.json();
        const formattedCusts: RecentCustomer[] = custs.slice(0, 4).map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          status: c.status || 'regular',
          lastVisit: c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today',
          totalSpent: c.invoices?.reduce((s: number, i: any) => s + i.total, 0) || 0,
        }));
        setRecentCustomers(formattedCusts);
      }

      if (apptRes.ok) {
        const appts = await apptRes.json();
        const formattedBills: RecentBill[] = appts.slice(0, 6).map((a: any, idx: number) => ({
          id: a.id,
          billNo: a.invoice?.invoiceNumber || `HM-BILL-${String(100 + idx).padStart(4, '0')}`,
          customerName: a.customerName || 'Walk-in Client',
          phone: a.customerPhone || '—',
          services: a.services?.map((s: any) => s.service?.name).join(', ') || 'Salon Services',
          chairName: a.chairName || (a.chair ? a.chair.name : 'Not Assigned'),
          amount: a.totalAmount || (a.payment?.amount || 0),
          paymentMethod: a.payment?.method || a.invoice?.paymentMethod || 'UPI',
          status: a.status === 'completed' ? 'Paid' : 'Pending',
          time: a.time || '12:00 PM',
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Welcome Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Salon Performance Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Live business activity, chair revenue distribution, and workforce operations summary.
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
          <div className="admin-stat-card-subtext">Total bills billed today</div>
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
          <div className="admin-stat-card-subtext">Collections from all chairs</div>
        </div>

        {/* Card 3: Monthly Revenue */}
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <span className="admin-stat-card-label">This Month Revenue</span>
            <div className="admin-stat-card-icon">📈</div>
          </div>
          <div className="admin-stat-card-value">
            <span className="stat-currency-prefix">₹</span>
            <span>{stats.monthlyRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="admin-stat-card-subtext">Gross revenue for current month</div>
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
          <div className="admin-stat-card-subtext">Per completed transaction</div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CHAIR-WISE REVENUE PERFORMANCE (Strictly Chair-Wise)
         ═══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: '#0E121B',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gold-400)', margin: '0 0 2px 0' }}>
              🪑 Chair-Wise Revenue Performance
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Direct revenue tracking by styling chair (Men: 4 Chairs • Women: 2 Chairs)
            </div>
          </div>
          <Link href="/admin/chairs" className="btn btn-outline btn-sm" style={{ fontSize: '11px' }}>
            Manage Chairs →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Men's Section Chairs */}
          <div style={{ background: '#121723', padding: '16px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>🧔</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase' }}>
                Men's Section (Chairs 1–4)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chairRevenue.men.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No men chairs configured.</div>
              ) : (
                chairRevenue.men.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: '#0B0E15',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFF', fontSize: '13px' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {c.staffName ? `Assigned: ${c.staffName}` : 'Unassigned'} • {c.billsCount} bills
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--gold-400)', fontSize: '15px' }}>
                        ₹{c.revenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Women's Section Chairs */}
          <div style={{ background: '#121723', padding: '16px', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>👩</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F472B6', textTransform: 'uppercase' }}>
                Women's Section (Chairs 1–2)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chairRevenue.women.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No women chairs configured.</div>
              ) : (
                chairRevenue.women.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: '#0B0E15',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFF', fontSize: '13px' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {c.staffName ? `Assigned: ${c.staffName}` : 'Unassigned'} • {c.billsCount} bills
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#F472B6', fontSize: '15px' }}>
                        ₹{c.revenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Historical / Unassigned Bills */}
          {chairRevenue.unassigned && chairRevenue.unassigned.billsCount > 0 && (
            <div style={{ background: '#121723', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px' }}>📁</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Historical Bills (Preserved)
                </span>
              </div>
              <div
                style={{
                  background: '#0B0E15',
                  padding: '14px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Chair: Not Assigned
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {chairRevenue.unassigned.billsCount} historical bills prior to chair assignment
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '15px' }}>
                    ₹{chairRevenue.unassigned.revenue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          OPERATIONS: ATTENDANCE & LEAVE SUMMARIES
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Attendance Summary */}
        <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: 0 }}>
              📅 Daily Workforce Attendance
            </h3>
            <Link href="/admin/staff" style={{ fontSize: '12px', color: 'var(--gold-400)' }}>
              Open Roster →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: '#121723', padding: '12px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#4ADE80', fontWeight: 600 }}>PRESENT TODAY</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#4ADE80', marginTop: '2px' }}>
                {attendance.presentToday}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Active in salon</div>
            </div>

            <div style={{ background: '#121723', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#F87171', fontWeight: 600 }}>ABSENT</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#F87171', marginTop: '2px' }}>
                {attendance.absentToday}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Unscheduled</div>
            </div>

            <div style={{ background: '#121723', padding: '12px', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#C084FC', fontWeight: 600 }}>ON LEAVE</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#C084FC', marginTop: '2px' }}>
                {attendance.leaveToday}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Approved leaves</div>
            </div>
          </div>
        </div>

        {/* Workstations Quick Summary */}
        <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: 0 }}>
              🪑 Workstations &amp; Terminals
            </h3>
            <Link href="/admin/chairs" style={{ fontSize: '12px', color: 'var(--gold-400)' }}>
              Manage Chairs →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: '#121723', padding: '12px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 600 }}>MEN'S CHAIRS</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#60A5FA', marginTop: '2px' }}>
                4 Chairs
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Workstations 1–4</div>
            </div>

            <div style={{ background: '#121723', padding: '12px', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#F472B6', fontWeight: 600 }}>WOMEN'S CHAIRS</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#F472B6', marginTop: '2px' }}>
                2 Chairs
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Workstations 1–2</div>
            </div>

            <div style={{ background: '#121723', padding: '12px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#4ADE80', fontWeight: 600 }}>STAFF TERMINAL</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ADE80', marginTop: '2px' }}>
                Active
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Walk In / Out</div>
            </div>
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
                Recent Invoices
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Latest billed walk-in transactions with chair assignments
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
                  <th style={{ padding: '8px 10px' }}>Chair</th>
                  <th style={{ padding: '8px 10px' }}>Services</th>
                  <th style={{ padding: '8px 10px' }}>Amount</th>
                  <th style={{ padding: '8px 10px' }}>Method</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.length > 0 ? (
                  recentBills.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--gold-400)', fontFamily: 'monospace' }}>
                        {b.billNo}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 600, color: '#FFF' }}>{b.customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.phone}</div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: b.chairName === 'Not Assigned' ? 'rgba(255,255,255,0.06)' : 'rgba(212,175,55,0.15)',
                            color: b.chairName === 'Not Assigned' ? 'var(--text-muted)' : 'var(--gold-400)',
                          }}
                        >
                          🪑 {b.chairName}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No recent invoices recorded yet. Start billing walk-ins from POS.
                    </td>
                  </tr>
                )}
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
            <span style={{ fontSize: '11px', color: 'var(--gold-400)' }}>Top Billed</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {popularServices.length > 0 ? (
              popularServices.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{s.icon || '✂️'}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.count} billed</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-400)' }}>
                      ₹{s.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '30px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>✂️</span>
                No billed services yet.<br />
                <span style={{ fontSize: '11px', opacity: 0.7 }}>Services billed in POS will appear here.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RECENT CLIENTS
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 2px 0' }}>
              Recent Customers
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Registered clients with recent salon appointments &amp; visits
            </div>
          </div>
          <Link href="/admin/customers" className="btn btn-outline btn-sm">
            View All CRM Clients →
          </Link>
        </div>

        {recentCustomers.length > 0 ? (
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
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', background: '#121723', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)' }}>
            No registered clients yet. Add or bill clients in the POS or CRM.
          </div>
        )}
      </div>
    </div>
  );
}
