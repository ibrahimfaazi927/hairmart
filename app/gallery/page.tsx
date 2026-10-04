'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const galleryCategories = ['All', 'Styling Stations', 'Skincare & Spa', 'Tools & Craft', 'Storefront'];

const galleryItems = [
  {
    id: '1',
    title: 'Hair Mart Main Interior — Pink Accent Styling Zone',
    category: 'Styling Stations',
    image: '/images/salon/salon-interior-main.jpg',
    description: 'The signature pink accent wall with gold-lit vanity mirrors, cognac leather barber chairs, and premium styling stations at Hair Mart Studio.',
  },
  {
    id: '2',
    title: 'Private Styling Station — Luxury Grooming Suite',
    category: 'Styling Stations',
    image: '/images/salon/salon-styling-station.jpg',
    description: 'Exclusive private styling booth featuring a back-lit Hair Mart branded mirror, ergonomic leather recliner, and wooden vanity with tool organiser.',
  },
  {
    id: '3',
    title: 'Professional Hair Wash & Spa Station',
    category: 'Skincare & Spa',
    image: '/images/salon/salon-wash-area.jpg',
    description: 'Dedicated hair wash and scalp spa station with ceramic backwash basin, cushioned recliners, and elegant gold-veined marble wall finish.',
  },
  {
    id: '4',
    title: 'Advanced Hydrafacial & Skincare Equipment',
    category: 'Tools & Craft',
    image: '/images/salon/salon-skincare-equipment.jpg',
    description: 'State-of-the-art 7-in-1 hydrafacial machine, LED light therapy mask, and curated collection of professional skincare and hair treatment products.',
  },
  {
    id: '5',
    title: 'Hair Mart Studio — Storefront at Night',
    category: 'Storefront',
    image: '/images/salon/salon-storefront-night.jpg',
    description: 'The illuminated Hair Mart Studio Unisex Family Salon storefront on the main road near Vishal Mart, Surathkal — open for men, women & kids.',
  },
  {
    id: '6',
    title: 'Hair Mart Luxury Styling Stations & Vanity Lighting',
    category: 'Styling Stations',
    image: '/images/salon/hero-bg.jpg',
    description: 'High-end styling stations equipped with back-lit vertical vanity mirrors, ergonomic cognac leather barber recliners, and polished marble design.',
  },
  {
    id: '7',
    title: 'Facial Spa Suite & Professional Skin Therapy',
    category: 'Skincare & Spa',
    image: '/images/salon/skincare-treatment.jpg',
    description: 'Serene facial treatment suite featuring gold-standard O3+ and Nature\'s Essence skincare formulations in a hygienic environment.',
  },
  {
    id: '8',
    title: 'Artisan Barber Tools & Professional Haircare',
    category: 'Tools & Craft',
    image: '/images/salon/hair-styling.jpg',
    description: 'Precision Japanese barber scissors, high-performance styling tools, and salon-exclusive grooming essentials.',
  },
  {
    id: '9',
    title: 'Hair Mart Studio Storefront — Surathkal',
    category: 'Storefront',
    image: '/images/salon/salon-storefront.jpg',
    description: 'Official storefront of Hair Mart Studio Unisex Family Salon located on the main road near Vishal Mart in Surathkal.',
  },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeImage, setActiveImage] = useState<typeof galleryItems[0] | null>(null);

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <>
      <Navbar />

      <section className="section" style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-6))' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Visual Tour</span>
            <h1 className="heading-lg">
              Studio <span className="text-accent">Gallery</span>
            </h1>
            <div className="section-divider" />
            <p>
              Explore the studio environment of Hair Mart in Surathkal—from modern lighting and styling stations to authentic professional products and spa suites.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex justify-center mb-6 flex-wrap gap-2">
            {galleryCategories.map((category) => (
              <button
                key={category}
                className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid (2 Columns on Mobile) */}
          <div className="gallery-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="gallery-item"
                onClick={() => setActiveImage(item)}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                  />
                  <div className="gallery-item-overlay">
                    <div>
                      <span className="badge badge-gold" style={{ marginBottom: '4px', fontSize: '9.5px' }}>{item.category}</span>
                      <div className="gallery-item-title">{item.title}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Modal without redundant CTA buttons */}
          {activeImage && (
            <div className="lightbox" onClick={() => setActiveImage(null)}>
              <button className="lightbox-close" onClick={() => setActiveImage(null)} aria-label="Close modal">
                ✕
              </button>
              <div
                style={{
                  maxWidth: '750px',
                  width: '95%',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={activeImage.image}
                  alt={activeImage.title}
                  style={{ width: '100%', maxHeight: '55vh', objectFit: 'cover' }}
                />
                <div style={{ padding: '16px' }}>
                  <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                    <h3 className="heading-xs" style={{ color: '#FFFFFF', fontSize: '16px' }}>{activeImage.title}</h3>
                    <span className="badge badge-gold">{activeImage.category}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    {activeImage.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
