"use client";

import { Navigation } from '@/components/navigation';

const navigationItems = [
  { label: 'Home', href: '/', isActive: false },
  { label: 'All posts', href: '/posts', isActive: false },
  { label: 'Contact', href: '/contact', isActive: true },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: '#171616' }}>
      <Navigation navigationItems={navigationItems} />
      
      <main className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-white mb-4">
              Contact
            </h1>
            <p style={{ fontSize: '16px', color: '#aba9a7', lineHeight: '1.7' }}>
              Get in touch for collaborations and inquiries.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}