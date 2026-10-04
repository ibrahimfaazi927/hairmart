'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StaffProfile {
  id: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  section?: string;
  chair?: {
    id: string;
    name: string;
    section: string;
  } | null;
}

interface TodayAttendance {
  id?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  duration?: string | null;
  status?: string;
  notes?: string | null;
}

interface HistoryItem {
  id: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  duration?: string | null;
  status: string;
}

export default function StaffAttendanceTerminalPage() {
  const [activeStaffList, setActiveStaffList] = useState<StaffProfile[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load active staff roster
  useEffect(() => {
    loadStaffRoster();
  }, []);

  // When staff is selected, load today's attendance & history
  useEffect(() => {
    if (selectedStaff) {
      loadStaffAttendance(selectedStaff.id);
      // Persist in localStorage for tablet convenience
      try {
        localStorage.setItem('hairmart_staff_id', selectedStaff.id);
      } catch (e) {}
    }
  }, [selectedStaff]);

  const loadStaffRoster = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff?status=active');
      if (res.ok) {
        const data = await res.json();
        setActiveStaffList(data);

        // Check if there was a remembered staff
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('hairmart_staff_id') : null;
        if (savedId) {
          const matched = data.find((s: StaffProfile) => s.id === savedId);
          if (matched) {
            setSelectedStaff(matched);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffAttendance = async (staffId: string) => {
    try {
      const res = await fetch(`/api/staff/attendance?staffId=${staffId}`);
      if (res.ok) {
        const data = await res.json();
        const records: HistoryItem[] = data.attendances || [];
        setHistory(records.slice(0, 10));

        // Find today's record
        const todayStr = new Date().toISOString().split('T')[0];
        const matchToday = records.find((r) => r.date.startsWith(todayStr));
        if (matchToday) {
          setTodayAttendance({
            id: matchToday.id,
            checkIn: matchToday.checkIn,
            checkOut: matchToday.checkOut,
            duration: matchToday.duration,
            status: matchToday.status,
            notes: (matchToday as any).notes || null,
          });
        } else {
          setTodayAttendance({
            checkIn: null,
            checkOut: null,
            duration: null,
            status: 'Not Marked',
          });
        }
      }
    } catch (e) {
      console.error('Failed to load attendance:', e);
    }
  };

  const handleWalkIn = async () => {
    if (!selectedStaff) return;
    setActionLoading(true);
    setNotice(null);
    try {
      const res = await fetch('/api/staff/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: selectedStaff.id }),
      });
      const data = await res.json();

      if (res.ok) {
        setNotice({ type: 'success', text: data.message || 'Walk In recorded successfully!' });
        loadStaffAttendance(selectedStaff.id);
      } else {
        setNotice({ type: 'error', text: data.error || 'Failed to record Walk In' });
      }
    } catch (e) {
      console.error(e);
      setNotice({ type: 'error', text: 'Network connection error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWalkOut = async () => {
    if (!selectedStaff) return;
    setActionLoading(true);
    setNotice(null);
    try {
      const res = await fetch('/api/staff/walk-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: selectedStaff.id }),
      });
      const data = await res.json();

      if (res.ok) {
        setNotice({ type: 'success', text: data.message || 'Walk Out recorded successfully!' });
        loadStaffAttendance(selectedStaff.id);
      } else {
        setNotice({ type: 'error', text: data.error || 'Failed to record Walk Out' });
      }
    } catch (e) {
      console.error(e);
      setNotice({ type: 'error', text: 'Network connection error' });
    } finally {
      setActionLoading(false);
    }
  };
  // Multi-session attendance states (supports lunch breaks & multi-session shifts)
  const hasStartedToday = Boolean(todayAttendance && todayAttendance.checkIn);
  const isCurrentlyWorking = Boolean(todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut);
  const isWalkedOutBreak = Boolean(todayAttendance && todayAttendance.checkIn && todayAttendance.checkOut);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07090E',
        color: '#FFFFFF',
        padding: '24px 16px 60px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '680px' }}>
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--gold-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HAIR MART UNISEX SALON
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0 0', color: '#FFF' }}>
              Staff Attendance Terminal
            </h1>
          </div>

          <Link
            href="/admin"
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Admin Panel →
          </Link>
        </div>

        {/* Live Clock Card */}
        <div
          style={{
            background: '#0D111A',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CURRENT DATE &amp; TIME
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFF', marginTop: '2px' }}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gold-400)', fontVariantNumeric: 'tabular-nums' }}>
            {currentTimeStr || '00:00:00 AM'}
          </div>
        </div>

        {/* Notice alert */}
        {notice && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '13px',
              fontWeight: 600,
              background: notice.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: notice.type === 'success' ? '1px solid #22C55E' : '1px solid #EF4444',
              color: notice.type === 'success' ? '#4ADE80' : '#F87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Screen A: Staff Selection (Login) ── */}
        {!selectedStaff ? (
          <div
            style={{
              background: '#0E121B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', marginBottom: '6px' }}>
              Select Your Profile to Mark Attendance
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Tap on your name to access your Walk-In / Walk-Out dashboard for today.
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                Loading staff team...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {activeStaffList.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStaff(s)}
                    style={{
                      background: '#121723',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F6C926, #B38F24)',
                        color: '#0A0D14',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {s.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.role}</div>
                      {s.chair && (
                        <div style={{ fontSize: '11px', color: 'var(--gold-400)', marginTop: '2px' }}>
                          🪑 {s.chair.name} ({s.chair.section === 'men' ? "Men's" : "Women's"})
                        </div>
                      )}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Screen B: Logged-in Staff Attendance Terminal ── */
          <div>
            {/* Active Staff Card */}
            <div
              style={{
                background: '#0E121B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F6C926, #B38F24)',
                    color: '#0A0D14',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 800,
                    border: '2px solid var(--gold-400)',
                  }}
                >
                  {selectedStaff.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>{selectedStaff.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gold-400)', fontWeight: 600 }}>
                    {selectedStaff.role} •{' '}
                    <span style={{ color: selectedStaff.chair ? '#60A5FA' : 'var(--text-muted)' }}>
                      {selectedStaff.chair ? `🪑 ${selectedStaff.chair.name} (${selectedStaff.chair.section})` : 'No Chair Assigned'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedStaff(null);
                  try {
                    localStorage.removeItem('hairmart_staff_id');
                  } catch (e) {}
                }}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '12px' }}
              >
                Switch Staff
              </button>
            </div>

            {/* Shift Status Banner */}
            <div
              style={{
                background: isCurrentlyWorking
                  ? 'rgba(34, 197, 94, 0.12)'
                  : isWalkedOutBreak
                  ? 'rgba(234, 179, 8, 0.12)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: isCurrentlyWorking
                  ? '1.5px solid rgba(34, 197, 94, 0.4)'
                  : isWalkedOutBreak
                  ? '1.5px solid rgba(234, 179, 8, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '24px',
                marginBottom: '22px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: isCurrentlyWorking ? '#4ADE80' : isWalkedOutBreak ? '#FACC15' : 'var(--text-muted)',
                }}
              >
                TODAY'S SHIFT STATUS
              </div>

              <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFF', margin: '6px 0 10px 0' }}>
                {isCurrentlyWorking
                  ? '🟢 Currently on Duty (Present)'
                  : isWalkedOutBreak
                  ? '☕ Walked Out / On Lunch Break'
                  : '⏳ Not Walked In Yet'}
              </div>

              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                  First Walk In:{' '}
                  <b style={{ color: hasStartedToday ? '#4ADE80' : 'var(--text-muted)' }}>
                    {todayAttendance?.checkIn || '—'}
                  </b>
                </div>
                <div>
                  Latest Walk Out:{' '}
                  <b style={{ color: isWalkedOutBreak ? '#FACC15' : 'var(--text-muted)' }}>
                    {todayAttendance?.checkOut || (isCurrentlyWorking ? 'Working Now' : '—')}
                  </b>
                </div>
                {todayAttendance?.duration && (
                  <div>
                    Working Duration:{' '}
                    <b style={{ color: 'var(--gold-400)' }}>{todayAttendance.duration}</b>
                  </div>
                )}
              </div>

              {/* Multi-session breakdown note if available */}
              {todayAttendance?.notes && todayAttendance.notes.includes('Session') && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  📋 <b>Shift Log:</b> {todayAttendance.notes}
                </div>
              )}
            </div>

            {/* ── The Two Big Touch-Friendly Action Buttons ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              {/* [ WALK IN ] BUTTON */}
              <button
                type="button"
                disabled={isCurrentlyWorking || actionLoading}
                onClick={handleWalkIn}
                style={{
                  background: isCurrentlyWorking
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                  border: isCurrentlyWorking ? '1px solid rgba(255,255,255,0.08)' : '2px solid #22C55E',
                  borderRadius: '14px',
                  padding: '24px 16px',
                  cursor: isCurrentlyWorking || actionLoading ? 'not-allowed' : 'pointer',
                  opacity: isCurrentlyWorking ? 0.45 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: isCurrentlyWorking ? 'none' : '0 6px 20px rgba(34, 197, 94, 0.3)',
                }}
              >
                <span style={{ fontSize: '32px' }}>🟢</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: isCurrentlyWorking ? 'var(--text-muted)' : '#FFFFFF' }}>
                  {isWalkedOutBreak ? 'WALK IN (Return)' : 'WALK IN'}
                </span>
                <span style={{ fontSize: '11.5px', color: isCurrentlyWorking ? 'var(--text-muted)' : '#DCFCE7', textAlign: 'center' }}>
                  {isCurrentlyWorking
                    ? 'Already clocked in on duty'
                    : isWalkedOutBreak
                    ? 'Return from lunch / resume shift'
                    : 'Record shift arrival time'}
                </span>
              </button>

              {/* [ WALK OUT ] BUTTON */}
              <button
                type="button"
                disabled={!isCurrentlyWorking || actionLoading}
                onClick={handleWalkOut}
                style={{
                  background: !isCurrentlyWorking
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
                  border: !isCurrentlyWorking ? '1px solid rgba(255,255,255,0.08)' : '2px solid #EF4444',
                  borderRadius: '14px',
                  padding: '24px 16px',
                  cursor: !isCurrentlyWorking || actionLoading ? 'not-allowed' : 'pointer',
                  opacity: !isCurrentlyWorking ? 0.45 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: !isCurrentlyWorking ? 'none' : '0 6px 20px rgba(239, 68, 68, 0.3)',
                }}
              >
                <span style={{ fontSize: '32px' }}>🔴</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: !isCurrentlyWorking ? 'var(--text-muted)' : '#FFFFFF' }}>
                  WALK OUT
                </span>
                <span style={{ fontSize: '11.5px', color: !isCurrentlyWorking ? 'var(--text-muted)' : '#FEE2E2', textAlign: 'center' }}>
                  {!hasStartedToday
                    ? 'Disabled: Walk In first'
                    : isWalkedOutBreak
                    ? `Walked out at ${todayAttendance?.checkOut}`
                    : 'Lunch break or shift departure'}
                </span>
              </button>
            </div>

            {/* Attendance Rules Box */}
            <div
              style={{
                background: '#0D111A',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '28px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              <div style={{ color: 'var(--gold-400)', fontWeight: 700, marginBottom: '4px' }}>
                📌 Automatic Time-Capture Policy:
              </div>
              • Clicking <b>[ WALK IN ]</b> automatically records your exact check-in time from the system clock.<br />
              • Clicking <b>[ WALK OUT ]</b> automatically records your exact check-out time and computes your working hours.<br />
              • Manual time typing is prohibited. Only salon administration may adjust records if an error occurs.
            </div>

            {/* Staff Attendance History Table */}
            <div
              style={{
                background: '#0E121B',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#FFF', margin: '0 0 14px 0' }}>
                Your Recent Attendance Logs
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px' }}>Date</th>
                      <th style={{ padding: '8px 10px' }}>Walk In</th>
                      <th style={{ padding: '8px 10px' }}>Walk Out</th>
                      <th style={{ padding: '8px 10px' }}>Duration</th>
                      <th style={{ padding: '8px 10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No past records found for this account.
                        </td>
                      </tr>
                    ) : (
                      history.map((h) => (
                        <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px 10px', color: '#FFF', fontWeight: 600 }}>
                            {new Date(h.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              weekday: 'short',
                            })}
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                            {h.checkIn || '—'}
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                            {h.checkOut || '—'}
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--gold-400)', fontWeight: 600 }}>
                            {h.duration || '—'}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                background:
                                  h.status === 'Present'
                                    ? 'rgba(34,197,94,0.15)'
                                    : h.status === 'Absent'
                                    ? 'rgba(239,68,68,0.15)'
                                    : 'rgba(212,175,55,0.15)',
                                color:
                                  h.status === 'Present'
                                    ? '#4ADE80'
                                    : h.status === 'Absent'
                                    ? '#F87171'
                                    : 'var(--gold-400)',
                              }}
                            >
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
