'use client';

import { useState, useEffect } from 'react';

interface ProductItem {
  id: string;
  name: string;
  brand: string;
  description?: string;
  image?: string;
  price?: number;
  stock?: number;
  category?: string;
  professional: boolean;
  active: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProd, setEditProd] = useState<ProductItem | null>(null);

  const [form, setForm] = useState({
    name: '',
    brand: 'O3+ Professional',
    description: '',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
    price: '1200',
    stock: '25',
    category: 'Facial Kits',
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const prods = await res.json();
        setProducts(prods || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editProd) {
        await fetch(`/api/products/${editProd.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            stock: Number(form.stock),
          }),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            stock: Number(form.stock),
          }),
        });
      }
      setShowModal(false);
      setEditProd(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (p: ProductItem) => {
    setEditProd(p);
    setForm({
      name: p.name,
      brand: p.brand,
      description: p.description || '',
      image: p.image || '',
      price: (p.price || 1200).toString(),
      stock: (p.stock || 20).toString(),
      category: p.category || 'Hair Care',
      active: p.active !== false,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditProd(null);
    setForm({
      name: '',
      brand: "L'Oréal Professionnel",
      description: '',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80',
      price: '850',
      stock: '15',
      category: 'Hair Care',
      active: true,
    });
    setShowModal(true);
  };

  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  const filtered = products.filter((p) => {
    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Professional Products &amp; Inventory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Manage in-service professional kits, salon retail products, inventory stock and brand pricing.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={openAdd}
          style={{ fontWeight: 700 }}
        >
          + Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#0F131D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#090B10', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0 12px', minWidth: '300px' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search product or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFF', padding: '10px 0', fontSize: '13px', outline: 'none' }}
          />
        </div>

        {/* Brand Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`pos-tab-btn ${selectedBrand === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedBrand('all')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              className={`pos-tab-btn ${selectedBrand === b ? 'active' : ''}`}
              onClick={() => setSelectedBrand(b)}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading professional products...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No products found.
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              style={{
                background: '#0E121B',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', width: '100%', height: '150px', background: '#141924' }}>
                <img
                  src={p.image || 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&auto=format&fit=crop&q=80'}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.75)',
                    color: 'var(--gold-400)',
                    fontWeight: 700,
                  }}
                >
                  {p.brand}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: (p.stock || 20) > 5 ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.85)',
                    color: '#FFF',
                  }}
                >
                  Stock: {p.stock || 20}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                      {p.name}
                    </h3>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gold-400)' }}>
                      ₹{p.price || 1200}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Category: <span style={{ color: 'var(--text-secondary)' }}>{p.category || 'Professional Kit'}</span>
                  </div>
                  {p.description && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                      {p.description}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => openEdit(p)}
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDelete(p.id)}
                    style={{ color: '#EF4444', padding: '0 10px' }}
                    title="Delete product"
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
          ADD / EDIT PRODUCT MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="thermal-modal-backdrop">
          <div style={{ background: '#0E121B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                {editProd ? 'Edit Product' : '+ Add Professional Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--text-muted)', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Glowing Gold Facial Kit"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nature's Essence"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Facial Kits"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Retail / Kit Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Product Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  style={{ width: '100%', background: '#121723', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '10px 12px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Description / Salon Usage
                </label>
                <textarea
                  rows={2}
                  placeholder="Usage instructions and product specifications..."
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
