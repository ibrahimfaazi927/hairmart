'use client';

import { useEffect } from 'react';

export default function ScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll(
      '.animate-fade-up, .animate-fade-in, .animate-fade-left, .animate-fade-right, .animate-scale-in, .animate-stagger-item'
    );

    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
