'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface DbProduct {
  id: string;
  name: string;
  brand: string;
  description?: string | null;
  image?: string | null;
  price?: number | null;
  stock?: number | null;
  category?: string | null;
  professional?: boolean;
  services?: Array<{ service: { id: string; name: string } }>;
}

const FALLBACK_PRODUCTS: DbProduct[] = [
  {
    id: 'fb-1',
    brand: 'O3+ Professional',
    name: 'Shine & Glow Single-Use 7-Step Facial Kit',
    image: '/images/products/o3-shine-glow.jpg',
    description: 'Renowned skincare formulation designed and developed in Italy. Formulated with potent brightening botanical complexes, lactic peel, and arbutin serum to deliver clear, luminous, and radiant skin without irritation.',
    category: 'Facial & Skin Aesthetics',
    price: 1850,
    professional: true,
  },
  {
    id: 'fb-2',
    brand: "Nature's Essence",
    name: 'Advanced 24K Glowing Gold Facial Kit',
    image: '/images/products/natures-essence-gold.jpg',
    description: 'Complete professional gold facial therapy featuring a 5-step ritual that gently exfoliates dead surface cells, revitalizes microcirculation, and infuses gold bio-nutrients for lasting bridal glow.',
    category: 'Facial & Skin Aesthetics',
    price: 1450,
    professional: true,
  },
  {
    id: 'fb-3',
    brand: 'Lotus Professional',
    name: 'Bridal Glow Skin Whitening Facial Kit',
    image: '/images/products/lotus-bridal-glow.jpg',
    description: 'High-efficacy skin whitening and radiance kit crafted for bridal, pre-wedding, and celebration skin preparation. Deep cleanses pores, minimizes sun tanning, and enhances natural radiance.',
    category: 'Bridal & Occasion Care',
    price: 1650,
    professional: true,
  },
  {
    id: 'fb-4',
    brand: "L'Oréal Professional",
    name: 'Majirel & INOA Ammonia-Free Hair Colours',
    image: '/images/salon/hair-styling.jpg',
    description: 'World-class hair colour formulations providing 100% rich grey coverage, deep conditioning hair protection, and high-fashion dimensional reflects without harsh odors.',
    category: 'Hair Colouring & Highlights',
    price: 850,
    professional: true,
  },
  {
    id: 'fb-5',
    brand: 'Schwarzkopf Professional',
    name: 'Fibre Clinix Restorative Hair Spa Line',
    image: '/images/salon/skincare-treatment.jpg',
    description: 'Cutting-edge hair bonding and restorative hair spa technology that reconstructs damaged hair fibres from within, locking in moisture and sealing split cuticles.',
    category: 'Hair Spa & Damage Repair',
    price: 2100,
    professional: true,
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (e) {
      console.error('Failed to load products from catalogue:', e);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Derive unique categories and brands dynamically from current products
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category || 'Hair Care').filter(Boolean)))];
  const brands = ['All', ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || (p.category || 'Hair Care') === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    return matchesCat && matchesBrand;
  });

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

          {/* Interactive Category & Brand Filter Bar */}
          <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: selectedCategory === cat ? 'var(--gold-400)' : '#121723',
                    color: selectedCategory === cat ? '#0A0D14' : '#E2E8F0',
                    border: selectedCategory === cat ? '1px solid var(--gold-400)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Brand Filter Dropdown */}
            {brands.length > 2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Filter by Brand:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  style={{
                    background: '#121723',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '6px 12px',
                    fontSize: '12.5px',
                  }}
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b === 'All' ? 'All Brands' : b}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ({filteredProducts.length} items)
                </span>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Loading professional catalogue...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              No products found matching this filter.
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id || product.name} className="product-card">
                  <div className="product-card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                    <span className="product-card-pro">
                      {product.professional ? 'Professional Grade' : 'Authentic'}
                    </span>
                    <img
                      src={product.image || '/images/products/o3-shine-glow.jpg'}
                      alt={product.name}
                      style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/products/o3-shine-glow.jpg';
                      }}
                    />
                  </div>

                  <div className="product-card-body">
                    <div className="product-card-brand">{product.brand}</div>
                    <h3>{product.name}</h3>
                    <p>{product.description || 'Certified salon-grade formulation used in our specialized treatments.'}</p>

                    {product.category && (
                      <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-gold">✦ {product.category}</span>
                        {product.price && product.price > 0 && (
                          <span className="badge badge-neutral" style={{ color: '#4ADE80', fontWeight: 700 }}>
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                    )}

                    {product.services && product.services.length > 0 && (
                      <div style={{ marginTop: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        <b>Used in:</b> {product.services.map((s) => s.service.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
