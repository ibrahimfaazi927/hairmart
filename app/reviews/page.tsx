'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';

interface ReviewItem {
  id: string | number;
  name: string;
  service: string;
  rating: number;
  date: string;
  comment: string;
  staff?: string;
}

export default function ReviewsPage() {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState("Men's Precision Haircut");
  const [staff, setStaff] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Load live approved reviews from database
    fetch('/api/reviews?approved=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const liveItems: ReviewItem[] = data.map((d: any) => ({
            id: d.id,
            name: d.customerName || 'Anonymous',
            service: d.serviceName || 'Salon Service',
            rating: d.rating || 5,
            date: new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            comment: d.comment || '',
            staff: d.staffName,
          }));
          setReviewsList(liveItems);
        }
      })
      .catch(console.error);

    // Auto-scroll to review submission form if user scanned QR code
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('source') === 'qr' || window.location.hash === '#share-review') {
        setTimeout(() => {
          const el = document.getElementById('share-review');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      alert('Please enter your name and a brief review message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          rating,
          serviceName: service,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        // Add optimistically to top of list
        setReviewsList((prev) => [
          {
            id: 'temp-' + Date.now(),
            name: name.trim(),
            service,
            rating,
            date: 'Just now',
            comment: comment.trim(),
            staff: staff || undefined,
          },
          ...prev,
        ]);
      } else {
        alert('Thank you! Your feedback has been received.');
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="section" style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-6))' }}>
        <div className="container">
          {/* Header */}
          <div className="section-header">
            <span className="section-subtitle">Client Experiences &bull; Hair Mart Studio</span>
            <h1 className="heading-lg">
              Customer <span className="text-accent">Reviews &amp; Ratings</span>
            </h1>
            <div className="section-divider" />
            <p>
              Discover why clients across Surathkal and Mangalore trust Hair Mart Unisex Family Salon for their styling, grooming, and luxury salon treatments.
            </p>
          </div>

          {/* Rating Summary Strip */}
          <div className="card-premium" style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 'var(--space-4)', textAlign: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-4xl)', fontWeight: 'bold', color: '#F6C926', lineHeight: 1 }}>
                  5.0
                </div>
                <div className="review-stars" style={{ justifyContent: 'center', margin: '6px 0 2px' }}>
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className="review-star" style={{ fontSize: '18px', color: '#F6C926' }}>{star}</span>
                  ))}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Satisfaction Rating
                </div>
              </div>

              <div style={{ height: '48px', width: '1px', background: 'var(--border-color)' }} />

              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: '#FFFFFF' }}>
                  100%
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-300)', marginTop: '2px' }}>
                  Authentic Formulations
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  O3+, Nature&apos;s Essence, Lotus
                </div>
              </div>

              <div style={{ height: '48px', width: '1px', background: 'var(--border-color)' }} />

              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: '#FFFFFF' }}>
                  Unisex
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-300)', marginTop: '2px' }}>
                  Men, Women &amp; Kids
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  Near Vishal Mart, Surathkal
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              SHARE YOUR REVIEW SECTION (Customer Interactive Form / QR Target)
             ═══════════════════════════════════════════════════════════════ */}
          <div
            id="share-review"
            className="card-premium"
            style={{
              marginBottom: 'var(--space-8)',
              padding: '32px 28px',
              border: '1px solid rgba(246, 201, 38, 0.35)',
              background: 'radial-gradient(ellipse at 50% 0%, rgba(246, 201, 38, 0.08) 0%, #0E121B 75%)',
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{ fontSize: '42px', marginBottom: '8px' }}>✨🎉</div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                  Thank You for Your Review!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Your appraisal means the world to our stylists at <b style={{ color: '#F6C926' }}>Hair Mart Studio</b>. We look forward to welcoming you back soon!
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <a
                    href="https://maps.google.com/?q=Hair+Mart+Surathkal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontWeight: 700, padding: '10px 20px' }}
                  >
                    ⭐ Also Rate us on Google Maps
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setComment('');
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '13px' }}
                  >
                    Submit Another Feedback
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'inline-block', background: 'rgba(246, 201, 38, 0.15)', color: '#F6C926', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '14px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                    Quick Feedback &bull; 30 Seconds
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                    Share Your Experience at Hair Mart Studio
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                    Scanned our salon QR code or visited recently? Let us know how we styled your look!
                  </p>
                </div>

                <form onSubmit={handleSubmitReview} style={{ maxWidth: '620px', margin: '0 auto' }}>
                  {/* Star Rating Interactive Selector */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      How would you rate your overall salon experience?
                    </label>
                    <div style={{ display: 'inline-flex', gap: '8px', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '32px',
                            lineHeight: 1,
                            color: (hoverRating || rating) >= star ? '#F6C926' : 'rgba(255,255,255,0.2)',
                            transition: 'transform 0.15s ease, color 0.15s ease',
                            transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                            padding: '2px 4px',
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: '12px', color: '#F6C926', fontWeight: 700, marginTop: '4px' }}>
                      {rating === 5 ? '5.0 — Excellent / Loved it!' : rating === 4 ? '4.0 — Very Good' : rating === 3 ? '3.0 — Average' : 'Needs Improvement'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Hegde"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#121723',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '8px',
                          color: '#FFF',
                          padding: '10px 12px',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#121723',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '8px',
                          color: '#FFF',
                          padding: '10px 12px',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Service Received
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#121723',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '8px',
                          color: '#FFF',
                          padding: '10px 12px',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      >
                        <option value="Men's Precision Haircut">Men&apos;s Precision Haircut</option>
                        <option value="Beard Styling & Shave">Beard Styling &amp; Shave</option>
                        <option value="Women's Hair Spa">Women&apos;s Hair Spa</option>
                        <option value="Hair Smoothening & Botox">Hair Smoothening &amp; Botox</option>
                        <option value="O3+ / Glowing Facial">O3+ / Glowing Facial</option>
                        <option value="Hair Colouring & Highlights">Hair Colouring &amp; Highlights</option>
                        <option value="Kids Haircut">Kids Haircut</option>
                        <option value="Complete Grooming Package">Complete Grooming Package</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Stylist / Barber (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Priya or Rahul"
                        value={staff}
                        onChange={(e) => setStaff(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#121723',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '8px',
                          color: '#FFF',
                          padding: '10px 12px',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Your Review &amp; Comments *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us what you liked about the haircut, hygiene, polite staff, ambience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#121723',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        color: '#FFF',
                        padding: '10px 12px',
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary w-full"
                    style={{
                      padding: '13px',
                      fontSize: '14px',
                      fontWeight: 800,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{submitting ? 'Submitting Review...' : '⭐ Submit My Review'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Reviews Grid */}
          {reviewsList.length > 0 ? (
            <div className="reviews-grid">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="review-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div className="review-stars">
                      {'★'.repeat(rev.rating).split('').map((star, i) => (
                        <span key={i} className="review-star" style={{ color: '#F6C926' }}>{star}</span>
                      ))}
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{rev.date}</span>
                  </div>

                  <p className="review-text" style={{ fontSize: '12.5px', minHeight: '60px' }}>
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="review-author" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <div className="review-author-avatar" style={{ background: '#1F2937', color: '#F6C926', fontWeight: 800 }}>
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <div className="review-author-name">{rev.name}</div>
                      <div className="review-author-label">
                        {rev.service} {rev.staff ? `• Stylist: ${rev.staff}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="card-premium text-center"
              style={{
                maxWidth: '560px',
                margin: '0 auto',
                padding: '48px 24px',
                border: '1px dashed rgba(246, 201, 38, 0.3)',
                borderRadius: '16px',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⭐</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                No Customer Reviews Published Yet
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Have you visited Hair Mart Studio in Surathkal? We would love to hear about your experience!
              </p>
              <a href="#share-review" className="btn btn-primary btn-sm">
                Write the First Review ✨
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
