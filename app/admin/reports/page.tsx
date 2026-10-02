'use client';

import { useState, useEffect } from 'react';

interface ReportData {
  range: string;
  kpis: {
    totalRevenue: number;
    totalBills: number;
    avgBillValue: number;
    newCustomers: number;
    repeatRate: string;
  };
  paymentMethods: Record<string, { count: number; total: number }>;
  popularServices: { name: string; count: number; revenue: number; percentage: number }[];
  staffRevenue: { staffName: string; services: number; revenue: number; percent: number }[];
  recentBills: {
    id: string;
    billNo: string;
    customerName: string;
    phone: string;
    services: string;
    amount: number;
    paymentMethod: string;
    status: string;
    date: string;
    time: string;
  }[];
}

export default function AdminBusinessReportsPage() {
  const [range, setRange] = useState<'today' | '7d' | 'this_month' | 'year' | 'all'>('this_month');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    loadReports();
  }, [range]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data || !data.recentBills) return;
    const headers = ['Bill No,Date,Time,Customer,Phone,Services,Amount,Payment Method,Status\n'];
    const rows = data.recentBills.map(
      (b) =>
        `"${b.billNo}","${b.date.split('T')[0]}","${b.time}","${b.customerName}","${b.phone}","${b.services.replace(/"/g, '""')}",${b.amount},"${b.paymentMethod}","${b.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows.join('\n'));
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HairMart_Report_${range}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div>
      {/* Top Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Business &amp; Sales Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Comprehensive salon sales audit, payment methods, staff earnings, and volume analytics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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
      <div style={{ background: '#0F131D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>Select Period:</span>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'today', label: 'Daily Sales' },
            { id: '7d', label: 'Weekly Sales' },
            { id: 'this_month', label: 'Monthly Sales' },
            { id: 'year', label: 'Year to Date' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`pos-tab-btn ${range === tab.id ? 'active' : ''}`}
              onClick={() => setRange(tab.id as any)}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <span className="admin-stat-card-label">Total Revenue</span>
              <div className="admin-stat-card-icon">₹</div>
            </div>
            <div className="admin-stat-card-value">₹{data.kpis.totalRevenue.toLocaleString('en-IN')}</div>
            <div className="admin-stat-card-subtext">Net verified receipts</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <span className="admin-stat-card-label">Total Bills</span>
              <div className="admin-stat-card-icon">🧾</div>
            </div>
            <div className="admin-stat-card-value">{data.kpis.totalBills}</div>
            <div className="admin-stat-card-subtext">100% processed without errors</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <span className="admin-stat-card-label">Average Bill</span>
              <div className="admin-stat-card-icon">📊</div>
            </div>
            <div className="admin-stat-card-value">₹{data.kpis.avgBillValue}</div>
            <div className="admin-stat-card-subtext">Average spend per client visit</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <span className="admin-stat-card-label">Repeat Rate</span>
              <div className="admin-stat-card-icon">🔁</div>
            </div>
            <div className="admin-stat-card-value">{data.kpis.repeatRate}</div>
            <div className="admin-stat-card-subtext">High loyalty retention</div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Payment Methods Breakdown + Staff Revenue */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Payment Method Distribution */}
          <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 4px 0' }}>
              Payment Method Breakdown
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Transactions split across payment instruments
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
                      <div style={{ width: `${pct}%`, height: '100%', background: method === 'upi' ? '#22C55E' : method === 'cash' ? 'var(--gold-400)' : '#3B82F6', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staff Revenue Contribution */}
          <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 4px 0' }}>
              Staff Revenue Contribution
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Revenue generated through direct line-item attribution
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.staffRevenue.map((sr) => (
                <div key={sr.staffName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#FFF' }}>{sr.staffName}</span>
                    <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>
                      ₹{sr.revenue.toLocaleString('en-IN')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({sr.services} srv • {sr.percent}%)</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${sr.percent}%`, height: '100%', background: 'var(--gold-400)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popular Services Table */}
      {data && (
        <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 4px 0' }}>
            Popular Services &amp; Category Sales
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Volume and revenue generated per salon offering
          </div>

          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Quantity Booked</th>
                  <th>Revenue Generated</th>
                  <th>Share of Volume</th>
                </tr>
              </thead>
              <tbody>
                {data.popularServices.map((ps, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#FFF' }}>{ps.name}</td>
                    <td>{ps.count} bookings</td>
                    <td style={{ fontWeight: 700, color: 'var(--gold-400)' }}>
                      ₹{ps.revenue.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${ps.percentage * 3}%`, height: '100%', background: 'var(--gold-400)' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ps.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Log / Recent Bills in Period */}
      {data && (
        <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 4px 0' }}>
            Detailed Transaction Audit
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Full breakdown of completed bills and client receipts
          </div>

          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date &amp; Time</th>
                  <th>Customer</th>
                  <th>Services</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBills.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: 'var(--gold-400)', fontFamily: 'monospace' }}>
                      {b.billNo}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {b.date.split('T')[0]} {b.time}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFF' }}>{b.customerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.phone}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.services}</td>
                    <td style={{ fontWeight: 700, color: '#FFF' }}>₹{b.amount}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
