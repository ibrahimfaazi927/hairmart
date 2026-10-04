'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ServiceItem {
  id?: string;
  name: string;
  desc?: string;
  description?: string | null;
  price?: number;
  duration?: number | null;
  category?: { id: string; name: string; gender?: string };
}

const FALLBACK_WOMEN_SERVICES: Record<string, Array<{ name: string; desc: string }>> = {
  'Hair Spa & Treatments': [
    { name: 'Express Hair Spa', desc: 'A quick revitalizing treatment for instant hair hydration and smooth shine.' },
    { name: 'Moisturizing Hair Spa', desc: 'Deep moisture therapy restoring softness, elasticity, and manageability.' },
    { name: 'Repairing Hair Spa', desc: 'Intensive deep repair formulation for chemically treated or brittle hair.' },
    { name: 'Fibre Clinix Restorative', desc: 'Advanced salon fibre-level restoration customized to hair porosity.' },
    { name: 'Relaxing Head Massage', desc: 'Stress-relieving scalp therapy promoting natural blood circulation.' },
    { name: 'Anti-Dandruff Scalp Care', desc: 'Deep cleansing treatment targeting persistent dandruff and flakiness.' },
    { name: 'Anti-Hair Fall Therapy', desc: 'Follicle-fortifying treatment designed to strengthen hair roots.' },
  ],
  'Hair Forms & Texture Transformation': [
    { name: 'Straightening & Smoothing', desc: 'Professional salon hair smoothening for a sleek, permanent finish.' },
    { name: 'Hair Botox Treatment', desc: 'Deep conditioning botox therapy to eliminate frizz and restore health.' },
    { name: 'Biotin Infusion Therapy', desc: 'Biotin therapy providing proteins to strengthen strands and boost shine.' },
  ],
  'Facial & Skin Aesthetics': [
    { name: 'O3+ Shine & Glow Facial', desc: 'Italian single-use professional facial kit providing radiant glow.' },
    { name: "Nature's Essence Gold Facial", desc: '5-step gold ritual for timeless skin rejuvenation and luminosity.' },
    { name: 'Lotus Bridal Glow Facial', desc: 'Skin whitening and brightening ritual curated for special occasions.' },
    { name: 'De-Tan Face & Neck', desc: 'Gentle sun-tan removal formula designed to even out skin tone.' },
  ],
};

const FALLBACK_MEN_SERVICES: Record<string, Array<{ name: string; desc: string }>> = {
  'Haircuts & Classic Grooming': [
    { name: 'Normal Hair Cut', desc: 'Classic haircut tailored to your preferred length, fade, and face profile.' },
    { name: 'Traditional Clean Shave', desc: 'Razor shave with hot towel prep and calming aftershave balm.' },
    { name: 'Change of Style / Trend Cut', desc: 'Complete style redesign and consultation by senior stylists.' },
    { name: 'Beard Setting & Shaping', desc: 'Accurate beard trimming, cheek line sculpting, and detailing.' },
    { name: 'Head Shave', desc: 'Smooth, close head shave complete with scalp moisturization.' },
    { name: 'Kids Hair Cut (Up to 10 Yrs)', desc: 'Patient, gentle, and trendy haircut for children.' },
    { name: 'Head Shave for Kids', desc: 'Safe, careful, and hygienic traditional head shaving for kids.' },
    { name: 'Custom Beard Design', desc: 'Signature beard sculpting tailored to individual facial features.' },
    { name: 'Quick Beard Trim', desc: 'Neat shape maintenance and length trimming.' },
    { name: 'Hair Wash & Setting', desc: 'Deep cleansing shampoo, scalp conditioning, and blow-dry styling.' },
  ],
  'Scalp Therapies & Relaxation': [
    { name: 'Herbal Head Oil Massage', desc: 'Traditional warm oil massage to relieve tension and nourish roots.' },
    { name: 'Energizing Tonic Massage', desc: 'Refreshing botanical tonic massage to stimulate microcirculation.' },
    { name: 'Deep Cleansing Head Wash', desc: 'Refreshing wash eliminating product buildup and oil from scalp.' },
  ],
  'Hair & Beard Colouring': [
    { name: 'Grey Coverage', desc: 'Even, natural-looking permanent coverage for grey hair.' },
    { name: 'Ammonia-Free Grey Coverage', desc: 'Gentle scalp-friendly formula providing rich natural pigment.' },
    { name: 'Fashion & Trendy Colours', desc: 'Modern vibrant shades, highlights, and creative coloring.' },
    { name: "L'Oréal Professional Colour", desc: 'L’Oréal pigments offering radiant tones and long-lasting vibrancy.' },
    { name: 'Beard Colouring & Tinting', desc: 'Natural uniform shade application for beards and mustaches.' },
    { name: 'Dimension Highlights', desc: 'Artistic foil highlights adding texture and depth to your cut.' },
    { name: 'Crown Area Touch-up', desc: 'Targeted touch-ups focused on the top and crown regions.' },
  ],
  'Men’s Skin Care & De-Tan': [
    { name: 'De-Tan Face & Neck', desc: 'Sun-damage reversal and pore cleansing treatment for men.' },
    { name: 'Glowing Gold Facial', desc: 'Restorative gold facial removing dead skin cells and replenishing.' },
    { name: 'O3+ Brightening Express', desc: 'Instantly revives tired skin and controls excess oil.' },
  ],
};

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'women' | 'men'>('women');
  const [dbServices, setDbServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        if (data.services && data.services.length > 0) {
          setDbServices(data.services);
        }
      }
    } catch (e) {
      console.error('Failed to load services from catalogue:', e);
    } finally {
      setLoading(false);
    }
  };

  // Group services by category for current gender tab
  const getGroupedServices = (): Record<string, Array<{ name: string; desc: string }>> => {
    if (dbServices.length === 0) {
      return activeTab === 'women' ? FALLBACK_WOMEN_SERVICES : FALLBACK_MEN_SERVICES;
    }

    const filtered = dbServices.filter((s) => {
      const g = s.category?.gender?.toLowerCase();
      if (!g || g === 'unisex') return true;
      return g === activeTab;
    });

    if (filtered.length === 0) {
      return activeTab === 'women' ? FALLBACK_WOMEN_SERVICES : FALLBACK_MEN_SERVICES;
    }

    const groups: Record<string, Array<{ name: string; desc: string }>> = {};
    filtered.forEach((s) => {
      const catName = s.category?.name || (activeTab === 'women' ? "Women's Services" : "Men's Services");
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push({
        name: s.name,
        desc: s.description || (s.duration ? `Duration: ${s.duration} mins` : 'Professional salon service performed with precision and premium care.'),
      });
    });

    return groups;
  };

  const currentServices = getGroupedServices();

  return (
    <>
      <Navbar />

      <section className="section" style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-6))' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Service Catalogue</span>
            <h1 className="heading-lg">
              Unisex Salon <span className="text-accent">Services</span>
            </h1>
            <div className="section-divider" />
            <p>
              Explore our complete menu of professional hair styling, restorative spa treatments, hair forms, and skin aesthetics executed by certified specialists.
            </p>
          </div>

          {/* Compact Horizontal Tabs */}
          <div className="flex justify-center mb-6">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'women' ? 'active' : ''}`}
                onClick={() => setActiveTab('women')}
              >
                💇‍♀️ Women&apos;s Services
              </button>
              <button
                className={`tab ${activeTab === 'men' ? 'active' : ''}`}
                onClick={() => setActiveTab('men')}
              >
                💇‍♂️ Men&apos;s Services
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
              Loading services catalogue...
            </div>
          ) : (
            /* Service Categories Grid */
            Object.entries(currentServices).map(([category, servicesList]) => (
              <div key={category} style={{ marginBottom: 'var(--space-8)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  paddingBottom: '6px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                  <h2 className="heading-sm" style={{ color: '#FFFFFF', fontSize: '17px' }}>
                    {category}
                  </h2>
                  <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                    {servicesList.length} Services
                  </span>
                </div>

                <div className="services-grid">
                  {servicesList.map((service) => (
                    <div key={service.name} className="service-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--gold-400)', fontSize: '14px' }}>✦</span>
                        <h3 style={{ margin: 0 }}>{service.name}</h3>
                      </div>
                      <p>{service.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
