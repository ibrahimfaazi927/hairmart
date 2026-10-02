'use client';

import { useState, useEffect } from 'react';

export default function AdminWhatsAppPage() {
  const [activeTab, setActiveTab] = useState<'reminders' | 'rules' | 'logs'>('reminders');
  const [settings, setSettings] = useState<any>({
    whatsapp_enabled: 'false',
    whatsapp_api_provider: 'meta_cloud',
    whatsapp_api_phone_id: '',
    whatsapp_api_token: '',
    whatsapp_auto_bill: 'true',
    whatsapp_auto_reminder: 'true',
    whatsapp_followup_days: '18',
  });
  const [dueData, setDueData] = useState<any>({ totalDue: 0, dueCustomers: [] });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [settingsRes, remindersRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/whatsapp/reminders'),
      ]);

      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings((prev: any) => ({ ...prev, ...s }));
      }
      if (remindersRes.ok) {
        const d = await remindersRes.json();
        setDueData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setNotice('WhatsApp automation preferences saved successfully!');
      setTimeout(() => setNotice(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerAllReminders = async () => {
    setTriggerLoading(true);
    try {
      const res = await fetch('/api/whatsapp/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setNotice(`Successfully processed and dispatched ${data.processed} recurring grooming reminders!`);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleSendSingleReminderWhatsApp = (customer: any) => {
    const cleanPhone = customer.phone.replace(/\D/g, '').slice(-10);
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(customer.reminderPreview)}`, '_blank');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="heading-md">WhatsApp Automations &amp; CRM</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Automated instant payment receipts, digital invoices, and 15–20 days recurring grooming retention reminders.
          </p>
        </div>
      </div>

      {notice && (
        <div className="card mb-6" style={{ background: 'rgba(37, 211, 102, 0.15)', borderColor: 'var(--whatsapp)', color: '#25D366' }}>
          ✓ {notice}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs mb-6">
        <button
          className={`tab ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          ⏰ 15–20 Day Due Reminders ({dueData.totalDue || 0})
        </button>
        <button
          className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          ⚙️ Automation Triggers &amp; Timing
        </button>
      </div>

      {/* Reminders Tab */}
      {activeTab === 'reminders' && (
        <div>
          <div className="card-premium mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="heading-xs" style={{ marginBottom: '4px' }}>
                Recurring Client Grooming Queue
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Identifies clients whose last salon visit was <strong>15 to 25 days ago</strong> for personalized haircut/spa follow-ups.
              </p>
            </div>
            <button
              className="btn btn-primary"
              disabled={triggerLoading || dueData.totalDue === 0}
              onClick={handleTriggerAllReminders}
            >
              {triggerLoading ? 'Dispatching...' : `🚀 Dispatch All ${dueData.totalDue} Reminders`}
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone / WhatsApp</th>
                  <th>Last Visit</th>
                  <th>Days Ago</th>
                  <th>Last Services</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                      Scanning customer retention database...
                    </td>
                  </tr>
                ) : dueData.dueCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                      🎉 No clients currently due for a 15–20 day reminder. Check back as new visits accumulate!
                    </td>
                  </tr>
                ) : (
                  dueData.dueCustomers.map((c: any) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>{c.phone}</td>
                      <td>{new Date(c.lastVisit).toLocaleDateString()}</td>
                      <td>
                        <span className="badge badge-gold">
                          {c.daysSinceLastVisit} days
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          {c.lastServices.join(', ') || 'General Grooming'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-whatsapp btn-sm"
                          onClick={() => handleSendSingleReminderWhatsApp(c)}
                        >
                          💬 Send WhatsApp Reminder
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rules & Settings Tab */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveSettings}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Automatic Trigger Rules */}
            <div className="card-premium">
              <h2 className="heading-xs mb-4">Automated Trigger Rules</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: 'var(--gold-300)' }}>
                  ⚠️ <strong>Consent-First Rule:</strong> Digital bills are never sent automatically without staff or customer confirmation. Bill dispatch is governed independently on each POS bill screen via the [ ON/OFF ] Send WhatsApp Bill toggle.
                </div>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.whatsapp_auto_reminder === 'true'}
                    onChange={(e) => setSettings({ ...settings, whatsapp_auto_reminder: e.target.checked ? 'true' : 'false' })}
                  />
                  <div>
                    <strong>Haircut &amp; Spa Follow-up (15–20 Days)</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Automatically invite clients back for haircut/spa touch-ups based on the configured interval.
                    </p>
                  </div>
                </label>

                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                  />
                  <div>
                    <strong>Beard Trim &amp; Shape Reminder (10–14 Days)</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Personalized reminder queue for beard grooming and clean shaves.
                    </p>
                  </div>
                </label>
              </div>

              <div className="form-group mt-6">
                <label className="form-label">Haircut Touch-up Interval</label>
                <select
                  className="form-input"
                  value={settings.whatsapp_followup_days}
                  onChange={(e) => setSettings({ ...settings, whatsapp_followup_days: e.target.value })}
                >
                  <option value="15">15 Days (Frequent Grooming)</option>
                  <option value="18">18 Days (Standard Recommendation)</option>
                  <option value="20">20 Days (Classic Follow-up)</option>
                  <option value="25">25 Days (Monthly Touch-up)</option>
                </select>
              </div>
            </div>

            {/* Meta Cloud API Integration Credentials */}
            <div className="card-premium">
              <h2 className="heading-xs mb-4">Meta WhatsApp Business API</h2>

              <div className="form-group">
                <label className="form-label">WhatsApp Cloud Dispatch Enabled</label>
                <select
                  className="form-input"
                  value={settings.whatsapp_enabled}
                  onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.value })}
                >
                  <option value="false">Manual WhatsApp Web Mode (Click-to-Chat)</option>
                  <option value="true">Direct Cloud API Automated Dispatch</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Phone Number ID</label>
                <input
                  type="text"
                  placeholder="e.g. 104829104928"
                  className="form-input"
                  value={settings.whatsapp_api_phone_id || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_api_phone_id: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Permanent Access Token</label>
                <input
                  type="password"
                  placeholder="Bearer token from Meta Developer Portal"
                  className="form-input"
                  value={settings.whatsapp_api_token || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_api_token: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary w-full mt-4"
              >
                {saving ? 'Saving...' : 'Save Automation Preferences'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
