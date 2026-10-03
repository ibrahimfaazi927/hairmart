import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import ScrollAnimations from '@/components/ScrollAnimations';

const PHONE = '0824-4060938';
const WHATSAPP = '8660549348';
const WHATSAPP_LINK = `https://wa.me/91${WHATSAPP}?text=Hi%20Hair%20Mart%2C%20I%27d%20like%20to%20enquire%20about%20your%20services.`;
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Hair+Mart+Unisex+Saloon+Near+Vishal+Mart+Krishnapura+Surathkal+Mangalore";

const featuredServices = [
  {
    icon: '✂️',
    name: "Men's Precision Cut",
    desc: 'Expert haircuts, fades, beard shaping, and traditional hot towel grooming.',
  },
  {
    icon: '💆‍♀️',
    name: 'Women\u2019s Hair Spa',
    desc: 'Deep moisture therapy, repairing hair spa, and Fibre Clinix restorative care.',
  },
  {
    icon: '🧴',
    name: 'O3+ & Gold Facials',
    desc: 'Certified single-use Italian O3+ kits and 24K gold skin whitening therapies.',
  },
  {
    icon: '🎨',
    name: 'Hair Colouring',
    desc: 'Ammonia-free grey coverage, fashion streaks, and L\u2019Or\u00e9al pigments.',
  },
  {
    icon: '✨',
    name: 'Smoothing & Botox',
    desc: 'Permanent hair straightening, silk smoothing, and biotin infusion treatments.',
  },
  {
    icon: '👑',
    name: 'Scalp & Massages',
    desc: 'Herbal oil head massages, tonic scalp care, anti-dandruff, and hair fall control.',
  },
];

/* Service categories for the hero bottom strip — matching the reference design */
const heroServiceCategories = [
  {
    label: 'Hair Cutting\n& Styling',
    /* Scissors SVG icon */
    iconSvg: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: 'Beard\nSculpting',
    /* Razor / blade icon */
    iconSvg: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20l4-16M11 4l9.5 8L11 20H7l4-8-4-8z" />
      </svg>
    ),
  },
  {
    label: 'Hair Spas\n& Treatments',
    /* Spa / leaf icon */
    iconSvg: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c-4.97 0-9-2.686-9-6 0-4 5-10 9-14 4 4 9 10 9 14 0 3.314-4.03 6-9 6z" />
        <path d="M12 22V8" />
        <path d="M8 14c1.5-1 2.5-2 4-6" />
        <path d="M16 14c-1.5-1-2.5-2-4-6" />
      </svg>
    ),
  },
  {
    label: 'Skincare\nServices',
    /* Face/skincare icon */
    iconSvg: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 0-7 7v4a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7z" />
        <path d="M9 12h0M15 12h0" />
        <path d="M10 16a3.5 3.5 0 0 0 4 0" />
        <path d="M5 9c-1 0-2 .5-2 2s1 2 2 2" />
        <path d="M19 9c1 0 2 .5 2 2s-1 2-2 2" />
      </svg>
    ),
  },
];

const salonHighlights = [
  {
    icon: '⭐',
    title: 'Certified Stylists',
    desc: 'Experienced grooming professionals dedicated to craftsmanship.',
  },
  {
    icon: '🌿',
    title: 'Authentic Products',
    desc: 'Genuine salon formulations: O3+, Nature\u2019s Essence, and Lotus.',
  },
  {
    icon: '✨',
    title: 'Classic Ambience',
    desc: 'Backlit vanity mirrors, comfortable leather recliners, and hygiene.',
  },
  {
    icon: '📍',
    title: 'Near Vishal Mart',
    desc: 'Conveniently located on MRPL Road, Krishnapura, Surathkal.',
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollAnimations />

      {/* ─── Hero Section — Full-Bleed Immersive Layout ──── */}
      <section className="hero-split">
        {/* Background: Salon image */}
        <div className="hero-split-image">
          <img
            src="/images/salon/hero-bg.jpg"
            alt="Hair Mart Unisex Salon Studio Surathkal"
          />
        </div>

        {/* Foreground text & CTAs */}
        <div className="hero-split-text">
          <div className="hero-split-text-inner">
            <span className="section-subtitle hero-subtitle hero-animate hero-animate-1">
              Surathkal &bull; Unisex Family Salon
            </span>

            {/* Desktop title */}
            <h1 className="hero-split-title hero-animate hero-animate-2 hero-desktop-title">
              HAIR <span className="hero-gold">MART</span>
            </h1>

            {/* Mobile title — matches reference "Look Good, Feel Better" */}
            <h1 className="hero-split-title hero-animate hero-animate-2 hero-mobile-title">
              Look Good,<br />
              <span className="hero-gold hero-italic">Feel Better</span>
            </h1>

            <div className="hero-location hero-animate hero-animate-3" style={{ marginBottom: '16px' }}>
              <span className="hero-desktop-title">Precision Styling &amp; Skincare Studio</span>
            </div>

            <p className="hero-split-desc hero-animate hero-animate-4">
              Expertise in hair cutting, bespoke beard sculpting, restorative hair spas and dermatological skin care — all under one roof, near Vishal Mart in Surathkal.
            </p>

            <div className="hero-actions hero-animate hero-animate-5">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-hero-whatsapp btn-md"
                id="hero-whatsapp-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hero-btn-arrow">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a
                href={`tel:${PHONE.replace(/-/g, '')}`}
                className="btn btn-hero-call btn-md"
                id="hero-call-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-hero-call btn-md hero-directions-desktop"
                id="hero-directions-btn"
              >
                📍 Directions
              </a>
            </div>
          </div>
        </div>

        {/* ─── Mobile Hero Service Categories Strip (Bottom) ─── */}
        <div className="hero-services-strip hero-animate hero-animate-5">
          {heroServiceCategories.map((cat) => (
            <Link href="/services" key={cat.label} className="hero-service-item">
              <div className="hero-service-icon">{cat.iconSvg}</div>
              <span className="hero-service-label">{cat.label}</span>
            </Link>
          ))}
        </div>

        <div className="hero-scroll-indicator">
          <span>Scroll</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ─── Studio Craft & Hair Artistry Split Section ───── */}
      <section className="section">
        <div className="container">
          <div className="about-split">
            <div className="about-image animate-fade-right">
              <img
                src="/images/salon/hair-styling.jpg"
                alt="Hair Mart Styling & Grooming Tools"
              />
            </div>
            <div className="about-text animate-fade-left">
              <span className="section-subtitle">The Hair Mart Standard</span>
              <h2 className="heading-md">
                Precision Haircare &amp; <span className="text-accent">Luxury Grooming</span>
              </h2>
              <p>
                Located in Surathkal near Vishal Mart on MRPL Road, Hair Mart is designed as a modern salon sanctuary. From individual lighted vanity mirrors to specialized hair steaming suites, every touchpoint reflects dedication to comfort and hygiene.
              </p>
              <p>
                Our experienced stylists curate tailored services for both men and women—utilizing authentic skin and hair formulations to bring out your effortless confidence.
              </p>
              <div className="flex gap-3 mt-4 flex-wrap">
                <Link href="/services" className="btn btn-primary btn-sm">
                  View Full Catalogue
                </Link>
                <Link href="/gallery" className="btn btn-secondary btn-sm">
                  Studio Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Services (2 Horizontal Cards on Phone) ─── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-subtitle">What We Offer</span>
            <h2 className="heading-lg">
              Tailored Salon <span className="text-accent">Services</span>
            </h2>
            <div className="section-divider" />
            <p>
              A complete menu of unisex hair, scalp, facial, and styling rituals executed by trained grooming professionals.
            </p>
          </div>

          <div className="services-grid">
            {featuredServices.map((service, i) => (
              <div key={service.name} className="service-card animate-stagger-item" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="service-card-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p>{service.desc}</p>
                <Link href="/services" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                  Explore →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 animate-fade-up">
            <Link href="/services" className="btn btn-primary btn-md">
              Explore All Men &amp; Women Services
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Professional Products Section with Real Packshots ───────── */}
      <section className="section">
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-subtitle">Authentic Formulations</span>
            <h2 className="heading-lg">
              Professional <span className="text-accent">Products</span> We Trust
            </h2>
            <div className="section-divider" />
            <p>
              We exclusively use proven, dermatologist-tested, salon-grade kits to ensure glowing skin and revitalized hair.
            </p>
          </div>

          <div className="products-grid">
            {/* O3+ Professional */}
            <div className="product-card animate-stagger-item" style={{ transitionDelay: '0ms' }}>
              <div className="product-card-image">
                <span className="product-card-pro">Italy Formulation</span>
                <img
                  src="/images/products/o3-shine-glow.jpg"
                  alt="O3+ Professional Shine and Glow Facial Kit"
                />
              </div>
              <div className="product-card-body">
                <div className="product-card-brand">O3+ Professional</div>
                <h3>Shine &amp; Glow 7-Step Kit</h3>
                <p>Single-use professional facial formulation designed and developed in Italy for instant radiance, dark spot reduction, and skin brightening.</p>
                <div className="product-card-indicator">✦ Featured in our signature facials</div>
              </div>
            </div>

            {/* Nature's Essence */}
            <div className="product-card animate-stagger-item" style={{ transitionDelay: '120ms' }}>
              <div className="product-card-image">
                <span className="product-card-pro">24K Gold Ritual</span>
                <img
                  src="/images/products/natures-essence-gold.jpg"
                  alt="Nature's Essence Glowing Gold Facial Kit"
                />
              </div>
              <div className="product-card-body">
                <div className="product-card-brand">Nature&apos;s Essence</div>
                <h3>Advanced Glowing Gold Facial</h3>
                <p>Comprehensive 5-stage gold therapy including cleanser, exfoliating scrub, massage cream, nourishing gel, and tightening pack.</p>
                <div className="product-card-indicator">✦ Used in premium skin treatments</div>
              </div>
            </div>

            {/* Lotus Professional */}
            <div className="product-card animate-stagger-item" style={{ transitionDelay: '240ms' }}>
              <div className="product-card-image">
                <span className="product-card-pro">Bridal Care</span>
                <img
                  src="/images/products/lotus-bridal-glow.jpg"
                  alt="Lotus Professional Bridal Glow Facial Kit"
                />
              </div>
              <div className="product-card-body">
                <div className="product-card-brand">Lotus Professional</div>
                <h3>Bridal Glow Skin Whitening</h3>
                <p>High-performance bridal and celebration skin preparation delivering luminous, even-toned complexion and deep pore purification.</p>
                <div className="product-card-indicator">✦ Specialized bridal and occasion prep</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 animate-fade-up">
            <Link href="/products" className="btn btn-secondary btn-sm">
              View All Products &amp; Kits
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Highlights / Why Choose Us ──────────────────── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-subtitle">Why Surathkal Chooses Us</span>
            <h2 className="heading-lg">
              The <span className="text-accent">Hair Mart</span> Experience
            </h2>
            <div className="section-divider" />
          </div>

          <div className="stats-strip">
            {salonHighlights.map((point, i) => (
              <div key={point.title} className="card text-center animate-scale-in" style={{ padding: '16px', transitionDelay: `${i * 100}ms` }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{point.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                  {point.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5' }}>
                  {point.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Visual Atmosphere / Gallery Showcase ────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-subtitle">Visual Experience</span>
            <h2 className="heading-lg">
              Studio <span className="text-accent">Atmosphere</span>
            </h2>
            <div className="section-divider" />
            <p>A glimpse into the aesthetic elegance, premium styling tools, and skincare suites at Hair Mart.</p>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item animate-stagger-item" style={{ transitionDelay: '0ms' }}>
              <img src="/images/salon/hero-bg.jpg" alt="Hair Mart Luxury Styling Stations" />
              <div className="gallery-item-overlay">
                <div className="gallery-item-title">Gold Back-Lit Styling Stations &amp; Leather Barber Chairs</div>
              </div>
            </div>
            <div className="gallery-item animate-stagger-item" style={{ transitionDelay: '120ms' }}>
              <img src="/images/salon/skincare-treatment.jpg" alt="Hair Mart Skincare & Facial Suite" />
              <div className="gallery-item-overlay">
                <div className="gallery-item-title">Facial Spa Suite &amp; Professional Skincare Kits</div>
              </div>
            </div>
            <div className="gallery-item animate-stagger-item" style={{ transitionDelay: '240ms' }}>
              <img src="/images/salon/hair-styling.jpg" alt="Hair Mart Styling Tools" />
              <div className="gallery-item-overlay">
                <div className="gallery-item-title">Artisan Barber Shears &amp; Salon Haircare Formulation</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 animate-fade-up">
            <Link href="/gallery" className="btn btn-secondary btn-sm">
              View Complete Visual Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Customer Testimonials / Reviews Preview ──────── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header animate-fade-up">
            <span className="section-subtitle">Client Experiences</span>
            <h2 className="heading-lg">
              What Our <span className="text-accent">Guests Say</span>
            </h2>
            <div className="section-divider" />
            <p>Hear from clients who trust Hair Mart with their regular grooming and celebration transformations.</p>
          </div>

          <div className="reviews-grid">
            <div className="review-card animate-stagger-item" style={{ transitionDelay: '0ms' }}>
              <div className="review-stars">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i} className="review-star">{star}</span>
                ))}
              </div>
              <p className="review-text">
                &ldquo;Clean, professional, and very hygienic salon near Vishal Mart. The stylists pay great attention to detail during haircuts and beard shaping.&rdquo;
              </p>
              <div className="review-author">
                <div className="review-author-avatar">S</div>
                <div>
                  <div className="review-author-name">Surathkal Resident</div>
                  <div className="review-author-label">Regular Client</div>
                </div>
              </div>
            </div>

            <div className="review-card animate-stagger-item" style={{ transitionDelay: '120ms' }}>
              <div className="review-stars">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i} className="review-star">{star}</span>
                ))}
              </div>
              <p className="review-text">
                &ldquo;Loved the hair spa and facial treatments. The atmosphere is very comfortable, and genuine products like O3+ are used.&rdquo;
              </p>
              <div className="review-author">
                <div className="review-author-avatar">M</div>
                <div>
                  <div className="review-author-name">Mangalore Client</div>
                  <div className="review-author-label">Hair &amp; Skin Care</div>
                </div>
              </div>
            </div>

            <div className="review-card animate-stagger-item" style={{ transitionDelay: '240ms' }}>
              <div className="review-stars">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i} className="review-star">{star}</span>
                ))}
              </div>
              <p className="review-text">
                &ldquo;One of the best unisex family salons in the Surathkal area. Courteous staff, fair consultation, and relaxing ambience.&rdquo;
              </p>
              <div className="review-author">
                <div className="review-author-avatar">A</div>
                <div>
                  <div className="review-author-name">Family Visitor</div>
                  <div className="review-author-label">Unisex Services</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 animate-fade-up">
            <Link href="/reviews" className="btn btn-secondary btn-sm">
              Read More Client Reviews
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Contact & Visit CTA Banner with Google Maps CTA ── */}
      <section className="animate-fade-up" style={{
        padding: 'var(--space-12) 0',
        background: 'var(--dark-900)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#FFFFFF',
      }}>
        <div className="container text-center">
          <span className="section-subtitle">Visit Hair Mart in Surathkal</span>
          <h2 className="heading-md" style={{ color: '#FFFFFF', marginBottom: '8px', marginTop: '6px' }}>
            Experience Personal <span className="text-accent">Styling &amp; Care</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '520px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            Walk in or connect with our team on WhatsApp and telephone for styling consultations, facials, and directions near Vishal Mart.
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-md"
            >
              WhatsApp Us
            </a>
            <a
              href={`tel:${PHONE.replace(/-/g, '')}`}
              className="btn btn-navy btn-md"
            >
              Call {PHONE}
            </a>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-md"
            >
              Directions ↗
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
