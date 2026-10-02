'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const galleryCategories = ['All', 'Styling Stations', 'Skincare & Spa', 'Tools & Craft', 'Storefront'];

const galleryItems = [
  {
    id: '1',
    title: 'Hair Mart Luxury Styling Stations & Vanity Lighting',
    category: 'Styling Stations',
    image: '/images/salon/hero-bg.jpg',
    description: 'High-end styling stations equipped with back-lit vertical vanity mirrors, ergonomic cognac leather barber recliners, and polished marble design.',
  },
  {
    id: '2',
    title: 'Facial Spa Suite & Professional Skin Therapy',
    category: 'Skincare & Spa',
    image: '/images/salon/skincare-treatment.jpg',
    description: 'Serene facial treatment suite featuring gold-standard O3+ and Nature’s Essence skincare formulations in a hygienic environment.',
  },
  {
    id: '3',
    title: 'Artisan Barber Tools & Professional Haircare',
    category: 'Tools & Craft',
    image: '/images/salon/hair-styling.jpg',
    description: 'Precision Japanese barber scissors, high-performance styling tools, and salon-exclusive grooming essentials.',
  },
  {
    id: '4',
    title: 'Hair Mart Studio Storefront — Surathkal',
    category: 'Storefront',
    image: '/images/salon/salon-storefront.jpg',
    description: 'Official storefront of Hair Mart Studio Unisex Family Salon located on the main road near Vishal Mart in Surathkal.',
  },
  {
    id: '5',
    title: 'Restorative Hair Spa & Bonding Treatments',
    category: 'Styling Stations',
    image: '/images/salon/hero-bg.jpg',
    description: 'Dedicated hair transformation stations for Fibre Clinix bond repair, keratin infusion, and permanent hair smoothening.',
  },
  {
    id: '6',
    title: 'Dermatological Facial & Bridal Glow Rituals',
    category: 'Skincare & Spa',
    image: '/images/salon/skincare-treatment.jpg',
    description: 'Specialized 5-step gold facials, de-tan therapies, and pre-wedding bridal skin rejuvenation.',
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
