'use client';

import { useState, useEffect } from 'react';
import { printBillToEzoPrinter } from '@/lib/thermalPrinter';

interface ChairRevenueItem {
  id: string;
  name: string;
  section: string;
  assignedStaffName: string | null;
  revenue: number;
  billsCount: number;
}

interface ReportData {
  range: string;
  startDate: string;
  endDate: string;
  kpis: {
    totalRevenue: number;
    totalBills: number;
    todayRevenue: number;
    monthlyRevenue: number;
    allTimeRevenue: number;
    allTimeBills: number;
    avgBillValue: number;
  };
  chairRevenue: {
    men: ChairRevenueItem[];
    women: ChairRevenueItem[];
    unassigned: {
      name: string;
      revenue: number;
      billsCount: number;
    };
  };
  paymentMethods: Record<string, { count: number; total: number }>;
  attendanceSummary: {
    totalActiveStaff: number;
    presentToday: number;
    absentToday: number;
    leaveToday: number;
  };
  leaveCountInRange: number;
  recentBills: Array<{
    id: string;
    billNo: string;
    customerName: string;
    phone: string;
    chair: string;
    section: string;
    services: string;
    amount: number;
    paymentMethod: string;
    status: string;
    date: string;
    time: string;
  }>;
}

export default function AdminBusinessReportsPage() {
  const [range, setRange] = useState<'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom'>('this_month');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    loadReports();
  }, [range]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let url = `/api/reports?range=${range}`;
      if (range === 'custom') {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCustomDates = () => {
    loadReports();
  };

  // Export CSV with Chair attribution
  const handleExportCSV = () => {
    if (!data || !data.recentBills) return;
    const headers = ['Bill No,Date,Time,Customer,Phone,Chair,Section,Services,Amount,Payment Method,Status\n'];
    const rows = data.recentBills.map(
      (b) =>
        `"${b.billNo}","${b.date.split('T')[0]}","${b.time}","${b.customerName}","${b.phone}","${b.chair}","${b.section}","${b.services.replace(/"/g, '""')}",${b.amount},"${b.paymentMethod}","${b.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows.join('\n'));
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HairMart_Chair_Report_${range}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleReprintBill = async (b: any) => {
    try {
      const items = b.services
        ? b.services.split(',').map((s: string) => ({
            name: s.trim(),
            quantity: 1,
            price: b.amount,
          }))
        : [{ name: 'Salon Service', quantity: 1, price: b.amount }];

      await printBillToEzoPrinter({
        billNo: b.billNo,
        date: new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: b.time,
        customerName: b.customerName,
        customerPhone: b.phone === 'Not Provided' ? undefined : b.phone,
        items,
        subtotal: b.amount,
        discount: 0,
        total: b.amount,
        paymentMethod: (b.paymentMethod || 'cash').toUpperCase(),
      });
      alert(`Bill #${b.billNo} sent to 58mm printer!`);
    } catch (e: any) {
      alert('Reprint failed: ' + e.message);
    }
  };

  const handleSendEodToOwner = async () => {
    try {
      const res = await fetch('/api/reports/end-of-day');
      if (res.ok) {
        const json = await res.json();
        if (json.whatsappUrl) {
          window.open(json.whatsappUrl, '_blank');
          return;
        }
      }
      alert('Could not compile End of Day report.');
    } catch (e: any) {
      alert('Failed to send EOD report: ' + e.message);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Header & Export Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Business &amp; Chair Revenue Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Comprehensive chair revenue audit, transaction settlement logs, workforce attendance, and payroll expenses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleSendEodToOwner}
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.22), rgba(34, 197, 94, 0.08))',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              color: '#4ADE80',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
            }}
            title="Dispatch today's complete bills register & audit report to owner's WhatsApp (9035959286)"
          >
            <span>📲</span>
            <span>Send EOD to Owner (9035959286)</span>
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handlePrintReport}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🖨️</span>
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div
        style={{
          background: '#0F131D',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-400)', marginRight: '6px' }}>
            Period:
          </span>

          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'custom', label: 'Custom Range' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`pos-tab-btn ${range === tab.id ? 'active' : ''}`}
              onClick={() => setRange(tab.id as any)}
              style={{ padding: '7px 16px', fontSize: '12px', minHeight: '38px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Range Inputs */}
        {range === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              style={{
                background: '#121723',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#FFF',
                padding: '6px 10px',
                fontSize: '12px',
              }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              style={{
                background: '#121723',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#FFF',
                padding: '6px 10px',
                fontSize: '12px',
              }}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleApplyCustomDates}
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading reports and chair revenue calculations...
        </div>
      ) : data ? (
        <>
          {/* ═══════════════════════════════════════════════════════════════
              TOP 4 KPI CARDS FOR SELECTED PERIOD
             ═══════════════════════════════════════════════════════════════ */}
          <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <span className="admin-stat-card-label">Period Revenue</span>
                <div className="admin-stat-card-icon">₹</div>
              </div>
              <div className="admin-stat-card-value">
                <span className="stat-currency-prefix">₹</span>
                <span>{data.kpis.totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="admin-stat-card-subtext">Total verified collections in period</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <span className="admin-stat-card-label">Total Bills</span>
                <div className="admin-stat-card-icon">🧾</div>
              </div>
              <div className="admin-stat-card-value">
                <span>{data.kpis.totalBills}</span>
              </div>
              <div className="admin-stat-card-subtext">Completed walk-in transactions</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <span className="admin-stat-card-label">Average Ticket Size</span>
                <div className="admin-stat-card-icon">📊</div>
              </div>
              <div className="admin-stat-card-value">
                <span className="stat-currency-prefix">₹</span>
                <span>{data.kpis.avgBillValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="admin-stat-card-subtext">Average spend per customer</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card-header">
                <span className="admin-stat-card-label">All-Time Revenue</span>
                <div className="admin-stat-card-icon">📈</div>
              </div>
              <div className="admin-stat-card-value">
                <span className="stat-currency-prefix">₹</span>
                <span>{data.kpis.allTimeRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="admin-stat-card-subtext">Across {data.kpis.allTimeBills} lifetime bills</div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              CHAIR-WISE REVENUE BREAKDOWN (Strictly Chair-Wise)
             ═══════════════════════════════════════════════════════════════ */}
          <div
            style={{
              background: '#0E121B',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: '12px',
              padding: '22px',
              marginBottom: '24px',
              boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--gold-400)', margin: '0 0 4px 0' }}>
                🪑 Chair-Wise Revenue Breakdown
              </h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Exact revenue earned by each salon styling chair in the selected period (Men: 4 Chairs • Women: 2 Chairs)
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Men's Section Chairs */}
              <div style={{ background: '#121723', padding: '18px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '18px' }}>🧔</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase' }}>
                    Men's Section Chairs (1–4)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.chairRevenue.men.map((c) => {
                    const totalRev = data.kpis.totalRevenue || 1;
                    const pct = Math.round((c.revenue / totalRev) * 100);

                    return (
                      <div key={c.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#FFF', fontSize: '14px' }}>{c.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                              ({c.assignedStaffName ? c.assignedStaffName : 'Unassigned'} • {c.billsCount} bills)
                            </span>
                          </div>
                          <span style={{ color: 'var(--gold-400)', fontWeight: 800, fontSize: '14px' }}>
                            ₹{c.revenue.toLocaleString('en-IN')} <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400 }}>({pct}%)</span>
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#60A5FA', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Women's Section Chairs */}
              <div style={{ background: '#121723', padding: '18px', borderRadius: '10px', border: '1px solid rgba(236,72,153,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '18px' }}>👩</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#F472B6', textTransform: 'uppercase' }}>
                    Women's Section Chairs (1–2)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.chairRevenue.women.map((c) => {
                    const totalRev = data.kpis.totalRevenue || 1;
                    const pct = Math.round((c.revenue / totalRev) * 100);

                    return (
                      <div key={c.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#FFF', fontSize: '14px' }}>{c.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                              ({c.assignedStaffName ? c.assignedStaffName : 'Unassigned'} • {c.billsCount} bills)
                            </span>
                          </div>
                          <span style={{ color: '#F472B6', fontWeight: 800, fontSize: '14px' }}>
                            ₹{c.revenue.toLocaleString('en-IN')} <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400 }}>({pct}%)</span>
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#EC4899', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Historical / Unassigned Bills */}
              {data.chairRevenue.unassigned && data.chairRevenue.unassigned.billsCount > 0 && (
                <div style={{ background: '#121723', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '18px' }}>📁</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Historical Bills (Preserved)
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '14px' }}>
                          Chair: Not Assigned
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {data.chairRevenue.unassigned.billsCount} bills prior to chair management
                        </div>
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 800, fontSize: '14px' }}>
                        ₹{data.chairRevenue.unassigned.revenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              PAYMENT METHODS & WORKFORCE OPERATIONS
             ═══════════════════════════════════════════════════════════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Payment Method Distribution */}
            <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 4px 0' }}>
                Payment Method Breakdown
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Transactions split across tender types
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(data.paymentMethods).map(([method, info]) => {
                  const total = data.kpis.totalRevenue || 1;
                  const pct = Math.round((info.total / total) * 100);
                  return (
                    <div key={method}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#FFF', textTransform: 'uppercase' }}>{method}</span>
                        <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>
                          ₹{info.total.toLocaleString('en-IN')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({info.count} bills • {pct}%)</span>
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: method === 'upi' ? '#22C55E' : method === 'cash' ? 'var(--gold-400)' : '#3B82F6',
                            borderRadius: '4px',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workforce & Operations Summary */}
            <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 4px 0' }}>
                Workforce &amp; Operations Summary
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Attendance &amp; operational status during this period
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#121723', padding: '12px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active Workforce Roster</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gold-400)' }}>
                      {data.attendanceSummary.totalActiveStaff} Stylists &amp; Staff
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#4ADE80' }}>
                    {data.attendanceSummary.presentToday} Present Today
                  </span>
                </div>

                <div style={{ background: '#121723', padding: '12px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Approved Leaves in Period</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#C084FC' }}>
                      {data.leaveCountInRange} staff leave records
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Casual &amp; sick leaves</span>
                </div>

                <div style={{ background: '#121723', padding: '12px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Absent / On Leave Today</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#F87171' }}>
                      {data.attendanceSummary.absentToday + data.attendanceSummary.leaveToday} Staff
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {data.attendanceSummary.leaveToday} on approved leave
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              DETAILED TRANSACTION AUDIT TABLE (With Chair Column)
             ═══════════════════════════════════════════════════════════════ */}
          <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: '0 0 4px 0' }}>
                  Detailed Transaction Audit Log
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Complete list of walk-in invoices and assigned styling chairs in this period
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Showing {data.recentBills.length} invoices
              </span>
            </div>

            <div className="crm-table-wrapper admin-table-container">
              <table className="crm-table admin-table">
                <thead>
                  <tr>
                    <th>Bill No</th>
                    <th>Date &amp; Time</th>
                    <th>Customer</th>
                    <th>Chair</th>
                    <th>Section</th>
                    <th>Services</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBills.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No transactions found for this date range.
                      </td>
                    </tr>
                  ) : (
                    data.recentBills.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600, color: 'var(--gold-400)', fontFamily: 'monospace' }}>
                          {b.billNo}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {b.time}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#FFF' }}>{b.customerName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.phone}</div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: b.chair === 'Not Assigned' ? 'rgba(255,255,255,0.06)' : 'rgba(212,175,55,0.15)',
                              color: b.chair === 'Not Assigned' ? 'var(--text-muted)' : 'var(--gold-400)',
                            }}
                          >
                            🪑 {b.chair}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {b.section || '—'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.services}
                        </td>
                        <td style={{ fontWeight: 700, color: '#FFF', fontSize: '14px' }}>
                          ₹{b.amount}
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {b.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: '#4ADE80', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleReprintBill(b)}
                            style={{
                              background: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              color: 'var(--gold-400)',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                            title="Reprint 58mm thermal receipt"
                          >
                            🖨️ Reprint
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
