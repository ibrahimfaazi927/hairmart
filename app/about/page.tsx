import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <section className="section" style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-6))' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Our Heritage &amp; Philosophy</span>
            <h1 className="heading-lg">
              Welcome to <span className="text-accent">Hair Mart</span>
            </h1>
            <div className="section-divider" />
            <p>
              Surathkal’s destination for bespoke unisex grooming, hair transformations, and restorative skincare therapies.
            </p>
          </div>

          {/* Story & Split Image */}
          <div className="card-premium" style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)' }}>
            <div className="about-split">
              <div className="about-image">
                <img
                  src="/images/salon/salon-storefront.jpg"
                  alt="Hair Mart Studio Exterior Surathkal"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="about-text">
                <span className="badge badge-gold" style={{ marginBottom: '8px' }}>Unisex Family Studio</span>
                <h2 className="heading-sm" style={{ marginBottom: '12px', color: '#FFFFFF' }}>
                  Our Story &amp; <span className="text-accent">Vision</span>
                </h2>
                <p>
                  Hair Mart Unisex Salon was established with a singular focus: to elevate everyday salon visits into an authentic studio experience for individuals and families across Surathkal and Mangalore.
                </p>
                <p>
                  We bring together experienced, patient stylists who understand hair types, texture behavior, and individual aesthetic preferences—delivering haircuts, beard artistry, and skincare rituals with refined attention to detail.
                </p>
                <p>
                  By strictly utilizing authentic salon formulations like O3+ Professional, Nature’s Essence Gold, and Lotus Professional, we guarantee results that are healthy, radiant, and long-lasting.
                </p>
              </div>
            </div>
          </div>

          {/* Pillars of Excellence */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <div className="card text-center" style={{ padding: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✂️</div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                Master Stylists
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5' }}>
                Skilled specialists with deep expertise in modern fades, classic scissors work, and chemical hair forms.
              </p>
            </div>

            <div className="card text-center" style={{ padding: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧴</div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                Certified Products
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5' }}>
                Single-use sealed facial packs, ammonia-free hair dyes, and certified keratin formulations.
              </p>
            </div>

            <div className="card text-center" style={{ padding: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✨</div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                Classic Ambience
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5' }}>
                Gold-lit mirrors, plush leather seating, hygienic tools, and relaxing hospitality throughout.
              </p>
            </div>

            <div className="card text-center" style={{ padding: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>👨‍👩‍👧‍👦</div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                Unisex &amp; Family Friendly
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5' }}>
                Dedicated services for men, women, and gentle kid-friendly hair trimming in comfortable privacy.
              </p>
            </div>
          </div>

          {/* Service Highlights Checklist */}
          <div className="card-premium" style={{ padding: 'var(--space-6)' }}>
            <h2 className="heading-sm text-center" style={{ marginBottom: '16px', color: '#FFFFFF' }}>
              What We Offer at <span className="text-accent">Hair Mart Surathkal</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
              {[
                "Precision Men's haircuts, fades, and traditional shaves",
                "Custom beard sculpting, trim, and beard coloration",
                "Women's moisturizing, repairing & Fibre Clinix hair spa",
                "O3+ Professional single-use Italian skin brightening facials",
                "Nature's Essence 5-stage Glowing Gold facial therapy",
                "Lotus Professional bridal glow and event preparation",
                "L'Oréal permanent colour, streaks & ammonia-free grey coverage",
                "Permanent hair smoothening, botox & biotin treatments",
                "Traditional nourishing head oil and tonic scalp massages",
                "Patient and safe haircutting & head shaving for kids",
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.4' }}>
                  <span style={{ color: 'var(--gold-400)', fontWeight: 'bold' }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
