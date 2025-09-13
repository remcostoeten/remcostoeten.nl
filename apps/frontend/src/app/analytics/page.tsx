"use client";

import React from 'react';
import { Navigation } from '@/components/navigation';
import { AnalyticsDashboard, PageTracker, AnalyticsErrorBoundary } from '@/components/analytics';
import { BarChart3 } from 'lucide-react';

const navigationItems = [
  { label: 'Home', href: '/', isActive: false },
  { label: 'All posts', href: '/posts', isActive: false },
  { label: 'Analytics', href: '/analytics', isActive: true },
  { label: 'Contact', href: '/contact', isActive: false },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#171616' }}>
      <PageTracker customTitle="Analytics Dashboard - Blog" />
      <Navigation navigationItems={navigationItems} />
      
      <main className="pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-8 w-8 text-orange-400" />
              <h1 className="text-4xl font-bold text-white">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-stone-400 text-lg">
              Comprehensive insights into your blog's performance and visitor engagement.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Overview</h2>
            <AnalyticsErrorBoundary>
              <AnalyticsDashboard compact />
            </AnalyticsErrorBoundary>
          </div>

          {/* Detailed Dashboard */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Detailed Analytics</h2>
            <AnalyticsErrorBoundary>
              <AnalyticsDashboard />
            </AnalyticsErrorBoundary>
          </div>

          {/* Analytics Notes */}
          <div className="bg-stone-800/30 rounded-lg p-6 border border-stone-700/50">
            <h3 className="text-lg font-semibold text-white mb-3">About These Analytics</h3>
            <div className="text-stone-400 space-y-2 text-sm">
              <p>• <strong className="text-stone-300">Pageviews:</strong> Total page loads across your entire site</p>
              <p>• <strong className="text-stone-300">Visitors:</strong> Unique individuals who visited your blog</p>
              <p>• <strong className="text-stone-300">Blog Views:</strong> Specific tracking for blog post engagement</p>
              <p>• <strong className="text-stone-300">Session Tracking:</strong> Views are deduplicated per browser session</p>
              <p>• <strong className="text-stone-300">Privacy First:</strong> No personal data is collected, only anonymous analytics</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
