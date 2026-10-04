'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  status: string;
  gender?: string;
  section?: string;
  joiningDate?: string;
  specialties?: string;
  notes?: string;
}

interface ChairItem {
  id: string;
  name: string;
  section: string;
  sortOrder: number;
  active: boolean;
  assignedStaff?: StaffMember | null;
}

export default function AdminChairManagementPage() {
  const [chairs, setChairs] = useState<ChairItem[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Reassign Modal
  const [assignModalChair, setAssignModalChair] = useState<ChairItem | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [savingAssign, setSavingAssign] = useState(false);

  // Edit Staff Directly Modal
  const [editStaffModal, setEditStaffModal] = useState<StaffMember | null>(null);
  const [editStaffForm, setEditStaffForm] = useState({
    name: '',
    phone: '',
    role: '',
    gender: 'male',
    section: 'men',
    joiningDate: '',
    status: 'active',
    specialties: '',
    notes: '',
  });
  const [savingStaff, setSavingStaff] = useState(false);

  // Add / Edit Chair Modal
  const [chairModal, setChairModal] = useState<{ mode: 'add' | 'edit'; chair?: ChairItem } | null>(null);
  const [chairForm, setChairForm] = useState({
    name: '',
    section: 'men',
    sortOrder: 1,
    active: true,
  });
  const [savingChair, setSavingChair] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chairsRes, staffRes] = await Promise.all([
        fetch('/api/chairs'),
        fetch('/api/staff'),
      ]);

      if (chairsRes.ok) {
        const chairsData = await chairsRes.json();
        setChairs(chairsData);
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setAllStaff(staffData);
      }
    } catch (e) {
      console.error('Failed to load chair data:', e);
    } finally {
      setLoading(false);
    }
  };

  // ── Chair Reassignment ──
  const handleOpenAssignModal = (chair: ChairItem) => {
    setAssignModalChair(chair);
    setSelectedStaffId(chair.assignedStaff?.id || '');
  };

  const handleSaveAssignment = async () => {
    if (!assignModalChair) return;
    setSavingAssign(true);
    try {
      const res = await fetch(`/api/chairs/${assignModalChair.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaffId ? selectedStaffId : null,
        }),
      });

      if (res.ok) {
        setNotice(`Assigned staff for ${assignModalChair.section.toUpperCase()} - ${assignModalChair.name} updated!`);
        setTimeout(() => setNotice(null), 3500);
        setAssignModalChair(null);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update chair assignment');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while assigning staff');
    } finally {
      setSavingAssign(false);
    }
  };

  // ── Edit Staff Details Directly ──
  const handleOpenEditStaff = (staff: StaffMember) => {
    setEditStaffModal(staff);
    setEditStaffForm({
      name: staff.name,
      phone: staff.phone || '',
      role: staff.role || 'Hair Stylist',
      gender: staff.gender || 'male',
      section: staff.section || 'men',
      joiningDate: staff.joiningDate ? staff.joiningDate.split('T')[0] : '',
      status: staff.status || 'active',
      specialties: staff.specialties || '',
      notes: staff.notes || '',
    });
  };

  const handleSaveStaffDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaffModal) return;
    setSavingStaff(true);
    try {
      const res = await fetch(`/api/staff/${editStaffModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editStaffForm),
      });

      if (res.ok) {
        setNotice(`Staff details for "${editStaffForm.name}" updated successfully!`);
        setTimeout(() => setNotice(null), 3500);
        setEditStaffModal(null);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update staff member');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating staff member.');
    } finally {
      setSavingStaff(false);
    }
  };

  // ── Chair Create / Edit ──
  const handleOpenAddChair = () => {
    setChairForm({
      name: `Chair ${chairs.length + 1}`,
      section: 'men',
      sortOrder: chairs.length + 1,
      active: true,
    });
    setChairModal({ mode: 'add' });
  };

  const handleOpenEditChair = (chair: ChairItem) => {
    setChairForm({
      name: chair.name,
      section: chair.section,
      sortOrder: chair.sortOrder,
      active: chair.active,
    });
    setChairModal({ mode: 'edit', chair });
  };

  const handleSaveChair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chairModal) return;
    setSavingChair(true);
    try {
      const isAdd = chairModal.mode === 'add';
      const url = isAdd ? '/api/chairs' : `/api/chairs/${chairModal.chair?.id}`;
      const method = isAdd ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chairForm),
      });

      if (res.ok) {
        setNotice(`Chair "${chairForm.name}" ${isAdd ? 'created' : 'updated'} successfully!`);
        setTimeout(() => setNotice(null), 3500);
        setChairModal(null);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save chair');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving chair');
    } finally {
      setSavingChair(false);
    }
  };

  const handleToggleActive = async (chair: ChairItem) => {
    try {
      const res = await fetch(`/api/chairs/${chair.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active: !chair.active,
        }),
      });

      if (res.ok) {
        setNotice(`${chair.name} marked as ${!chair.active ? 'Active' : 'Inactive'}`);
        setTimeout(() => setNotice(null), 3000);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const menChairs = chairs.filter((c) => c.section.toLowerCase() === 'men');
  const womenChairs = chairs.filter((c) => c.section.toLowerCase() === 'women');

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Styling Chair &amp; Workstation Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Manage Men's Chairs (1–4) &amp; Women's Chairs (1–2), assign staff, and edit staff profiles directly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleOpenAddChair}
            style={{ fontWeight: 600 }}
          >
            + Add New Chair
          </button>
          <Link href="/admin/billing" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
            + Charge Bill (Select Chair)
          </Link>
          <Link href="/admin/reports" className="btn btn-outline btn-sm">
            Chair Revenue →
          </Link>
        </div>
      </div>

      {notice && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid #22C55E',
            color: '#4ADE80',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ✅ {notice}
        </div>
      )}

      {/* Info Notice Box */}
      <div
        style={{
          background: '#0D111A',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--gold-400)' }}>Chair Workflow Rule:</strong> Chairs represent physical salon workstations. During POS billing, cashiers choose the <strong style={{ color: '#FFF' }}>Chair</strong> only. You can edit staff assignment or update staff member details directly below.
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: MEN'S STYLING CHAIRS (4 CHAIRS)
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '22px' }}>🧔</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              MEN'S SALON CHAIRS
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Workstations dedicated to Men's Haircuts, Beard Grooming &amp; Styling (Chairs 1–4)
            </div>
          </div>
          <span style={{ marginLeft: 'auto', background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
            {menChairs.filter((c) => c.active).length} / {menChairs.length} Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {menChairs.map((chair) => {
            const staff = chair.assignedStaff;
            return (
              <div
                key={chair.id}
                style={{
                  background: '#10141E',
                  border: chair.active ? '1.5px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      🪑
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{chair.name}</div>
                      <div style={{ fontSize: '11px', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        Men's Section
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditChair(chair)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                      title="Edit Chair Name / Sort Order"
                    >
                      ⚙️
                    </button>
                    <span
                      onClick={() => handleToggleActive(chair)}
                      style={{
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: chair.active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: chair.active ? '#4ADE80' : '#F87171',
                        border: chair.active ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                      title="Click to toggle Active / Inactive"
                    >
                      {chair.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Assigned Staff Box */}
                <div style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #F6C926, #B38F24)', color: '#0A0D14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>
                    {staff ? staff.name.charAt(0) : '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Staff Member:</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: staff ? '#FFFFFF' : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {staff ? staff.name : 'No Staff Assigned'}
                    </div>
                    {staff && (
                      <div style={{ fontSize: '11px', color: 'var(--gold-400)' }}>
                        {staff.role} {staff.phone ? `• ${staff.phone}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Reassign Staff & Edit Staff Details Directly */}
                <div style={{ display: 'grid', gridTemplateColumns: staff ? '1fr 1fr' : '1fr', gap: '8px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(chair)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11.5px', fontWeight: 600, padding: '7px 8px', textAlign: 'center' }}
                  >
                    🔁 {staff ? 'Change Staff' : 'Assign Staff'}
                  </button>

                  {staff && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditStaff(staff)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '11.5px', fontWeight: 600, padding: '7px 8px', color: 'var(--gold-400)', borderColor: 'rgba(212,175,55,0.3)' }}
                      title="Edit this staff member's name, phone, role, joining date"
                    >
                      👤 Edit Staff
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: WOMEN'S STYLING CHAIRS (2 CHAIRS)
         ═══════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '22px' }}>👩</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              WOMEN'S SALON CHAIRS
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Workstations dedicated to Hair Spa, Styling, Smoothening &amp; Beauty (Chairs 1–2)
            </div>
          </div>
          <span style={{ marginLeft: 'auto', background: 'rgba(236, 72, 153, 0.15)', color: '#F472B6', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
            {womenChairs.filter((c) => c.active).length} / {womenChairs.length} Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {womenChairs.map((chair) => {
            const staff = chair.assignedStaff;
            return (
              <div
                key={chair.id}
                style={{
                  background: '#10141E',
                  border: chair.active ? '1.5px solid rgba(236, 72, 153, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid #EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      🪑
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{chair.name}</div>
                      <div style={{ fontSize: '11px', color: '#F472B6', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        Women's Section
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditChair(chair)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                      title="Edit Chair Name / Sort Order"
                    >
                      ⚙️
                    </button>
                    <span
                      onClick={() => handleToggleActive(chair)}
                      style={{
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: chair.active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: chair.active ? '#4ADE80' : '#F87171',
                        border: chair.active ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                      title="Click to toggle Active / Inactive"
                    >
                      {chair.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Assigned Staff Box */}
                <div style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #EC4899, #BE185D)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>
                    {staff ? staff.name.charAt(0) : '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Staff Member:</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: staff ? '#FFFFFF' : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {staff ? staff.name : 'No Staff Assigned'}
                    </div>
                    {staff && (
                      <div style={{ fontSize: '11px', color: '#F472B6' }}>
                        {staff.role} {staff.phone ? `• ${staff.phone}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Reassign Staff & Edit Staff Details Directly */}
                <div style={{ display: 'grid', gridTemplateColumns: staff ? '1fr 1fr' : '1fr', gap: '8px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(chair)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11.5px', fontWeight: 600, padding: '7px 8px', textAlign: 'center' }}
                  >
                    🔁 {staff ? 'Change Staff' : 'Assign Staff'}
                  </button>

                  {staff && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditStaff(staff)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '11.5px', fontWeight: 600, padding: '7px 8px', color: '#F472B6', borderColor: 'rgba(236,72,153,0.3)' }}
                      title="Edit this staff member's name, phone, role, joining date"
                    >
                      👤 Edit Staff
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: ASSIGN / CHANGE STAFF FOR CHAIR
         ═══════════════════════════════════════════════════════════════ */}
      {assignModalChair && (
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
                  Assign Staff to {assignModalChair.name}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Section: {assignModalChair.section.toUpperCase()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalChair(null)}
                style={{ color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Select Staff Member:
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#121723',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#FFF',
                  padding: '10px 12px',
                  fontSize: '13px',
                }}
              >
                <option value="">-- No Staff Assigned (Unassign) --</option>
                {allStaff
                  .filter((s) => s.status === 'active')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role}) {s.section ? `• ${s.section}` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setAssignModalChair(null)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingAssign}
                className="btn btn-primary"
                onClick={handleSaveAssignment}
                style={{ flex: 1, fontWeight: 700 }}
              >
                {savingAssign ? 'Saving...' : 'Save Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: EDIT STAFF DETAILS DIRECTLY FROM CHAIR
         ═══════════════════════════════════════════════════════════════ */}
      {editStaffModal && (
        <div className="thermal-modal-backdrop">
          <div
            style={{
              background: '#0E121B',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', margin: 0 }}>
                  Edit Staff: {editStaffModal.name}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Update staff profile directly from Chair Management
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditStaffModal(null)}
                style={{ color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaffDetails}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffForm.name}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })}
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
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffForm.role}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, role: e.target.value })}
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
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editStaffForm.phone}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, phone: e.target.value })}
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
                    value={editStaffForm.section}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, section: e.target.value })}
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
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={editStaffForm.joiningDate}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, joiningDate: e.target.value })}
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
                    Status
                  </label>
                  <select
                    value={editStaffForm.status}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, status: e.target.value })}
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
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Specialties &amp; Services
                </label>
                <input
                  type="text"
                  placeholder="e.g. Haircut, Beard Design, Color, Spa"
                  value={editStaffForm.specialties}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, specialties: e.target.value })}
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
                  Notes (Internal)
                </label>
                <textarea
                  rows={2}
                  value={editStaffForm.notes}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, notes: e.target.value })}
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
                  onClick={() => setEditStaffModal(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStaff}
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  {savingStaff ? 'Saving...' : 'Save Staff Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT CHAIR
         ═══════════════════════════════════════════════════════════════ */}
      {chairModal && (
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
                {chairModal.mode === 'add' ? '+ Add New Chair' : `Edit ${chairModal.chair?.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setChairModal(null)}
                style={{ color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChair}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Chair Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chair 5"
                  value={chairForm.name}
                  onChange={(e) => setChairForm({ ...chairForm, name: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Section
                  </label>
                  <select
                    value={chairForm.section}
                    onChange={(e) => setChairForm({ ...chairForm, section: e.target.value })}
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
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={chairForm.sortOrder}
                    onChange={(e) => setChairForm({ ...chairForm, sortOrder: Number(e.target.value) || 1 })}
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

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#FFF' }}>
                  <input
                    type="checkbox"
                    checked={chairForm.active}
                    onChange={(e) => setChairForm({ ...chairForm, active: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Workstation Active for POS Billing</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setChairModal(null)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingChair}
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  {savingChair ? 'Saving...' : 'Save Chair'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
