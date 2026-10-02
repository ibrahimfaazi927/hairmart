'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface StaffItem {
  id: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  status: string;
  joiningDate?: string;
  specialties?: string;
  totalServices: number;
  totalRevenue: number;
  uniqueAppointments: number;
}

export default function AdminStaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [addForm, setAddForm] = useState({
    name: '',
    role: 'Hair Stylist',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialties: 'Hair Cut, Beard Set, Styling',
    status: 'active',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    phone: '',
    avatar: '',
    specialties: '',
    status: 'active',
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Convert and compress selected image file from the system
  const handlePhotoUpload = (file: File, target: 'add' | 'edit') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 360;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          if (target === 'add') {
            setAddForm((prev) => ({ ...prev, avatar: compressed }));
          } else {
            setEditForm((prev) => ({ ...prev, avatar: compressed }));
          }
        }
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({
          name: '',
          role: 'Hair Stylist',
          phone: '',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          specialties: '',
          status: 'active',
        });
        loadStaff();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      const res = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setShowEditModal(false);
        loadStaff();
        setSelectedStaff((prev) => (prev ? { ...prev, ...editForm } : null));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (staff: StaffItem) => {
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`/api/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadStaff();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStaff = async (staff: StaffItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${staff.name}"?\n\nThis action is permanent. Historical bill records will be preserved.`
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/staff/${staff.id}`, { method: 'DELETE' });
      if (res.ok) {
        loadStaff();
        if (selectedStaff?.id === staff.id) {
          setShowProfileDrawer(false);
          setShowEditModal(false);
          setSelectedStaff(null);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete staff member');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting staff member.');
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
    const matchesRole =
      roleFilter === 'all' || s.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      {/* Top Header */}
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
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Staff Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Manage staff profiles, local photo uploads, service assignments, and contact directory.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
          style={{ fontWeight: 700 }}
        >
          + Add Staff
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#0F131D',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#090B10',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            padding: '0 12px',
            minWidth: '320px',
          }}
        >
          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search staff by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#FFF',
              padding: '10px 0',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Role Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'Stylist', 'Barber', 'Therapist', 'Receptionist'].map((r) => (
            <button
              key={r}
              type="button"
              className={`pos-tab-btn ${roleFilter === r.toLowerCase() ? 'active' : ''}`}
              onClick={() => setRoleFilter(r.toLowerCase())}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Loading staff team...
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No staff members match this filter.
                </td>
              </tr>
            ) : (
              filteredStaff.map((s) => (
                <tr key={s.id}>
                  <td style={{ width: '50px' }}>
                    <img
                      src={
                        s.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={s.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid var(--gold-500)',
                        backgroundColor: '#121723',
                      }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFF', fontSize: '14px' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {s.specialties || 'All salon services'}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.role}</td>
                  <td style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {s.phone || '+91 98765 00000'}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        background:
                          s.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        color: s.status === 'active' ? '#4ADE80' : '#F87171',
                        border: `1px solid ${
                          s.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
                        }`,
                      }}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedStaff(s);
                          setShowProfileDrawer(true);
                        }}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedStaff(s);
                          setEditForm({
                            name: s.name,
                            role: s.role,
                            phone: s.phone || '',
                            avatar: s.avatar || '',
                            specialties: s.specialties || '',
                            status: s.status,
                          });
                          setShowEditModal(true);
                        }}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        title="Edit staff member & photo"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleToggleStatus(s)}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          color: s.status === 'active' ? '#F87171' : '#4ADE80',
                        }}
                        title={s.status === 'active' ? 'Disable staff' : 'Enable staff'}
                      >
                        {s.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDeleteStaff(s)}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          color: '#F87171',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                        }}
                        title="Permanently delete this staff member"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STAFF PROFILE DRAWER
         ═══════════════════════════════════════════════════════════════ */}
      {showProfileDrawer && selectedStaff && (
        <div className="thermal-modal-backdrop" onClick={() => setShowProfileDrawer(false)}>
          <div
            className="thermal-modal-card"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="thermal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={
                    selectedStaff.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={selectedStaff.name}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--gold-500)',
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                    {selectedStaff.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--gold-400)', fontWeight: 600 }}>
                    {selectedStaff.role} •{' '}
                    <span style={{ color: '#4ADE80' }}>{selectedStaff.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileDrawer(false)}
                style={{ color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div
                  style={{
                    background: '#121723',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Revenue Handled
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--gold-400)',
                      marginTop: '2px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    ₹{(selectedStaff.totalRevenue || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div
                  style={{
                    background: '#121723',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Services Done
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#FFF',
                      marginTop: '2px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {selectedStaff.totalServices || 0}
                  </div>
                </div>
                <div
                  style={{
                    background: '#121723',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Bills Handled
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#FFF',
                      marginTop: '2px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {selectedStaff.uniqueAppointments || 0}
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div
                style={{
                  background: '#111520',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Contact &amp; Role Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                  <div>
                    Phone: <b style={{ color: '#FFF' }}>{selectedStaff.phone || '+91 98765 00000'}</b>
                  </div>
                  <div>
                    Status: <b style={{ color: '#4ADE80' }}>Active Stylist</b>
                  </div>
                </div>
              </div>

              {/* Services they provide */}
              <div
                style={{
                  background: '#111520',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--gold-400)',
                    marginBottom: '8px',
                  }}
                >
                  Specialties &amp; Services Provided
                </div>
                <div style={{ fontSize: '13px', color: '#FFF' }}>
                  {selectedStaff.specialties || 'Hair Cut, Beard Set, Styling, Head Massage, Hair Color'}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditForm({
                      name: selectedStaff.name,
                      role: selectedStaff.role,
                      phone: selectedStaff.phone || '',
                      avatar: selectedStaff.avatar || '',
                      specialties: selectedStaff.specialties || '',
                      status: selectedStaff.status,
                    });
                    setShowProfileDrawer(false);
                    setShowEditModal(true);
                  }}
                  style={{ flex: 1 }}
                >
                  ✏️ Edit Profile &amp; Photo
                </button>
                <Link
                  href="/admin/staff-performance"
                  className="btn btn-primary"
                  style={{ flex: 1, textAlign: 'center', fontWeight: 700 }}
                >
                  📈 View Performance Analytics
                </Link>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleDeleteStaff(selectedStaff)}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  color: '#F87171',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  fontSize: '13px',
                }}
              >
                🗑️ Delete Staff Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ADD STAFF MODAL (With Direct System Photo Upload)
         ═══════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="thermal-modal-backdrop">
          <div
            style={{
              background: '#0E121B',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                + Add New Staff Member
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff}>
              {/* Photo Upload from System */}
              <div
                style={{
                  marginBottom: '16px',
                  background: '#121723',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px dashed rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <img
                  src={
                    addForm.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt="Preview"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--gold-500)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFF', marginBottom: '2px' }}>
                    Staff Photo
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Upload photo directly from your device
                  </div>
                  <input
                    type="file"
                    ref={addFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file, 'add');
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => addFileInputRef.current?.click()}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    📁 Choose from System...
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Role / Designation *
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                >
                  <option value="Hair Stylist">Hair Stylist</option>
                  <option value="Barber">Barber</option>
                  <option value="Beautician">Beautician</option>
                  <option value="Spa Therapist">Spa Therapist</option>
                  <option value="Senior Stylist">Senior Stylist</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Specialties &amp; Services
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hair Cut, Facial, Hair Spa"
                  value={addForm.specialties}
                  onChange={(e) => setAddForm({ ...addForm, specialties: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          EDIT STAFF MODAL (With Direct System Photo Upload)
         ═══════════════════════════════════════════════════════════════ */}
      {showEditModal && selectedStaff && (
        <div className="thermal-modal-backdrop">
          <div
            style={{
              background: '#0E121B',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                Edit Staff: {selectedStaff.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditStaff}>
              {/* Photo Upload from System */}
              <div
                style={{
                  marginBottom: '16px',
                  background: '#121723',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px dashed rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <img
                  src={
                    editForm.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt="Avatar preview"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--gold-500)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFF', marginBottom: '2px' }}>
                    Update Photo
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Select new image from your system
                  </div>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file, 'edit');
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => editFileInputRef.current?.click()}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    📁 Choose New Photo...
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Role
                </label>
                <input
                  type="text"
                  required
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Specialties
                </label>
                <input
                  type="text"
                  value={editForm.specialties}
                  onChange={(e) => setEditForm({ ...editForm, specialties: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 12px',
                    fontSize: '13px',
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
