'use client';

import { useState, useEffect } from 'react';
import {
  printVia58mmWindow,
  connectEzoBluetooth,
  connectEzoSerial,
  sendRawBytesToPrinter,
  generateTestSlipBytes,
} from '@/lib/thermalPrinter';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    salon_name: 'Hair Mart Unisex Salon',
    salon_tagline: 'Where Style Meets Perfection',
    salon_phone: '+91 0824-4060938',
    salon_whatsapp: '+91 9148506215',
    salon_email: 'admin@hairmart.com',
    salon_address: 'Surathkal, Mangalore, Karnataka',
    salon_hours: 'Mon-Sat: 9:30 AM - 9:00 PM | Sun: 10:00 AM - 8:30 PM',
    salon_maps_link: '',
    display_prices_public: 'false',
    receipt_title: 'HAIR MART UNISEX SALON - SURATHKAL',
    receipt_footer: 'Thank you for visiting HairMart! Keep looking good, always.',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Admin Credential Management State (Default ID: Sameer)
  const [credForm, setCredForm] = useState({
    name: 'Sameer',
    email: 'Sameer',
    currentPassword: '',
    newPassword: '',
  });
  const [credUpdating, setCredUpdating] = useState(false);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hairmart_admin_auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCredForm((prev: typeof credForm) => ({
            ...prev,
            name: parsed.name || 'Sameer',
            email: parsed.email || 'Sameer',
          }));
        } catch {}
      }
    }
  }, []);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredUpdating(true);
    setCredSuccess(null);
    setCredError(null);

    try {
      const res = await fetch('/api/auth/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newName: credForm.name,
          newEmail: credForm.email,
          currentPassword: credForm.currentPassword,
          newPassword: credForm.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCredSuccess('Admin login ID and password updated successfully!');
        setCredForm((prev: typeof credForm) => ({ ...prev, currentPassword: '', newPassword: '' }));
        if (typeof window !== 'undefined' && data.user) {
          localStorage.setItem('hairmart_admin_auth', JSON.stringify(data.user));
        }
        setTimeout(() => setCredSuccess(null), 4000);
      } else {
        setCredError(data.error || 'Failed to update admin credentials');
      }
    } catch (err: any) {
      setCredError(err.message || 'Error updating credentials');
    } finally {
      setCredUpdating(false);
    }
  };

  // EZO 58mm Printer State
  const [printerStatus, setPrinterStatus] = useState<'ready' | 'connecting' | 'connected' | 'printing' | 'error'>('ready');
  const [printerDeviceName, setPrinterDeviceName] = useState<string>('EZO 58mm Portable');
  const [printerDeviceAddress, setPrinterDeviceAddress] = useState<string | null>(null);
  const [connectingPrinter, setConnectingPrinter] = useState(false);
  const [printerNotice, setPrinterNotice] = useState<string | null>(null);
  const [isAndroidNative, setIsAndroidNative] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [pairedDevices, setPairedDevices] = useState<Array<{ name: string; address: string; isPrinter: boolean }>>([]);

  // Detect platform on mount
  useEffect(() => {
    async function detectPlatform() {
      try {
        const bt = await import('@/lib/bluetoothPrinter');
        if (bt.isNativeBluetoothAvailable()) {
          setIsAndroidNative(true);
          // Auto-reconnect to saved printer
          const saved = bt.getSavedPrinterAddress();
          if (saved) {
            const status = await bt.getPrinterStatus();
            if (status.status === 'connected') {
              setPrinterStatus('connected');
              setPrinterDeviceName(status.deviceName || saved.name);
              setPrinterDeviceAddress(status.deviceAddress || saved.address);
            }
          }
        }
      } catch {
        // Not on Android or module unavailable
      }
    }
    detectPlatform();
  }, []);

  // Connect EZO via Bluetooth (platform-aware)
  const handleConnectBluetooth = async () => {
    setConnectingPrinter(true);
    setPrinterNotice(null);
    setPrinterStatus('connecting');

    if (isAndroidNative) {
      // ── Native Android Bluetooth (Capacitor Plugin) ──
      try {
        const bt = await import('@/lib/bluetoothPrinter');

        // Check Bluetooth availability
        const avail = await bt.checkBluetoothAvailability();
        if (!avail.available) {
          setPrinterNotice('Bluetooth is not available on this device.');
          setPrinterStatus('error');
          setConnectingPrinter(false);
          return;
        }
        if (!avail.enabled) {
          setPrinterNotice('Bluetooth is turned OFF. Please enable Bluetooth in tablet settings and try again.');
          setPrinterStatus('error');
          setConnectingPrinter(false);
          return;
        }
        if (!avail.hasPermission) {
          const perm = await bt.requestBluetoothPermissions();
          if (!perm.granted) {
            setPrinterNotice('Bluetooth permission denied. Please allow Bluetooth access in app settings.');
            setPrinterStatus('error');
            setConnectingPrinter(false);
            return;
          }
        }

        // List paired devices
        const listResult = await bt.listBluetoothPrinters();
        if (!listResult.success || listResult.devices.length === 0) {
          setPrinterNotice('No paired Bluetooth printers found. Please pair your EZO printer in Android Bluetooth Settings first.');
          setPrinterStatus('error');
          setConnectingPrinter(false);
          return;
        }

        // Check if only one likely printer — auto-connect
        const printers = listResult.devices.filter((d) => d.isPrinter);
        if (printers.length === 1) {
          const printer = printers[0];
          const connResult = await bt.connectBluetoothPrinter(printer.address);
          if (connResult.success) {
            setPrinterStatus('connected');
            setPrinterDeviceName(connResult.deviceName || printer.name);
            setPrinterDeviceAddress(printer.address);
            bt.savePrinterAddress(printer.address, printer.name);
            setPrinterNotice(`✓ Connected to ${connResult.deviceName || printer.name}`);
          } else {
            setPrinterNotice(connResult.error || 'Could not connect to EZO printer.');
            setPrinterStatus('error');
          }
        } else {
          // Multiple devices — show picker
          setPairedDevices(listResult.devices);
          setShowDevicePicker(true);
          setPrinterStatus('ready');
        }
      } catch (e: any) {
        setPrinterNotice(e.message || 'Native Bluetooth connection error');
        setPrinterStatus('error');
      }
    } else {
      // ── Web Bluetooth (Chrome/Edge desktop/laptop) ──
      try {
        const res = await connectEzoBluetooth();
        if (res.success) {
          setPrinterStatus('connected');
          setPrinterDeviceName(res.deviceName || 'EZO 58mm (Bluetooth)');
          setPrinterNotice(`✓ Connected to ${res.deviceName || 'EZO Bluetooth'}`);
        } else {
          setPrinterNotice(res.error || 'Bluetooth pairing cancelled');
          setPrinterStatus('ready');
        }
      } catch (e: any) {
        setPrinterNotice(e.message || 'Bluetooth connection failed');
        setPrinterStatus('error');
      }
    }
    setConnectingPrinter(false);
  };

  // Connect to a specific paired device (from picker)
  const handleSelectDevice = async (device: { name: string; address: string }) => {
    setShowDevicePicker(false);
    setConnectingPrinter(true);
    setPrinterStatus('connecting');
    setPrinterNotice(null);
    try {
      const bt = await import('@/lib/bluetoothPrinter');
      const connResult = await bt.connectBluetoothPrinter(device.address);
      if (connResult.success) {
        setPrinterStatus('connected');
        setPrinterDeviceName(connResult.deviceName || device.name);
        setPrinterDeviceAddress(device.address);
        bt.savePrinterAddress(device.address, device.name);
        setPrinterNotice(`✓ Connected to ${connResult.deviceName || device.name}`);
      } else {
        setPrinterNotice(connResult.error || 'Could not connect to printer.');
        setPrinterStatus('error');
      }
    } catch (e: any) {
      setPrinterNotice(e.message || 'Connection failed');
      setPrinterStatus('error');
    }
    setConnectingPrinter(false);
  };

  // Disconnect printer
  const handleDisconnect = async () => {
    if (isAndroidNative) {
      try {
        const bt = await import('@/lib/bluetoothPrinter');
        await bt.disconnectBluetoothPrinter();
        bt.clearSavedPrinterAddress();
      } catch {}
    }
    setPrinterStatus('ready');
    setPrinterDeviceName('EZO 58mm Portable');
    setPrinterDeviceAddress(null);
    setPrinterNotice('Printer disconnected.');
  };

  // Connect EZO via USB Serial (web only)
  const handleConnectUSB = async () => {
    setConnectingPrinter(true);
    setPrinterNotice(null);
    try {
      const res = await connectEzoSerial();
      if (res.success) {
        setPrinterStatus('connected');
        setPrinterDeviceName('EZO 58mm (USB Serial)');
        setPrinterNotice('✓ Connected via USB Serial Cable!');
      } else {
        setPrinterNotice(res.error || 'USB Serial connection failed');
      }
    } catch (e: any) {
      setPrinterNotice(e.message || 'Serial connection failed');
    } finally {
      setConnectingPrinter(false);
    }
  };

  const handleTest58mm = async () => {
    if (printerStatus === 'connected' && isAndroidNative) {
      // Native Android test print
      setPrinterStatus('printing');
      setPrinterNotice(null);
      try {
        const bt = await import('@/lib/bluetoothPrinter');
        const result = await bt.testPrint();
        if (result.success) {
          setPrinterNotice('✓ Test receipt printed on EZO printer!');
        } else {
          setPrinterNotice(result.error || 'Test print failed. Please check printer.');
        }
      } catch (e: any) {
        setPrinterNotice(e.message || 'Test print error');
      }
      setPrinterStatus('connected');
      return;
    }

    // Web fallback
    try {
      if (printerStatus === 'connected') {
        const testBytes = generateTestSlipBytes();
        const sent = await sendRawBytesToPrinter(testBytes);
        if (sent) {
          setPrinterNotice('✓ Test slip printed via hardware connection!');
          return;
        }
      }
    } catch (e) {
      console.warn('Hardware test print fallback to print window:', e);
    }

    // Fallback to 58mm print dialog
    const now = new Date();
    printVia58mmWindow({
      billNo: 'HM-EZO-58MM-TEST',
      date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: 'Test Client',
      customerPhone: '9148506215',
      items: [
        { name: 'Hair Cut (Men)', quantity: 1, price: 200 },
        { name: 'Beard Grooming', quantity: 1, price: 150 },
      ],
      subtotal: 350,
      discount: 50,
      total: 300,
      paymentMethod: 'CASH',
      notes: 'Diagnostic print OK.',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="heading-md" style={{ color: '#FFFFFF' }}>Salon Settings &amp; Branding</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Customize your salon profile, contact channels, physical EZO printer, and admin login credentials.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="card mb-6" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: '#22C55E', color: '#4ADE80' }}>
          ✓ Salon settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
          
          {/* 1. Salon Identity & Contact */}
          <div className="card-premium">
            <h2 className="heading-xs mb-4" style={{ color: '#FFFFFF' }}>Salon Identity &amp; Contact</h2>

            <div className="form-group">
              <label className="form-label">Salon Business Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.salon_name || ''}
                onChange={(e) => setSettings({ ...settings, salon_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline / Headline</label>
              <input
                type="text"
                className="form-input"
                value={settings.salon_tagline || ''}
                onChange={(e) => setSettings({ ...settings, salon_tagline: e.target.value })}
              />
            </div>

            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.salon_phone || ''}
                  onChange={(e) => setSettings({ ...settings, salon_phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.salon_whatsapp || ''}
                  onChange={(e) => setSettings({ ...settings, salon_whatsapp: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="text"
                className="form-input"
                value={settings.salon_email || ''}
                onChange={(e) => setSettings({ ...settings, salon_email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salon Address</label>
              <textarea
                rows={2}
                className="form-input form-textarea"
                value={settings.salon_address || ''}
                onChange={(e) => setSettings({ ...settings, salon_address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Working Hours</label>
              <input
                type="text"
                className="form-input"
                value={settings.salon_hours || ''}
                onChange={(e) => setSettings({ ...settings, salon_hours: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '16px', background: 'rgba(246, 201, 38, 0.08)', border: '1px solid rgba(246, 201, 38, 0.25)', borderRadius: '8px', padding: '12px' }}>
              <span style={{ fontSize: '11.5px', color: '#F6C926', lineHeight: '1.5', display: 'block' }}>
                🔒 <strong>Zero Public Prices Rule Enforced</strong>: Customer-facing service and package pages do not display prices. Prices exist strictly internally for admin invoices and billing.
              </span>
            </div>
          </div>

          {/* 2. Physical Thermal Printer Hardware Settings */}
          <div className="card-premium">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="heading-xs" style={{ margin: 0, color: '#FFFFFF' }}>
                🖨️ Physical Thermal Printer (EZO)
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  color:
                    printerStatus === 'connected'
                      ? '#4ADE80'
                      : printerStatus === 'connecting'
                      ? '#60A5FA'
                      : printerStatus === 'printing'
                      ? '#FBBF24'
                      : printerStatus === 'error'
                      ? '#F87171'
                      : '#94A3B8',
                  background:
                    printerStatus === 'connected'
                      ? 'rgba(34,197,94,0.15)'
                      : printerStatus === 'connecting'
                      ? 'rgba(59,130,246,0.15)'
                      : printerStatus === 'printing'
                      ? 'rgba(245,158,11,0.15)'
                      : printerStatus === 'error'
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(148,163,184,0.12)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontWeight: 700,
                }}
              >
                ● {printerStatus === 'connected'
                  ? `Connected (${printerDeviceName})`
                  : printerStatus === 'connecting'
                  ? 'Connecting...'
                  : printerStatus === 'printing'
                  ? 'Printing...'
                  : printerStatus === 'error'
                  ? 'Connection Error'
                  : 'Ready / Fallback'}
              </span>
            </div>

            {printerNotice && (
              <div
                style={{
                  background: printerNotice.includes('✓') || printerNotice.includes('Connected') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(246, 201, 38, 0.15)',
                  border: printerNotice.includes('✓') || printerNotice.includes('Connected') ? '1px solid #22C55E' : '1px solid #F6C926',
                  color: printerNotice.includes('✓') || printerNotice.includes('Connected') ? '#4ADE80' : '#F6C926',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  marginBottom: '14px',
                }}
              >
                {printerNotice}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Receipt Printer Hardware</label>
              <input
                type="text"
                className="form-input"
                readOnly
                value={printerDeviceAddress ? `${printerDeviceName} (${printerDeviceAddress})` : printerDeviceName}
                style={{ opacity: 0.85 }}
              />
            </div>

            {/* Hardware Connect Buttons */}
            <div className="grid grid-2 gap-3" style={{ marginBottom: '16px' }}>
              {printerStatus === 'connected' ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="btn btn-outline btn-sm"
                  style={{
                    borderColor: '#EF4444',
                    color: '#F87171',
                    background: 'rgba(239,68,68,0.08)',
                    padding: '9px 12px',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                >
                  🔴 Disconnect Printer
                </button>
              ) : (
                <button
                  type="button"
                  disabled={connectingPrinter}
                  onClick={handleConnectBluetooth}
                  className="btn btn-outline btn-sm"
                  style={{
                    borderColor: '#3B82F6',
                    color: '#60A5FA',
                    background: 'rgba(59,130,246,0.08)',
                    padding: '9px 12px',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                >
                  🔵 {connectingPrinter ? 'Pairing...' : isAndroidNative ? 'Connect EZO Bluetooth' : 'Pair Bluetooth (EZO)'}
                </button>
              )}

              <button
                type="button"
                disabled={connectingPrinter}
                onClick={handleConnectUSB}
                className="btn btn-outline btn-sm"
                style={{
                  borderColor: '#F59E0B',
                  color: '#FBBF24',
                  background: 'rgba(245,158,11,0.08)',
                  padding: '9px 12px',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                🔌 Connect USB Cable
              </button>
            </div>

            {/* Quick Bluetooth Connection Instructions */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '16px',
                fontSize: '11.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <b style={{ color: '#F6C926' }}>📱 How to Connect Bluetooth EZO:</b>
              <ol style={{ paddingLeft: '16px', marginTop: '4px', listStyleType: 'decimal' }}>
                <li>Turn ON your EZO portable printer (Bluetooth light blinking).</li>
                <li>In Chrome/Edge on your laptop or phone, click <b>&ldquo;Pair Bluetooth (EZO)&rdquo;</b> above.</li>
                <li>Select your <b>EZO / POS-58 / MPT-II</b> printer in the browser popup and tap <b>Pair</b>.</li>
                <li>(If prompted for a PIN in Windows, use <b>0000</b> or <b>1234</b>).</li>
              </ol>
            </div>

            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Paper Roll Format</label>
                <select className="form-input form-select" defaultValue="58mm">
                  <option value="58mm">58mm Standard Thermal Roll</option>
                  <option value="80mm">80mm Wide Thermal Roll</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Interface Protocol</label>
                <select className="form-input form-select" defaultValue="escpos">
                  <option value="escpos">ESC/POS Thermal Protocol</option>
                  <option value="raw">Raw Text / USB Virtual COM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Thermal Receipt Salon Title</label>
              <input
                type="text"
                className="form-input"
                value={settings.receipt_title || 'HAIR MART UNISEX SALON - SURATHKAL'}
                onChange={(e) => setSettings({ ...settings, receipt_title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Thermal Receipt Footer Message</label>
              <input
                type="text"
                className="form-input"
                value={settings.receipt_footer || 'Thank you for visiting HairMart! Keep looking good, always.'}
                onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm w-full"
                onClick={handleTest58mm}
                style={{ borderColor: 'var(--gold-400)', color: 'var(--gold-400)', fontWeight: 600, padding: '10px' }}
              >
                🖨️ Test EZO Thermal Print (58mm)
              </button>
            </div>
          </div>

          {/* 3. Admin Login Credentials & Security Card (With full Edit Option) */}
          <div className="card-premium" style={{ border: '1px solid rgba(246, 201, 38, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 className="heading-xs" style={{ margin: 0, color: '#FFFFFF' }}>
                🔐 Admin Login &amp; Security Credentials
              </h2>
              <span style={{ fontSize: '11px', color: '#F6C926', background: 'rgba(246, 201, 38, 0.12)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Role: Master Admin
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Manage your master admin identity and credentials. You can update your Login ID / Username and password anytime below.
            </p>

            {credSuccess && (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22C55E', color: '#4ADE80', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
                ✓ {credSuccess}
              </div>
            )}

            {credError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#F87171', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
                ⚠️ {credError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Admin Display Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sameer"
                value={credForm.name}
                onChange={(e) => setCredForm({ ...credForm, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Login ID / Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sameer"
                value={credForm.email}
                onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                This is the ID you enter on the login screen. Default: <b style={{ color: '#F6C926' }}>Sameer</b>
              </span>
            </div>

            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Current Password (if changing pass)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="e.g. Sameer@123"
                  value={credForm.currentPassword}
                  onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Optional)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 6 chars"
                  value={credForm.newPassword}
                  onChange={(e) => setCredForm({ ...credForm, newPassword: e.target.value })}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={credUpdating}
              onClick={handleUpdateCredentials}
              className="btn btn-outline btn-sm w-full"
              style={{
                marginTop: '12px',
                padding: '11px',
                borderColor: '#F6C926',
                color: '#F6C926',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              {credUpdating ? 'Updating Credentials...' : '💾 Save Admin Login Credentials'}
            </button>
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ padding: '12px 28px', fontWeight: 700 }}>
            {saving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </div>
      </form>

      {/* Paired Bluetooth Device Picker Modal */}
      {showDevicePicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#141824',
              border: '1px solid rgba(246, 201, 38, 0.3)',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                Select Bluetooth Printer
              </h3>
              <button
                type="button"
                onClick={() => setShowDevicePicker(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Choose your paired EZO / 58mm thermal printer from the devices below:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {pairedDevices.map((device) => (
                <button
                  key={device.address}
                  type="button"
                  onClick={() => handleSelectDevice(device)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: device.isPrinter ? 'rgba(246, 201, 38, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                    border: device.isPrinter ? '1px solid rgba(246, 201, 38, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {device.name} {device.isPrinter && <span style={{ color: '#F6C926', fontSize: '11px', fontWeight: 700 }}>★ PRINTER</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {device.address}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#F6C926', fontWeight: 600 }}>Connect &rarr;</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDevicePicker(false)}
                className="btn btn-outline btn-sm"
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
