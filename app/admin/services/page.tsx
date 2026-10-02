'use client';

import { useState, useEffect, useRef } from 'react';

interface ServiceData {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  price: number;
  image?: string;
  active: boolean;
  categoryId: string;
  category?: { id: string; name: string };
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<ServiceData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    duration: '30',
    price: '200',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
    categoryId: '',
    active: true,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'services');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (res.ok && json.url) {
        setForm((prev) => ({ ...prev, image: json.url }));
      } else {
        alert(json.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !form.categoryId) {
          setForm((prev) => ({ ...prev, categoryId: data.categories[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editService) {
        await fetch(`/api/services/${editService.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            duration: Number(form.duration),
          }),
        });
      } else {
        await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            duration: Number(form.duration),
          }),
        });
      }
      setShowModal(false);
      setEditService(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (s: ServiceData) => {
    try {
      await fetch(`/api/services/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !s.active }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service from catalogue?')) return;
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (s: ServiceData) => {
    setEditService(s);
    setForm({
      name: s.name,
      description: s.description || '',
      duration: s.duration?.toString() || '30',
      price: s.price?.toString() || '0',
      image: s.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
      categoryId: s.categoryId || (categories[0]?.id || ''),
      active: s.active,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditService(null);
    setForm({
      name: '',
      description: '',
      duration: '30',
      price: '200',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
      categoryId: categories[0]?.id || '',
      active: true,
    });
    setShowModal(true);
  };

  const filtered = services.filter((s) => {
    const matchesCat = selectedCat === 'all' || s.categoryId === selectedCat;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Services Catalogue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Manage in-house salon services, internal billing prices, durations, and POS card photos.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={openAdd}
          style={{ fontWeight: 700 }}
        >
          + Add Service
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#0F131D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#090B10', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0 12px', minWidth: '300px' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search catalogue service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFF', padding: '10px 0', fontSize: '13px', outline: 'none' }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`pos-tab-btn ${selectedCat === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCat('all')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`pos-tab-btn ${selectedCat === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCat(c.id)}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid with Photos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading catalogue services...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No services found.
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              style={{
                background: '#0E121B',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Photo */}
              <div style={{ position: 'relative', width: '100%', height: '140px', background: '#161B26' }}>
                <img
                  src={s.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80'}
                  alt={s.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: s.active ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.85)',
                    color: '#FFF',
                  }}
                >
                  {s.active ? 'ACTIVE' : 'DISABLED'}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'var(--gold-400)',
                    fontWeight: 600,
                  }}
                >
                  {s.category?.name || 'General'}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                      {s.name}
                    </h3>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gold-400)' }}>
                      ₹{s.price}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    ⏱️ {s.duration || 30} mins {s.description ? `• ${s.description}` : ''}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => openEdit(s)}
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleToggleActive(s)}
                    style={{ flex: 1, fontSize: '12px', color: s.active ? '#F87171' : '#4ADE80' }}
                  >
                    {s.active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDelete(s.id)}
                    style={{ color: '#EF4444', padding: '0 8px' }}
                    title="Delete service"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ADD / EDIT SERVICE MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="thermal-modal-backdrop">
          <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                {editService ? 'Edit Catalogue Service' : '+ Add New Service'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--text-muted)', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveService}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precision Fade Hair Cut"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Billing Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Image / POS Card Upload */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Service Photo (Upload from Image)
                </label>

                {/* Hidden native file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                {/* Image Preview & Upload Controls */}
                <div
                  style={{
                    background: '#121723',
                    border: '1px dashed rgba(246, 201, 38, 0.35)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* Thumbnail Preview */}
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#1A2130',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.1)',
                      position: 'relative',
                    }}
                  >
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Service preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        📷
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="btn btn-primary btn-sm"
                        style={{
                          fontSize: '11.5px',
                          padding: '6px 12px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{uploading ? '⏳ Uploading...' : '📁 Upload from Device'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                      >
                        {showUrlInput ? 'Hide URL' : '🔗 Image URL'}
                      </button>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Supports JPG, PNG, WebP up to 10MB. Automatically formatted for POS cards.
                    </div>
                  </div>
                </div>

                {/* Optional URL input toggle */}
                {showUrlInput && (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      style={{
                        width: '100%',
                        background: '#0D111A',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '6px',
                        color: '#FFF',
                        padding: '8px 10px',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Service details and instructions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
