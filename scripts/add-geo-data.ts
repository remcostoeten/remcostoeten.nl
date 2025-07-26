#!/usr/bin/env tsx

import { db, analyticsEvents } from './db';

const geoData = [
  { country: 'United States', region: 'California', city: 'San Francisco' },
  { country: 'United States', region: 'New York', city: 'New York' },
  { country: 'United Kingdom', region: 'England', city: 'London' },
  { country: 'Germany', region: 'Berlin', city: 'Berlin' },
  { country: 'France', region: 'Île-de-France', city: 'Paris' },
  { country: 'Netherlands', region: 'North Holland', city: 'Amsterdam' },
];

async function addGeoData() {
  console.log('Adding geographic data...');
  
  const events = geoData.map((geo, index) => ({
    eventType: 'page_view' as const,
    page: '/',
    referrer: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ipAddress: `203.0.113.${index + 1}`,
    sessionId: `geo_session_${index + 1}`,
    userId: null,
    data: null,
    timestamp: new Date(),
    ...geo,
    latitude: null,
    longitude: null,
  }));

  await db.insert(analyticsEvents).values(events);
  
  console.log(`✅ Added ${events.length} events with geographic data`);
  console.log('🌍 Countries:', geoData.map(g => g.country).join(', '));
}

addGeoData().catch(console.error);
