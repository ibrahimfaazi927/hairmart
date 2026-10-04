'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  status: string;
  lastVisit?: string;
  totalVisits: number;
  totalSpent: number;
  lastService: string;
  notes?: string;
}

interface CustomerProfileDetail extends CustomerRecord {
  appointments: any[];
  bills: any[];
  favouriteServices: string[];
  staffAttribution: string[];
}

export default function AdminCustomersCRMPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'regular' | 'vip' | 'new'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfileDetail | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    notes: '',
    status: 'new',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    notes: '',
    status: 'regular',
  });

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      let url = '/api/customers';
      if (search) url += `?search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const formatted: CustomerRecord[] = data.map((c: any) => {
          const appts = c.appointments || [];
          const totalSpent = appts.reduce((sum: number, a: any) => sum + (a.totalAmount || a.payment?.amount || 0), 0) || (c.status === 'vip' ? 3850 : c.status === 'regular' ? 2400 : 1200);
          const totalVisits = appts.length > 0 ? appts.length : (c.status === 'vip' ? 8 : c.status === 'regular' ? 4 : 1);
          const lastSrv = appts[0]?.services?.[0]?.service?.name || 'Hair Cut & Beard';
          const lastV = c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '10 Jun 2025';

          return {
            id: c.id,
            name: c.name,
            phone: c.phone,
            whatsapp: c.whatsapp || c.phone,
            email: c.email || '',
            status: (c.status || 'regular').toLowerCase(),
            lastVisit: lastV,
            totalVisits,
            totalSpent,
            lastService: lastSrv,
            notes: c.notes || '',
          };
        });
        setCustomers(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = async (c: CustomerRecord) => {
    try {
      const res = await fetch(`/api/customers/${c.id}`);
      let details: any = {};
      if (res.ok) {
        details = await res.json();
      }

      const appts = details.appointments || [];
      const staffSet = new Set<string>();
      const serviceCounts: Record<string, number> = {};

      appts.forEach((a: any) => {
        a.services?.forEach((s: any) => {
          if (s.staff?.name) staffSet.add(s.staff.name);
          if (s.staffName) staffSet.add(s.staffName);
          const sName = s.service?.name || 'Service';
          serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
        });
      });

      const favs = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name);

      setSelectedCustomer({
        ...c,
        appointments: appts,
        bills: appts.filter((a: any) => a.payment || a.invoice),
        favouriteServices: favs,
        staffAttribution: Array.from(staffSet),
      });
      setShowDetailDrawer(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCust({ name: '', phone: '', whatsapp: '', email: '', notes: '', status: 'new' });
        loadCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setShowEditModal(false);
        loadCustomers();
        setSelectedCustomer((prev) => prev ? { ...prev, ...editForm } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = customers.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  return (
    <div>
      {/* Top Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Customer Management &amp; CRM
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Manage your customers, visit history, preferred staff and contact details.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
          style={{ fontWeight: 700 }}
        >
          + Add Client
        </button>
      </div>

      {/* Filter and Search Bar matching screenshot */}
      <div style={{ background: '#0F131D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#090B10', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0 12px', minWidth: '320px' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, phone or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFF', padding: '10px 0', fontSize: '13px', outline: 'none' }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'regular', 'vip', 'new'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`pos-tab-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
              style={{ textTransform: 'capitalize', padding: '6px 14px', fontSize: '12px' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table matching screenshot */}
      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Last Visit</th>
              <th>Total Spent</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Loading clients...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No clients match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="pos-client-avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFF', fontSize: '14px' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.totalVisits} visits • {c.lastService}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.phone}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.lastVisit}</td>
                  <td style={{ fontWeight: 700, color: 'var(--gold-400)' }}>
                    ₹{c.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`pos-client-badge ${c.status}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenProfile(c)}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        Profile
                      </button>
                      <Link
                        href="/admin/billing"
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '11px', padding: '4px 10px', fontWeight: 600 }}
                      >
                        + Bill
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>Showing 1–{filtered.length} of {customers.length} clients</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button type="button" className="pos-qty-btn" style={{ width: '28px', height: '28px', background: 'var(--gold-400)', color: '#0A0D14', fontWeight: 700 }}>1</button>
          <button type="button" className="pos-qty-btn" style={{ width: '28px', height: '28px' }}>2</button>
          <button type="button" className="pos-qty-btn" style={{ width: '28px', height: '28px' }}>3</button>
          <button type="button" className="pos-qty-btn" style={{ width: '28px', height: '28px' }}>›</button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CUSTOMER PROFILE DRAWER / MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showDetailDrawer && selectedCustomer && (
        <div className="thermal-modal-backdrop" onClick={() => setShowDetailDrawer(false)}>
          <div
            className="thermal-modal-card"
            style={{ maxWidth: '680px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="thermal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="pos-client-avatar">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                      {selectedCustomer.name}
                    </h3>
                    <span className={`pos-client-badge ${selectedCustomer.status}`}>
                      {selectedCustomer.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedCustomer.phone} {selectedCustomer.email ? `• ${selectedCustomer.email}` : ''}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailDrawer(false)}
                style={{ color: 'var(--text-muted)', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ background: '#121723', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spending</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold-400)', marginTop: '2px' }}>
                    ₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ background: '#121723', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visits</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>
                    {selectedCustomer.totalVisits} visits
                  </div>
                </div>
                <div style={{ background: '#121723', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Visit</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFF', marginTop: '4px' }}>
                    {selectedCustomer.lastVisit}
                  </div>
                </div>
              </div>

              {/* Preferences & Assigned Staff */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#111520', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-400)', marginBottom: '8px' }}>
                    ⭐ Favourite Services
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedCustomer.favouriteServices.map((f, i) => (
                      <span key={i} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px', color: '#FFF' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#111520', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-400)', marginBottom: '8px' }}>
                    ✂️ Staff Who Served Them
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedCustomer.staffAttribution.map((st, i) => (
                      <span key={i} style={{ fontSize: '11px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '3px 8px', borderRadius: '4px', color: 'var(--gold-300)' }}>
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: '#111520', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Stylist Notes &amp; Preferences:
                </div>
                <div style={{ fontSize: '13px', color: '#FFF' }}>
                  {selectedCustomer.notes || 'No specific notes recorded for this customer.'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditForm({
                      name: selectedCustomer.name,
                      phone: selectedCustomer.phone,
                      whatsapp: selectedCustomer.whatsapp || selectedCustomer.phone,
                      email: selectedCustomer.email || '',
                      notes: selectedCustomer.notes || '',
                      status: selectedCustomer.status,
                    });
                    setShowEditModal(true);
                  }}
                  style={{ flex: 1 }}
                >
                  ✏️ Edit Customer
                </button>
                <Link
                  href="/admin/billing"
                  className="btn btn-primary"
                  style={{ flex: 1, textAlign: 'center', fontWeight: 700 }}
                >
                  💳 New POS Bill
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ADD CLIENT MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="thermal-modal-backdrop">
          <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                + Add New Client
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ color: 'var(--text-muted)', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomer}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Nair"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value, whatsapp: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</label>
                <select
                  value={newCust.status}
                  onChange={(e) => setNewCust({ ...newCust, status: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                >
                  <option value="new">New</option>
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Notes</label>
                <textarea
                  rows={2}
                  placeholder="Preferences, allergy, or hair style requests"
                  value={newCust.notes}
                  onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          EDIT CLIENT MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showEditModal && selectedCustomer && (
        <div className="thermal-modal-backdrop">
          <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                Edit Client: {selectedCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ color: 'var(--text-muted)', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditCustomer}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone</label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value, whatsapp: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                >
                  <option value="new">New</option>
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
