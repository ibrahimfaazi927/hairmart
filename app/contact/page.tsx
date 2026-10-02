import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PHONE = '0824-4060938';
const WHATSAPP = '8660549348';
const WHATSAPP_LINK = `https://wa.me/91${WHATSAPP}?text=Hi%20Hair%20Mart%2C%20I%20have%20an%20enquiry%20regarding%20your%20services.`;
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Hair+Mart+Unisex+Saloon+Near+Vishal+Mart+Krishnapura+Surathkal+Mangalore";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <section className="section" style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-8))' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Location &amp; Inquiries</span>
            <h1 className="heading-lg">
              Visit &amp; Contact <span className="text-accent">Hair Mart</span>
            </h1>
            <div className="section-divider" />
            <p>
              Located conveniently in Surathkal near Vishal Mart. Connect with our team directly on WhatsApp or telephone for consultations, timings, and directions.
            </p>
          </div>

          {/* Quick Contact Action Cards */}
          <div className="contact-grid" style={{ marginBottom: 'var(--space-12)' }}>
            {/* WhatsApp */}
            <div className="contact-card">
              <div className="contact-card-icon whatsapp">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h3>WhatsApp Chat</h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>Instant replies for consultations &amp; inquiries</p>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm w-full">
                Chat {WHATSAPP}
              </a>
            </div>

            {/* Telephone */}
            <div className="contact-card">
              <div className="contact-card-icon phone">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3>Direct Landline</h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>Speak directly with our front desk reception</p>
              <a href={`tel:${PHONE.replace(/-/g, '')}`} className="btn btn-navy btn-sm w-full">
                Call {PHONE}
              </a>
            </div>

            {/* Google Maps Location */}
            <div className="contact-card">
              <div className="contact-card-icon location">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3>Google Maps</h3>
              <p style={{ marginBottom: 'var(--space-4)' }}>Near Vishal Mart, MRPL Road, Surathkal</p>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm w-full"
              >
                Get Directions ↗
              </a>
            </div>
          </div>

          {/* Full Location & Map Section */}
          <div className="card-premium" style={{ padding: 'var(--space-8)' }}>
            <div className="about-split" style={{ alignItems: 'center' }}>
              {/* Studio Information */}
              <div>
                <span className="badge badge-gold" style={{ marginBottom: 'var(--space-3)' }}>Landmark: Near Vishal Mart</span>
                <h2 className="heading-sm" style={{ marginBottom: 'var(--space-4)', color: '#FFFFFF' }}>
                  Salon Location &amp; Hours
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--gold-400)', fontSize: '20px', marginTop: '2px' }}>📍</div>
                    <div>
                      <strong style={{ display: 'block', color: '#FFFFFF', fontSize: '15px' }}>Official Address</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginTop: '2px' }}>
                        Hair Mart Studio &amp; Unisex Family Salon<br />
                        Keshav Chowta Nagar, Krishnapura,<br />
                        <strong>Near Vishal Mart, MRPL Road</strong>,<br />
                        Surathkal, Mangalore, Karnataka - 575014
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--gold-400)', fontSize: '20px', marginTop: '2px' }}>⏰</div>
                    <div>
                      <strong style={{ display: 'block', color: '#FFFFFF', fontSize: '15px' }}>Operating Hours</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginTop: '2px' }}>
                        Monday – Saturday: <strong style={{ color: 'var(--gold-300)' }}>9:30 AM – 9:00 PM</strong><br />
                        Sunday: <strong style={{ color: 'var(--gold-300)' }}>10:00 AM – 8:30 PM</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--gold-400)', fontSize: '20px', marginTop: '2px' }}>🚗</div>
                    <div>
                      <strong style={{ display: 'block', color: '#FFFFFF', fontSize: '15px' }}>Parking &amp; Accessibility</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginTop: '2px' }}>
                        Dedicated front-door parking on MRPL Road. Family and wheelchair accessible entrance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Map Embed */}
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(245, 186, 66, 0.3)', height: '380px', position: 'relative' }}>
                <iframe
                  title="Hair Mart Location Map"
                  src="https://maps.google.com/maps?q=Hair+Mart+Unisex+Saloon+Surathkal+Mangalore+Near+Vishal+Mart&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                  allowFullScreen
                  loading="lazy"
                />
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    padding: '10px 16px',
                    background: 'rgba(14, 17, 23, 0.95)',
                    border: '1px solid var(--gold-400)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span>📍 Hair Mart • Near Vishal Mart, Surathkal</span>
                  <span style={{ color: 'var(--gold-400)' }}>Navigate ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
