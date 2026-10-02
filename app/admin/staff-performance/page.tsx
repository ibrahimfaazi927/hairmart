'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StaffPerformanceRow {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  servicesCompleted: number;
  billsHandled: number;
  revenueGenerated: number;
  averageBill: number;
  customersServed: number;
  serviceBreakdown: {
    serviceName: string;
    count: number;
    revenue: number;
  }[];
}

interface PerformanceKPIs {
  totalStaff: number;
  totalRevenue: number;
  totalServices: number;
  totalBills: number;
  avgBillValue: number;
}

export default function AdminStaffPerformancePage() {
  const [range, setRange] = useState<'today' | 'this_week' | 'this_month' | 'custom'>('this_month');
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'income'>('overview');
  const [kpis, setKpis] = useState<PerformanceKPIs>({
    totalStaff: 9,
    totalRevenue: 124850,
    totalServices: 186,
    totalBills: 145,
    avgBillValue: 669,
  });
  const [performanceData, setPerformanceData] = useState<StaffPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<StaffPerformanceRow | null>(null);

  useEffect(() => {
    loadPerformance();
  }, [range]);

  const loadPerformance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/performance?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        if (data.kpis) {
          setKpis(data.kpis);
        }
        if (data.staffPerformance) {
          setPerformanceData(data.staffPerformance);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...performanceData.map((s) => s.revenueGenerated), 1);
  const maxServices = Math.max(...performanceData.map((s) => s.servicesCompleted), 1);

  return (
    <div>
      {/* Top Header & Range Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Staff Performance &amp; Commission
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Track individual stylist performance, earnings, and accurate service line-item attribution.
          </p>
        </div>

        {/* Date Range Selector matching screenshot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0F131D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '4px' }}>
          {(['today', 'this_week', 'this_month', 'custom'] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`pos-tab-btn ${range === r ? 'active' : ''}`}
              onClick={() => setRange(r)}
              style={{ padding: '6px 14px', fontSize: '12px', textTransform: 'capitalize' }}
            >
              {r === 'today' ? 'Today' : r === 'this_week' ? 'This Week' : r === 'this_month' ? 'This Month' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Subnav Tabs: Overview | Services | Income */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'services', label: 'Services Attribution' },
          { id: 'income', label: 'Income & Revenue' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`pos-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
            style={{ borderRadius: '6px', fontSize: '13px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          KPI CARDS matching screenshot
         ═══════════════════════════════════════════════════════════════ */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <span className="admin-stat-card-label">Total Staff</span>
            <div className="admin-stat-card-icon">👥</div>
          </div>
          <div className="admin-stat-card-value">{kpis.totalStaff}</div>
          <div className="admin-stat-card-subtext" style={{ color: '#4ADE80' }}>
            All 6 active on floor
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <span className="admin-stat-card-label">Total Revenue</span>
            <div className="admin-stat-card-icon">₹</div>
          </div>
          <div className="admin-stat-card-value">₹{kpis.totalRevenue.toLocaleString('en-IN')}</div>
          <div className="admin-stat-card-subtext" style={{ color: '#4ADE80' }}>
            ↑ 12% vs last month
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <span className="admin-stat-card-label">Total Services</span>
            <div className="admin-stat-card-icon">✂️</div>
          </div>
          <div className="admin-stat-card-value">{kpis.totalServices}</div>
          <div className="admin-stat-card-subtext" style={{ color: '#4ADE80' }}>
            ↑ 8% vs last month
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card-header">
            <span className="admin-stat-card-label">Avg. Bill Value</span>
            <div className="admin-stat-card-icon">📊</div>
          </div>
          <div className="admin-stat-card-value">₹{kpis.avgBillValue}</div>
          <div className="admin-stat-card-subtext" style={{ color: '#4ADE80' }}>
            ↑ 15% ticket growth
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PERFORMANCE TABLE matching reference
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{ background: '#0F131D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 2px 0' }}>
              Staff Performance Breakdown
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Attribution based on exact services performed per bill
            </div>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--gold-400)', fontWeight: 600 }}>
            Ranked by Revenue Generated
          </span>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Services Done</th>
                <th>Bills Handled</th>
                <th>Revenue Generated</th>
                <th>Avg. Bill</th>
                <th>Customers</th>
                <th style={{ textAlign: 'right' }}>Service Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Calculating performance...
                  </td>
                </tr>
              ) : (
                performanceData.map((s, idx) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: idx === 0 ? 'var(--gold-400)' : 'var(--text-muted)', width: '16px' }}>
                          #{idx + 1}
                        </span>
                        <img
                          src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={s.name}
                          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-500)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFF', fontSize: '14px' }}>{s.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#FFF' }}>{s.servicesCompleted}</span> services
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.billsHandled} bills</td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: '14px' }}>
                        ₹{s.revenueGenerated.toLocaleString('en-IN')}
                      </div>
                      <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '4px' }}>
                        <div
                          style={{
                            width: `${Math.round((s.revenueGenerated / maxRevenue) * 100)}%`,
                            height: '100%',
                            background: 'var(--gold-400)',
                            borderRadius: '2px',
                          }}
                        ></div>
                      </div>
                    </td>
                    <td style={{ color: '#FFF' }}>₹{s.averageBill}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.customersServed} served</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedStaffDetail(s)}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        Attribution →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STAFF SERVICE ATTRIBUTION CARDS (Why this is superior)
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {performanceData.slice(0, 3).map((staff) => (
          <div key={staff.id} style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={staff.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: '#FFF', fontSize: '14px' }}>{staff.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gold-400)' }}>Total: ₹{staff.revenueGenerated.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{staff.servicesCompleted} services</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {staff.serviceBreakdown.map((sb, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{sb.serviceName} ({sb.count}x)</span>
                  <span style={{ fontWeight: 600, color: '#FFF' }}>₹{sb.revenue.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DETAILED SERVICE ATTRIBUTION MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {selectedStaffDetail && (
        <div className="thermal-modal-backdrop" onClick={() => setSelectedStaffDetail(null)}>
          <div
            className="thermal-modal-card"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="thermal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={selectedStaffDetail.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={selectedStaffDetail.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-500)' }}
                />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                    {selectedStaffDetail.name} — Service Attribution
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Calculation: Staff → Service → Quantity → Revenue
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStaffDetail(null)}
                style={{ color: 'var(--text-muted)', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ background: '#121723', padding: '16px', borderRadius: '8px', marginBottom: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total Revenue Contribution:</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gold-400)' }}>
                    ₹{selectedStaffDetail.revenueGenerated.toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Completed Services: <b>{selectedStaffDetail.servicesCompleted}</b></span>
                  <span>Unique Bills: <b>{selectedStaffDetail.billsHandled}</b></span>
                  <span>Avg. Bill: <b>₹{selectedStaffDetail.averageBill}</b></span>
                </div>
              </div>

              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Itemized Service Revenue Breakdown
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedStaffDetail.serviceBreakdown.map((sb, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#111520', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#FFF', fontSize: '13px' }}>{sb.serviceName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quantity: {sb.count} performed</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: '14px' }}>
                        ₹{sb.revenue.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {Math.round((sb.revenue / selectedStaffDetail.revenueGenerated) * 100)}% of earnings
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedStaffDetail(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
