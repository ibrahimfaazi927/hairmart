'use client';

import { useState, useEffect } from 'react';

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'interior',
    image: '/images/salon-interior.jpg',
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setImages(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAddModal(false);
        setForm({ title: '', category: 'interior', image: '/images/salon-interior.jpg' });
        loadImages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery photo?')) return;
    try {
      await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      loadImages();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="heading-md">Salon Gallery Manager</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Upload and organize photos of your salon interior, styling stations, haircut results, and facial care.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Photo to Gallery
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
        {loading ? (
          <div className="text-center py-12" style={{ gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
            Loading gallery images...
          </div>
        ) : images.length > 0 ? (
          images.map((img) => (
            <div key={img.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <img
                  src={img.image}
                  alt={img.title || 'Salon photo'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: 'var(--space-4)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>
                    {img.category}
                  </span>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(img.id)}
                  >
                    Delete
                  </button>
                </div>
                <strong style={{ fontSize: 'var(--text-sm)', display: 'block' }}>{img.title || 'Salon Photo'}</strong>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">🖼️</div>
            <h3>No gallery photos added yet</h3>
            <p>Upload real salon photos to display in the customer-facing showcase.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-xs">Add Photo to Gallery</h3>
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddImage}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Photo Title / Caption *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Styling station with golden mirrors"
                    className="form-input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input form-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="interior">Interior & Ambiance</option>
                    <option value="hair">Hair Styling & Cuts</option>
                    <option value="grooming">Grooming & Beard</option>
                    <option value="facial">Facial & Skin Care</option>
                    <option value="products">Products</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL / Path *</label>
                  <input
                    type="text"
                    required
                    placeholder="/images/salon-interior.jpg or https://..."
                    className="form-input"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Gallery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
