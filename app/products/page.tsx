import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const products = [
  {
    brand: 'O3+ Professional',
    name: 'Shine & Glow Single-Use 7-Step Facial Kit',
    image: '/images/products/o3-shine-glow.jpg',
    desc: 'Renowned skincare formulation designed and developed in Italy. Formulated with potent brightening botanical complexes, lactic peel, and arbutin serum to deliver clear, luminous, and radiant skin without irritation.',
    category: 'Facial & Skin Aesthetics',
    origin: 'Developed in Italy • Professional Salon Grade',
    usedIn: 'Signature Glow Facial & Event Skin Prep',
    badge: 'Italy Formulation',
    features: [
      'Single-use sealed hygienic 7-step kit',
      'Instant luminosity & deep cellular hydration',
      'Suitable for diverse skin tones and sensitive types',
    ],
  },
  {
    brand: "Nature's Essence",
    name: 'Advanced 24K Glowing Gold Facial Kit',
    image: '/images/products/natures-essence-gold.jpg',
    desc: 'Complete professional gold facial therapy featuring a 5-step ritual that gently exfoliates dead surface cells, revitalizes microcirculation, and infuses gold bio-nutrients for lasting bridal glow.',
    category: 'Gold Rejuvenation Ritual',
    origin: 'Certified Professional Series',
    usedIn: 'Glowing Gold Facial & Celebration Therapy',
    badge: '5-Stage Treatment',
    features: [
      'Stage 1: Glowing Gold Cleanser',
      'Stage 2: Gentle Gold Exfoliating Scrub',
      'Stage 3: Nutrient-Rich Gold Massage Cream',
      'Stage 4: Hydrating Gold Gel',
      'Stage 5: Tightening Gold Firming Pack',
    ],
  },
  {
    brand: 'Lotus Professional',
    name: 'Bridal Glow Skin Whitening Facial Kit',
    image: '/images/products/lotus-bridal-glow.jpg',
    desc: 'High-efficacy skin whitening and radiance kit crafted for bridal, pre-wedding, and celebration skin preparation. Deep cleanses pores, minimizes sun tanning, and enhances natural radiance.',
    category: 'Bridal & Occasion Care',
    origin: 'Lotus Professional Care Line',
    usedIn: 'Bridal Glow & De-Tan Packages',
    badge: 'Celebration Care',
    features: [
      'Pore refining and tone balancing',
      'Targets sun damage, tanning, and dullness',
      'Prolonged glow for wedding photography and events',
    ],
  },
  {
    brand: "L'Oréal Professional",
    name: 'Majirel & INOA Ammonia-Free Hair Colours',
    image: '/images/salon/hair-styling.jpg',
    desc: 'World-class hair colour formulations providing 100% rich grey coverage, deep conditioning hair protection, and high-fashion dimensional reflects without harsh odors.',
    category: 'Hair Colouring & Highlights',
    origin: "L'Oréal Professionnel Paris",
    usedIn: 'Grey Coverage, Streaks & Fashion Shades',
    badge: 'Ammonia-Free Options',
    features: [
      'Optimal scalp comfort during processing',
      'Long-lasting pigment retention and lustrous shine',
      'Broad palette from classic naturals to bold shades',
    ],
  },
  {
    brand: 'Schwarzkopf Professional',
    name: 'Fibre Clinix Restorative Hair Spa Line',
    image: '/images/salon/skincare-treatment.jpg',
    desc: 'Cutting-edge hair bonding and restorative hair spa technology that reconstructs damaged hair fibres from within, locking in moisture and sealing split cuticles.',
    category: 'Hair Spa & Damage Repair',
    origin: 'Schwarzkopf Professional Germany',
    usedIn: 'Fibre Clinix Therapy & Repairing Hair Spa',
    badge: 'Bond Reconstruction',
    features: [
      'Triple bonding & C21 technology',
      'Up to 10x stronger hair resilience',
      'Restores natural bounce and silky touch',
    ],
  },
];

export default function ProductsPage() {
  return (
    <>
      <Navbar />

      <section className="section" style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-6))' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Salon Grade Standards</span>
            <h1 className="heading-lg">
              Professional <span className="text-accent">Products</span>
            </h1>
            <div className="section-divider" />
            <p>
              At Hair Mart, we believe remarkable outcomes begin with authentic formulations. We strictly employ certified professional salon kits for all hair, skin, and styling procedures.
            </p>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.name} className="product-card">
                <div className="product-card-image">
                  <span className="product-card-pro">{product.badge}</span>
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                </div>

                <div className="product-card-body">
                  <div className="product-card-brand">{product.brand}</div>
                  <h3>{product.name}</h3>
                  <p>{product.desc}</p>

                  <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--dark-850)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div className="label-text" style={{ marginBottom: '6px' }}>
                      Highlights &amp; Components:
                    </div>
                    {product.features.map((feat) => (
                      <div key={feat} style={{ fontSize: '11.5px', color: 'var(--text-secondary)', padding: '2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--gold-400)', fontWeight: 'bold' }}>✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="badge badge-gold">✦ {product.usedIn}</span>
                    <span className="badge badge-neutral">{product.origin}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
