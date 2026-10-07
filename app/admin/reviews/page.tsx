'use client';

import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { generateQrSvg, generateQrDataUrl } from '@/lib/qrCode';

interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  comment?: string;
  serviceName?: string;
  staffName?: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | '5stars'>('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [reviewUrl, setReviewUrl] = useState('https://hairmart.in/reviews');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReviewUrl(`${window.location.origin}/reviews?source=qr`);
    }
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        const enriched: ReviewItem[] = (data || []).map((r: any, idx: number) => ({
          id: r.id,
          customerName: r.customerName || 'Client Guest',
          rating: r.rating || 5,
          comment: r.comment || 'Great experience, clean salon, friendly stylists.',
          serviceName: r.serviceName || 'Salon Service',
          staffName: r.staffName || 'Stylist',
          approved: r.approved !== false,
          createdAt: r.createdAt || new Date().toISOString(),
        }));
        setReviews(enriched);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: !currentStatus }),
      });
      loadReviews();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      loadReviews();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadQr = async () => {
    try {
      const dataUrl = await generateQrDataUrl(reviewUrl, 600);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'hairmart-review-qr.png';
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendWhatsAppInvite = () => {
    const cleanPhone = invitePhone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert('Please enter a valid customer phone number.');
      return;
    }
    const nameStr = inviteName.trim() ? `Hi ${inviteName.trim()}! ` : 'Hello! ';
    const message =
      `${nameStr}Thank you for visiting *Hair Mart Studio — Unisex Family Salon* in Surathkal! ✨\n\n` +
      `We hope you loved your fresh look! Could you please take 30 seconds to share your review and rating?\n\n` +
      `👉 Tap here to rate us: ${reviewUrl}\n\n` +
      `Your feedback helps our stylists serve you even better. Look stylish, feel confident! ✂️💈`;

    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
    setInvitePhone('');
    setInviteName('');
  };

  const handlePrintStandee = () => {
    const printWindow = window.open('', '_blank', 'width=520,height=720');
    if (!printWindow) return;

    const qrSvg = generateQrSvg(reviewUrl, 210, '#1C2433', '#FFFFFF');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hair Mart Studio - Review Standee</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A5 portrait;
              margin: 8mm;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: #0A0D14;
              color: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 12px;
            }
            .standee-card {
              border: 3px solid #F6C926;
              border-radius: 20px;
              padding: 32px 24px;
              text-align: center;
              max-width: 420px;
              width: 100%;
              background: radial-gradient(circle at top, #1A2230 0%, #0A0D14 100%);
              box-shadow: 0 10px 40px rgba(0,0,0,0.6);
            }
            .logo-emblem {
              margin: 0 auto 14px;
            }
            .brand-title {
              font-size: 26px;
              font-weight: 900;
              letter-spacing: -0.5px;
            }
            .brand-gold { color: #F6C926; }
            .brand-subtitle {
              font-family: 'Playfair Display', Georgia, cursive;
              font-style: italic;
              font-size: 16px;
              color: #F6C926;
              margin-top: 1px;
            }
            .brand-tag {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 2px;
              color: #AAA;
              margin-top: 2px;
              text-transform: uppercase;
            }
            .stars {
              color: #F6C926;
              font-size: 22px;
              letter-spacing: 4px;
              margin: 14px 0 8px;
            }
            .headline {
              font-size: 17px;
              font-weight: 700;
              color: #FFFFFF;
              margin-bottom: 6px;
            }
            .subtext {
              font-size: 12px;
              color: #BBB;
              margin-bottom: 18px;
              line-height: 1.4;
            }
            .qr-wrapper {
              background: #FFFFFF;
              padding: 14px;
              border-radius: 16px;
              display: inline-block;
              box-shadow: 0 6px 20px rgba(246, 201, 38, 0.25);
              margin-bottom: 16px;
            }
            .scan-badge {
              display: inline-block;
              background: #F6C926;
              color: #0A0D14;
              font-weight: 800;
              font-size: 12px;
              padding: 6px 16px;
              border-radius: 20px;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .footer-loc {
              margin-top: 18px;
              font-size: 10px;
              color: #888;
            }
            @media print {
              body { background: transparent; padding: 0; }
              .standee-card { box-shadow: none; border-color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <!-- Brand -->
            <div class="brand-title">Hair <span class="brand-gold">Mart</span></div>
            <div class="brand-subtitle">Studio</div>
            <div class="brand-tag">UNISEX FAMILY SALON &bull; SURATHKAL</div>

            <div class="stars">★★★★★</div>
            <div class="headline">Loved Your Fresh Look?</div>
            <div class="subtext">Scan this QR code with your phone camera to rate our stylists &amp; share your review!</div>

            <!-- QR Code -->
            <div class="qr-wrapper">
              ${qrSvg}
            </div>

            <div>
              <span class="scan-badge">📷 Scan Camera to Review</span>
            </div>

            <div class="footer-loc">
              Surathkal, Mangalore &bull; Near Vishal Mart &bull; Ph: 0824-4060938
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  // Metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '5.0';
  const fiveStarsCount = reviews.filter((r) => r.rating === 5).length;
  const fiveStarsPct = totalReviews > 0 ? Math.round((fiveStarsCount / totalReviews) * 100) : 100;
  const pendingCount = reviews.filter((r) => !r.approved).length;

  // Filter reviews
  const filtered = reviews.filter((r) => {
    if (filter === 'pending' && r.approved) return false;
    if (filter === 'approved' && !r.approved) return false;
    if (filter === '5stars' && r.rating !== 5) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchComment = (r.comment || '').toLowerCase().includes(q);
      const matchService = (r.serviceName || '').toLowerCase().includes(q);
      const matchStaff = (r.staffName || '').toLowerCase().includes(q);
      return matchName || matchComment || matchService || matchStaff;
    }
    return true;
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Reviews &amp; Ratings Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Share your QR code on salon counters, request client reviews on WhatsApp, and manage customer appraisals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleCopyLink}
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>{copied ? '✓ Link Copied!' : '🔗 Copy Review Link'}</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handlePrintStandee}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🖨️ Print Desk Standee</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        {/* Rating Card */}
        <div className="card-premium" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Average Salon Rating
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#F6C926', lineHeight: 1 }}>{avgRating}</span>
            <span style={{ color: '#F6C926', fontSize: '16px' }}>★</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>out of 5.0</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Based on {totalReviews} client reviews
          </div>
        </div>

        {/* 5-Star Ratio Card */}
        <div className="card-premium" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            5-Star Satisfaction
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#4ADE80', lineHeight: 1, marginTop: '6px' }}>
            {fiveStarsPct}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {fiveStarsCount} delighted 5★ ratings
          </div>
        </div>

        {/* Total Reviews */}
        <div className="card-premium" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Total Submissions
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginTop: '6px' }}>
            {totalReviews}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Public &amp; in-house feedback
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card-premium" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Pending Moderation
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: pendingCount > 0 ? '#F6C926' : 'var(--text-secondary)', lineHeight: 1, marginTop: '6px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {pendingCount === 0 ? 'All reviews published' : 'Requires approval'}
          </div>
        </div>
      </div>

      {/* Review Sharing Hub: QR Code & WhatsApp Invite */}
      <div
        className="card-premium"
        style={{
          border: '1px solid rgba(246, 201, 38, 0.35)',
          padding: '24px',
          marginBottom: '24px',
          background: 'radial-gradient(ellipse at 80% 20%, rgba(246, 201, 38, 0.06) 0%, #0E121B 70%)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
          {/* Left: QR Code Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div
              style={{
                background: '#FFFFFF',
                padding: '12px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                display: 'inline-block',
                flexShrink: 0,
              }}
              dangerouslySetInnerHTML={{ __html: generateQrSvg(reviewUrl, 140, '#1C2433', '#FFFFFF') }}
            />
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'inline-block', background: 'rgba(246, 201, 38, 0.15)', color: '#F6C926', fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                Verified Camera-Scannable QR
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFF', margin: '0 0 6px 0' }}>
                Scan to Share Review
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px 0', maxWidth: '360px', lineHeight: 1.4 }}>
                Real standard QR code for counter standee or mirror stickers. Point any phone camera to instantly open the review form.
              </p>

              {/* Destination URL Input */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Review Destination URL:
                </label>
                <input
                  type="text"
                  value={reviewUrl}
                  onChange={(e) => setReviewUrl(e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    maxWidth: '360px',
                    fontSize: '11.5px',
                    padding: '6px 10px',
                    background: '#111520',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#F6C926',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handlePrintStandee}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11.5px', padding: '6px 12px', fontWeight: 700 }}
                >
                  🖨️ Print Standee
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '11px', padding: '6px 10px', color: '#F6C926', borderColor: '#F6C926' }}
                >
                  💾 Download QR (PNG)
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '11px', padding: '6px 10px' }}
                >
                  {copied ? '✓ Copied' : '🔗 Copy Link'}
                </button>
                <a
                  href={reviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '11px', padding: '6px 10px', textDecoration: 'none' }}
                >
                  ↗️ Test Link
                </a>
              </div>
            </div>
          </div>

          {/* Right: Instant WhatsApp Review Invite */}
          <div
            style={{
              background: '#090B10',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px' }}>💬</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Send Review Invite via WhatsApp</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              Send an instant personalized review invite with the direct review link to recent clients.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Client Name (e.g. Faazi)"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                style={{
                  background: '#121723',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: '#FFF',
                  padding: '8px 10px',
                  fontSize: '12px',
                }}
              />
              <input
                type="text"
                placeholder="Phone (e.g. 9148506215)"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                style={{
                  background: '#121723',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: '#FFF',
                  padding: '8px 10px',
                  fontSize: '12px',
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSendWhatsAppInvite}
              className="btn btn-outline btn-sm w-full"
              style={{
                borderColor: '#22C55E',
                color: '#4ADE80',
                fontSize: '12px',
                padding: '8px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>📲</span>
              <span>Send WhatsApp Invite Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#0F131D',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', background: '#090B10', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0 12px', minWidth: '280px' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search reviews by client, comment, stylist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFF', padding: '9px 0', fontSize: '13px', outline: 'none' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`pos-tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            type="button"
            className={`pos-tab-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Pending Moderation ({pendingCount})
          </button>
          <button
            type="button"
            className={`pos-tab-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Published
          </button>
          <button
            type="button"
            className={`pos-tab-btn ${filter === '5stars' ? 'active' : ''}`}
            onClick={() => setFilter('5stars')}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            5-Star Only ★
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review / Feedback</th>
              <th>Date</th>
              <th>Service</th>
              <th>Stylist</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Loading customer reviews...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No customer reviews matching current filter.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFF' }}>{r.customerName}</div>
                  </td>
                  <td>
                    <span style={{ color: '#F6C926', letterSpacing: '2px', fontSize: '14px' }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.4 }}>
                      &ldquo;{r.comment}&rdquo;
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontSize: '11.5px', color: '#FFF', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      {r.serviceName}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#F6C926', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {r.staffName}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '10.5px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        background: r.approved ? 'rgba(34,197,94,0.15)' : 'rgba(246,201,38,0.15)',
                        color: r.approved ? '#4ADE80' : '#F6C926',
                        border: `1px solid ${r.approved ? 'rgba(34,197,94,0.3)' : 'rgba(246,201,38,0.3)'}`,
                      }}
                    >
                      {r.approved ? 'PUBLISHED' : 'PENDING'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleApproval(r.id, r.approved)}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        {r.approved ? 'Unpublish' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDelete(r.id)}
                        style={{ color: '#EF4444', padding: '3px 8px' }}
                        title="Delete review"
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
  );
}
