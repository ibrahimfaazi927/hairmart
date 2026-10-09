'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getSalonDateString, formatCurrentTime, parseSessionsFromRecord } from '@/lib/attendanceSessions';

interface ChairItem {
  id: string;
  name: string;
  section: string;
}

interface StaffItem {
  id: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  status: string;
  section?: string;
  gender?: string;
  chairId?: string | null;
  chair?: ChairItem | null;
  joiningDate?: string;
  specialties?: string;
  notes?: string;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  duration?: string | null;
  status: string;
  notes?: string | null;
  staff: {
    id: string;
    name: string;
    role: string;
    section?: string | null;
    chair?: ChairItem | null;
    status: string;
    avatar?: string | null;
  };
}

interface AttendanceSummary {
  totalRecords: number;
  totalPresent: number;
  totalAbsent: number;
  totalHalfDay: number;
  totalLeave: number;
  totalHoliday: number;
}

interface LeaveRecord {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: string;
  reason?: string | null;
  staff: {
    id: string;
    name: string;
    role: string;
    section?: string | null;
    chair?: ChairItem | null;
  };
}

type TabType = 'directory' | 'attendance' | 'leaves';

export default function AdminStaffManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('directory');
  const [loading, setLoading] = useState(true);

  // ── Tab 1: Staff Directory States ──
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [chairs, setChairs] = useState<ChairItem[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Drawers
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
    gender: 'male',
    section: 'men',
    chairId: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    specialties: 'Hair Cut, Beard Set, Styling',
    status: 'active',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    phone: '',
    gender: 'male',
    section: 'men',
    chairId: '',
    avatar: '',
    specialties: '',
    status: 'active',
  });

  // ── Tab 2: Attendance States ──
  const [attendanceDate, setAttendanceDate] = useState(() => {
    return getSalonDateString();
  });
  const [attendanceStaffFilter, setAttendanceStaffFilter] = useState('all');
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary>({
    totalRecords: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalHalfDay: 0,
    totalLeave: 0,
    totalHoliday: 0,
  });
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Admin Attendance Correction Modal
  const [correctModalRecord, setCorrectModalRecord] = useState<AttendanceRecord | null>(null);
  const [correctForm, setCorrectForm] = useState({
    checkIn: '',
    checkOut: '',
    status: 'Present',
    notes: '',
  });
  const [savingCorrection, setSavingCorrection] = useState(false);

  // ── Tab 3: Leave States ──
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [leaveStaffFilter, setLeaveStaffFilter] = useState('all');
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    staffId: '',
    startDate: getSalonDateString(),
    endDate: getSalonDateString(),
    leaveType: 'Casual',
    reason: '',
    status: 'approved',
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  // ── Initial Load ──
  useEffect(() => {
    loadStaff();
    loadChairs();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      loadAttendance();
    } else if (activeTab === 'leaves') {
      loadLeaves();
    }
  }, [activeTab, attendanceDate, attendanceStaffFilter, leaveStaffFilter]);

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

  const loadChairs = async () => {
    try {
      const res = await fetch('/api/chairs');
      if (res.ok) {
        const data = await res.json();
        setChairs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const url = `/api/staff/attendance?date=${attendanceDate}${
        attendanceStaffFilter !== 'all' ? `&staffId=${attendanceStaffFilter}` : ''
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAttendances(data.attendances || []);
        if (data.summary) {
          setAttendanceSummary(data.summary);
        }
      }
    } catch (e) {
      console.error('Failed to load attendance:', e);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const loadLeaves = async () => {
    try {
      const url = `/api/staff/leaves${
        leaveStaffFilter !== 'all' ? `?staffId=${leaveStaffFilter}` : ''
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (e) {
      console.error('Failed to load leaves:', e);
    }
  };

  // ── Image Upload ──
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

  // ── Staff Directory Actions ──
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          chairId: addForm.chairId || null,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({
          name: '',
          role: 'Hair Stylist',
          phone: '',
          gender: 'male',
          section: 'men',
          chairId: '',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          specialties: '',
          status: 'active',
        });
        loadStaff();
        loadChairs();
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
        body: JSON.stringify({
          ...editForm,
          chairId: editForm.chairId || null,
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        loadStaff();
        loadChairs();
        setSelectedStaff(null);
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
      loadChairs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStaff = async (staff: StaffItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate/delete "${staff.name}"?\n\nIf they have historical records, their profile will be deactivated and unassigned from chairs to preserve all records.`
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/staff/${staff.id}`, { method: 'DELETE' });
      if (res.ok) {
        loadStaff();
        loadChairs();
        if (selectedStaff?.id === staff.id) {
          setShowProfileDrawer(false);
          setShowEditModal(false);
          setSelectedStaff(null);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update staff member');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating staff member.');
    }
  };

  // ── Admin Attendance Correction Action ──
  const handleOpenCorrectAttendance = (record: AttendanceRecord) => {
    setCorrectModalRecord(record);
    setCorrectForm({
      checkIn: record.checkIn || '',
      checkOut: record.checkOut || '',
      status: record.status || 'Present',
      notes: record.notes || '',
    });
  };

  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctModalRecord) return;
    setSavingCorrection(true);
    try {
      const res = await fetch(`/api/staff/attendance/${correctModalRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: correctForm.checkIn || null,
          checkOut: correctForm.checkOut || null,
          status: correctForm.status,
          notes: correctForm.notes || 'Corrected by admin',
        }),
      });

      if (res.ok) {
        setCorrectModalRecord(null);
        loadAttendance();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save correction');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while saving correction');
    } finally {
      setSavingCorrection(false);
    }
  };

  // ── Leave Actions ──
  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.staffId) {
      alert('Please select a staff member');
      return;
    }
    setLeaveSubmitting(true);
    try {
      const res = await fetch('/api/staff/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveForm),
      });
      if (res.ok) {
        setShowAddLeaveModal(false);
        setLeaveForm({
          staffId: '',
          startDate: getSalonDateString(),
          endDate: getSalonDateString(),
          leaveType: 'Casual',
          reason: '',
          status: 'approved',
        });
        loadLeaves();
        if (activeTab === 'attendance') loadAttendance();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record leave');
      }
    } catch (e) {
      console.error('Failed to record leave:', e);
    } finally {
      setLeaveSubmitting(false);
    }
  };

  // ── Filtered Staff for Directory ──
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
    const matchesRole =
      roleFilter === 'all' || s.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* ── Page Header ── */}
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
            Staff &amp; Attendance Hub
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Manage staff profiles, chair assignments, daily walk-in/out attendance logs, and leave requests.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/staff"
            className="btn btn-outline btn-sm"
            style={{ fontWeight: 600, borderColor: 'var(--gold-500)', color: 'var(--gold-400)' }}
          >
            ⏱️ Open Staff Terminal (Walk In/Out)
          </Link>
          {activeTab === 'directory' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddModal(true)}
              style={{ fontWeight: 700 }}
            >
              + Add New Staff
            </button>
          )}
          {activeTab === 'leaves' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddLeaveModal(true)}
              style={{ fontWeight: 700 }}
            >
              + Record Leave
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Switcher Bar (3 Tabs Only: Salary Removed) ── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: '#0D111A',
          padding: '6px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '22px',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          style={{
            flex: 1,
            minWidth: '160px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: activeTab === 'directory' ? 700 : 500,
            background: activeTab === 'directory' ? 'var(--gold-400)' : 'transparent',
            color: activeTab === 'directory' ? '#0A0D14' : 'var(--text-secondary)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>👥</span> Staff Directory ({staffList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: activeTab === 'attendance' ? 700 : 500,
            background: activeTab === 'attendance' ? 'var(--gold-400)' : 'transparent',
            color: activeTab === 'attendance' ? '#0A0D14' : 'var(--text-secondary)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>📅</span> Attendance Tracking (Walk In/Out)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          style={{
            flex: 1,
            minWidth: '160px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: activeTab === 'leaves' ? 700 : 500,
            background: activeTab === 'leaves' ? 'var(--gold-400)' : 'transparent',
            color: activeTab === 'leaves' ? '#0A0D14' : 'var(--text-secondary)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>🏖️</span> Leave Management
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: STAFF DIRECTORY
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'directory' && (
        <div>
          {/* Filter Bar */}
          <div
            style={{
              background: '#0F131D',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '14px 18px',
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
                minWidth: '280px',
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
                  padding: '9px 0',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'Stylist', 'Barber', 'Beautician', 'Therapist', 'Receptionist'].map((r) => (
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

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: '#121723',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  color: 'var(--text-secondary)',
                  padding: '6px 12px',
                  fontSize: '12px',
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="crm-table-wrapper admin-table-container">
            <table className="crm-table admin-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Staff Member</th>
                  <th>Role &amp; Section</th>
                  <th>Assigned Chair</th>
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
                          {s.phone || 'No phone'}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{s.role}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {s.section || 'Unisex'} section
                        </div>
                      </td>
                      <td>
                        {s.chair ? (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: s.chair.section === 'men' ? 'rgba(59,130,246,0.15)' : 'rgba(236,72,153,0.15)',
                              color: s.chair.section === 'men' ? '#60A5FA' : '#F472B6',
                              border: `1px solid ${s.chair.section === 'men' ? 'rgba(59,130,246,0.3)' : 'rgba(236,72,153,0.3)'}`,
                            }}
                          >
                            🪑 {s.chair.name}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            No Chair Assigned
                          </span>
                        )}
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
                                gender: s.gender || 'male',
                                section: s.section || 'men',
                                chairId: s.chairId || '',
                                avatar: s.avatar || '',
                                specialties: s.specialties || '',
                                status: s.status,
                              });
                              setShowEditModal(true);
                            }}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            title="Edit staff member"
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
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: ATTENDANCE TRACKING (Walk-In, Walk-Out, Working Duration)
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'attendance' && (
        <div>
          {/* Attendance Controls Bar */}
          <div
            style={{
              background: '#0F131D',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Attendance Date:
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                style={{
                  background: '#121723',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#FFF',
                  padding: '7px 12px',
                  fontSize: '13px',
                }}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setAttendanceDate(getSalonDateString())}
                style={{ fontSize: '12px' }}
              >
                Today
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Filter Staff:</label>
              <select
                value={attendanceStaffFilter}
                onChange={(e) => setAttendanceStaffFilter(e.target.value)}
                style={{
                  background: '#121723',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#FFF',
                  padding: '7px 12px',
                  fontSize: '13px',
                }}
              >
                <option value="all">All Active Staff</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendance Stats Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ background: '#10141E', padding: '14px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.25)' }}>
              <div style={{ fontSize: '11px', color: '#4ADE80', fontWeight: 600, textTransform: 'uppercase' }}>Present</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#4ADE80', marginTop: '4px' }}>
                {attendanceSummary.totalPresent}
              </div>
            </div>
            <div style={{ background: '#10141E', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div style={{ fontSize: '11px', color: '#F87171', fontWeight: 600, textTransform: 'uppercase' }}>Absent</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#F87171', marginTop: '4px' }}>
                {attendanceSummary.totalAbsent}
              </div>
            </div>
            <div style={{ background: '#10141E', padding: '14px', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.25)' }}>
              <div style={{ fontSize: '11px', color: '#FACC15', fontWeight: 600, textTransform: 'uppercase' }}>Half Day</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#FACC15', marginTop: '4px' }}>
                {attendanceSummary.totalHalfDay}
              </div>
            </div>
            <div style={{ background: '#10141E', padding: '14px', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.25)' }}>
              <div style={{ fontSize: '11px', color: '#C084FC', fontWeight: 600, textTransform: 'uppercase' }}>On Leave</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#C084FC', marginTop: '4px' }}>
                {attendanceSummary.totalLeave}
              </div>
            </div>
            <div style={{ background: '#10141E', padding: '14px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.25)' }}>
              <div style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 600, textTransform: 'uppercase' }}>Holiday</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#60A5FA', marginTop: '4px' }}>
                {attendanceSummary.totalHoliday}
              </div>
            </div>
          </div>

          {/* Daily Attendance Roster Table */}
          <div className="crm-table-wrapper admin-table-container">
            <table className="crm-table admin-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Chair / Role</th>
                  <th>Walk In Time</th>
                  <th>Walk Out Time</th>
                  <th>Working Duration</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLoading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Loading daily roster...
                    </td>
                  </tr>
                ) : (
                  staffList
                    .filter((s) => s.status === 'active' && (attendanceStaffFilter === 'all' || s.id === attendanceStaffFilter))
                    .map((s) => {
                      const rec = attendances.find((a) => a.staffId === s.id);
                      const currentStatus = rec?.status || 'Not Walked In';
                      const sessions = parseSessionsFromRecord(rec?.notes, rec?.checkIn, rec?.checkOut);
                      const isCurrentlyWorking = Boolean(rec?.checkIn && !rec?.checkOut);
                      const latestSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

                      // Clean duration calculation without duplicate "(+ In Progress)"
                      let displayDuration = '—';
                      if (rec?.checkIn) {
                        if (rec.duration && rec.duration !== 'In Progress' && rec.duration !== '—') {
                          displayDuration = isCurrentlyWorking ? `${rec.duration} (+ In Progress)` : rec.duration;
                        } else {
                          displayDuration = isCurrentlyWorking ? 'In Progress' : (rec.duration || '—');
                        }
                      }

                      return (
                        <tr key={s.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#FFF' }}>{s.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.phone || 'No phone'}</div>
                          </td>
                          <td>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{s.role}</div>
                            {s.chair && (
                              <span style={{ fontSize: '10px', color: 'var(--gold-400)' }}>🪑 {s.chair.name}</span>
                            )}
                          </td>
                          <td style={{ color: rec?.checkIn ? '#4ADE80' : 'var(--text-muted)', fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            {rec?.checkIn ? (
                              <div>
                                <div>{rec.checkIn}</div>
                                {sessions.length > 1 && latestSession && (
                                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 500 }}>
                                    Latest: {latestSession.in} (S{sessions.length})
                                  </div>
                                )}
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            {rec?.checkOut ? (
                              <div>
                                <span style={{ color: '#60A5FA' }}>{rec.checkOut}</span>
                                {sessions.length > 1 && (
                                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 500 }}>
                                    {sessions.length} sessions completed
                                  </div>
                                )}
                              </div>
                            ) : isCurrentlyWorking ? (
                              <div>
                                <span style={{ color: '#4ADE80', fontSize: '12px' }}>● On Duty</span>
                                {sessions.length > 1 && sessions[0].out && (
                                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 500 }}>
                                    Break was: {sessions[0].out}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td style={{ color: 'var(--gold-400)', fontWeight: 700, fontSize: '13px' }}>
                            {displayDuration}
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background:
                                  currentStatus === 'Present'
                                    ? 'rgba(34,197,94,0.18)'
                                    : currentStatus === 'Absent'
                                    ? 'rgba(239,68,68,0.18)'
                                    : currentStatus === 'Half Day'
                                    ? 'rgba(234,179,8,0.18)'
                                    : currentStatus === 'Leave'
                                    ? 'rgba(168,85,247,0.18)'
                                    : 'rgba(255,255,255,0.06)',
                                color:
                                  currentStatus === 'Present'
                                    ? '#4ADE80'
                                    : currentStatus === 'Absent'
                                    ? '#F87171'
                                    : currentStatus === 'Half Day'
                                    ? '#FACC15'
                                    : currentStatus === 'Leave'
                                    ? '#C084FC'
                                    : 'var(--text-muted)',
                                border: `1px solid ${
                                  currentStatus === 'Present'
                                    ? 'rgba(34,197,94,0.3)'
                                    : currentStatus === 'Absent'
                                    ? 'rgba(239,68,68,0.3)'
                                    : 'rgba(255,255,255,0.1)'
                                }`,
                              }}
                            >
                              {currentStatus}
                            </span>
                          </td>
                          <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {sessions.length > 1 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {sessions.map((sess) => (
                                  <span
                                    key={sess.sessionNum}
                                    style={{
                                      fontSize: '11px',
                                      background: 'rgba(255,255,255,0.06)',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(255,255,255,0.08)',
                                      color: sess.out ? '#CBD5E1' : '#4ADE80',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <strong>S{sess.sessionNum}:</strong> {sess.in} → {sess.out || 'Active'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              rec?.notes || '—'
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {rec ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handleOpenCorrectAttendance(rec)}
                                style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--gold-400)', borderColor: 'rgba(212,175,55,0.3)' }}
                              >
                                ✏️ Correct
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={async () => {
                                  const defaultIn = attendanceDate === getSalonDateString() ? formatCurrentTime() : '09:00 AM';
                                  await fetch('/api/staff/attendance', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      staffId: s.id,
                                      date: attendanceDate,
                                      status: 'Present',
                                      checkIn: defaultIn,
                                      notes: `Session 1: ${defaultIn} - In Progress`,
                                    }),
                                  });
                                  loadAttendance();
                                }}
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                              >
                                Mark Present
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 3: LEAVE MANAGEMENT
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'leaves' && (
        <div>
          {/* Leave Controls Bar */}
          <div
            style={{
              background: '#0F131D',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Filter by Staff:</label>
              <select
                value={leaveStaffFilter}
                onChange={(e) => setLeaveStaffFilter(e.target.value)}
                style={{
                  background: '#121723',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#FFF',
                  padding: '7px 12px',
                  fontSize: '13px',
                }}
              >
                <option value="all">All Staff Members</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddLeaveModal(true)}
              style={{ fontWeight: 700 }}
            >
              + Record Leave
            </button>
          </div>

          {/* Leaves Table */}
          <div className="crm-table-wrapper admin-table-container">
            <table className="crm-table admin-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No leave records recorded yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((lv) => {
                    const start = new Date(lv.startDate);
                    const end = new Date(lv.endDate);
                    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                    return (
                      <tr key={lv.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#FFF' }}>{lv.staff.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lv.staff.role}</div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(212,175,55,0.15)',
                              color: 'var(--gold-400)',
                              border: '1px solid rgba(212,175,55,0.3)',
                            }}
                          >
                            {lv.leaveType}
                          </span>
                        </td>
                        <td style={{ color: '#FFF', fontWeight: 600, fontSize: '13px' }}>
                          {diffDays} {diffDays === 1 ? 'day' : 'days'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} —{' '}
                          {end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '12px', maxWidth: '240px' }}>
                          {lv.reason || 'No reason provided'}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background:
                                lv.status === 'approved'
                                  ? 'rgba(34,197,94,0.15)'
                                  : lv.status === 'rejected'
                                  ? 'rgba(239,68,68,0.15)'
                                  : 'rgba(234,179,8,0.15)',
                              color:
                                lv.status === 'approved'
                                  ? '#4ADE80'
                                  : lv.status === 'rejected'
                                  ? '#F87171'
                                  : '#FACC15',
                              textTransform: 'capitalize',
                            }}
                          >
                            {lv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: ADMIN ATTENDANCE CORRECTION
         ═══════════════════════════════════════════════════════════════ */}
      {correctModalRecord && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                  Correct Attendance: {correctModalRecord.staff.name}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Date: {new Date(correctModalRecord.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCorrectModalRecord(null)}
                style={{ color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCorrection}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Walk In Time (Check-In)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:15 AM"
                    value={correctForm.checkIn}
                    onChange={(e) => setCorrectForm({ ...correctForm, checkIn: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121723',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#FFF',
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Walk Out Time (Check-Out)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 06:45 PM"
                    value={correctForm.checkOut}
                    onChange={(e) => setCorrectForm({ ...correctForm, checkOut: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121723',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#FFF',
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Attendance Status
                </label>
                <select
                  value={correctForm.status}
                  onChange={(e) => setCorrectForm({ ...correctForm, status: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '9px 12px',
                    fontSize: '13px',
                  }}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Leave">Leave</option>
                  <option value="Holiday">Holiday</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Correction Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Forgot to punch walk-out, corrected per manager"
                  value={correctForm.notes}
                  onChange={(e) => setCorrectForm({ ...correctForm, notes: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '9px 12px',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCorrectModalRecord(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCorrection}
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  {savingCorrection ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: ADD NEW STAFF
         ═══════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="thermal-modal-backdrop">
          <div
            style={{
              background: '#0E121B',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
              {/* Photo Upload */}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
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
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
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
                      padding: '9px 12px',
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
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
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Section
                  </label>
                  <select
                    value={addForm.section}
                    onChange={(e) => setAddForm({ ...addForm, section: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121723',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#FFF',
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  >
                    <option value="men">Men's Salon</option>
                    <option value="women">Women's Salon</option>
                    <option value="unisex">Unisex / All</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Assign to Chair (Optional)
                </label>
                <select
                  value={addForm.chairId}
                  onChange={(e) => setAddForm({ ...addForm, chairId: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '9px 12px',
                    fontSize: '13px',
                  }}
                >
                  <option value="">No Chair Assigned</option>
                  {chairs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.section === 'men' ? "Men's Section" : "Women's Section"})
                    </option>
                  ))}
                </select>
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
                    padding: '9px 12px',
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
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: EDIT STAFF
         ═══════════════════════════════════════════════════════════════ */}
      {showEditModal && selectedStaff && (
        <div className="thermal-modal-backdrop">
          <div
            style={{
              background: '#0E121B',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
              {/* Photo Upload */}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
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
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
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
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
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
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Section
                  </label>
                  <select
                    value={editForm.section}
                    onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121723',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#FFF',
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  >
                    <option value="men">Men's Salon</option>
                    <option value="women">Women's Salon</option>
                    <option value="unisex">Unisex / All</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Assigned Chair
                </label>
                <select
                  value={editForm.chairId}
                  onChange={(e) => setEditForm({ ...editForm, chairId: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '9px 12px',
                    fontSize: '13px',
                  }}
                >
                  <option value="">No Chair Assigned</option>
                  {chairs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.section === 'men' ? "Men's Section" : "Women's Section"})
                    </option>
                  ))}
                </select>
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
                    padding: '9px 12px',
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
                    padding: '9px 12px',
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

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: RECORD LEAVE
         ═══════════════════════════════════════════════════════════════ */}
      {showAddLeaveModal && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                + Record Staff Leave
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLeaveModal(false)}
                style={{ color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeave}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Staff Member *
                </label>
                <select
                  required
                  value={leaveForm.staffId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, staffId: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '9px 12px',
                    fontSize: '13px',
                  }}
                >
                  <option value="">Select Staff Member...</option>
                  {staffList.filter((s) => s.status === 'active').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121723',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#FFF',
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121723',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#FFF',
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Leave Type
                  </label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121723',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#FFF',
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Paid">Paid Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Approval Status
                  </label>
                  <select
                    value={leaveForm.status}
                    onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#121723',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#FFF',
                      padding: '9px 12px',
                      fontSize: '13px',
                    }}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Reason (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Family event, medical checkup"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '9px 12px',
                    fontSize: '13px',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddLeaveModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  {leaveSubmitting ? 'Saving...' : 'Record Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DRAWER: STAFF PROFILE (NO SALARY & NO STAFF REVENUE)
         ═══════════════════════════════════════════════════════════════ */}
      {showProfileDrawer && selectedStaff && (
        <div className="thermal-modal-backdrop" onClick={() => setShowProfileDrawer(false)}>
          <div
            className="thermal-modal-card"
            style={{ maxWidth: '580px' }}
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
                    <span style={{ color: selectedStaff.status === 'active' ? '#4ADE80' : '#F87171' }}>
                      {selectedStaff.status.toUpperCase()}
                    </span>
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

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#121723',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  fontSize: '13px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Chair: </span>
                  <b style={{ color: '#FFF' }}>{selectedStaff.chair ? selectedStaff.chair.name : 'None'}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Section: </span>
                  <b style={{ color: '#FFF', textTransform: 'capitalize' }}>{selectedStaff.section || 'Unisex'}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Phone: </span>
                  <b style={{ color: '#FFF' }}>{selectedStaff.phone || 'None'}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                  <b style={{ color: selectedStaff.status === 'active' ? '#4ADE80' : '#F87171', textTransform: 'capitalize' }}>
                    {selectedStaff.status}
                  </b>
                </div>
              </div>

              <div
                style={{
                  background: '#111520',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-400)', marginBottom: '6px' }}>
                  Specialties &amp; Services
                </div>
                <div style={{ fontSize: '13px', color: '#FFF' }}>
                  {selectedStaff.specialties || 'Hair Cut, Beard Set, Styling, Head Massage, Hair Color'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditForm({
                      name: selectedStaff.name,
                      role: selectedStaff.role,
                      phone: selectedStaff.phone || '',
                      gender: selectedStaff.gender || 'male',
                      section: selectedStaff.section || 'men',
                      chairId: selectedStaff.chairId || '',
                      avatar: selectedStaff.avatar || '',
                      specialties: selectedStaff.specialties || '',
                      status: selectedStaff.status,
                    });
                    setShowProfileDrawer(false);
                    setShowEditModal(true);
                  }}
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  ✏️ Edit Profile
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    handleToggleStatus(selectedStaff);
                  }}
                  style={{
                    flex: 1,
                    color: selectedStaff.status === 'active' ? '#F87171' : '#4ADE80',
                  }}
                >
                  {selectedStaff.status === 'active' ? 'Disable Staff' : 'Enable Staff'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
