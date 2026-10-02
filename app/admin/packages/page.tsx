'use client';

import { useState, useEffect } from 'react';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPkg, setEditPkg] = useState<any | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '0',
    priceVisible: false,
    serviceIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pkgRes, srvRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/services'),
      ]);
      if (pkgRes.ok) {
        const pkgs = await pkgRes.json();
        setPackages(pkgs || []);
      }
      if (srvRes.ok) {
        const srvs = await srvRes.json();
        setAllServices(srvs.services || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceInPackage = (serviceId: string) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editPkg) {
        await fetch(`/api/packages/${editPkg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setShowAddModal(false);
      setEditPkg(null);
      setForm({ name: '', description: '', price: '0', priceVisible: false, serviceIds: [] });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      await fetch(`/api/packages/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (pkg: any) => {
    setEditPkg(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price?.toString() || '0',
      priceVisible: !!pkg.priceVisible,
      serviceIds: pkg.services?.map((s: any) => s.serviceId) || [],
    });
    setShowAddModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="heading-md">Package Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Bundle services into grooming packages (e.g. Groom Package, Premium Package) and manage inclusions.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditPkg(null);
            setForm({ name: '', description: '', price: '0', priceVisible: false, serviceIds: [] });
            setShowAddModal(true);
          }}
        >
          + Create New Package
        </button>
      </div>

      {/* Packages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
        {loading ? (
          <div className="text-center py-12" style={{ gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
            Loading packages...
          </div>
        ) : packages.length > 0 ? (
          packages.map((pkg) => (
            <div key={pkg.id} className="card-premium">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-gold">Package</span>
                <strong style={{ color: 'var(--gold-400)' }}>₹{pkg.price} (Internal)</strong>
              </div>
              <h2 className="heading-sm mb-2">{pkg.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', minHeight: '40px' }}>
                {pkg.description}
              </p>

              <div className="mb-4">
                <span className="label-text" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  Included Services ({pkg.services?.length || 0})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
                  {pkg.services?.map((s: any) => (
                    <div key={s.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      ✓ {s.service?.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  className="btn btn-sm btn-secondary flex-1"
                  onClick={() => openEdit(pkg)}
                >
                  Edit Package
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(pkg.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">💎</div>
            <h3>No packages created yet</h3>
            <p>Click &quot;Create New Package&quot; to bundle services together.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Package Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-xs">{editPkg ? 'Edit Package' : 'Create Package'}</h3>
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePackage}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Package Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Groom Special Package"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Price (₹ for Billing)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    className="form-input form-textarea"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label mb-2">Select Included Services ({form.serviceIds.length} selected)</label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                    {allServices.map((s) => {
                      const isChecked = form.serviceIds.includes(s.id);
                      return (
                        <label key={s.id} className="form-checkbox py-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleServiceInPackage(s.id)}
                          />
                          <span style={{ fontSize: 'var(--text-sm)' }}>
                            {s.name} <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({s.category?.gender})</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editPkg ? 'Update Package' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
