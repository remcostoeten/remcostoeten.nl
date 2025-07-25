#!/usr/bin/env tsx

import { db } from '../src/db/connection';
import { analyticsEvents } from '../src/db/schema';

const sampleCountries = [
  { country: 'United States', region: 'California', city: 'San Francisco', lat: '37.7749', lng: '-122.4194' },
  { country: 'United States', region: 'New York', city: 'New York', lat: '40.7128', lng: '-74.0060' },
  { country: 'United Kingdom', region: 'England', city: 'London', lat: '51.5074', lng: '-0.1278' },
  { country: 'Germany', region: 'Berlin', city: 'Berlin', lat: '52.5200', lng: '13.4050' },
  { country: 'France', region: 'Île-de-France', city: 'Paris', lat: '48.8566', lng: '2.3522' },
  { country: 'Netherlands', region: 'North Holland', city: 'Amsterdam', lat: '52.3676', lng: '4.9041' },
  { country: 'Canada', region: 'Ontario', city: 'Toronto', lat: '43.6532', lng: '-79.3832' },
  { country: 'Australia', region: 'New South Wales', city: 'Sydney', lat: '-33.8688', lng: '151.2093' },
  { country: 'Japan', region: 'Tokyo', city: 'Tokyo', lat: '35.6762', lng: '139.6503' },
];

const samplePages = [
  '/',
  '/about',
  '/projects',
  '/contact',
  '/projects/portfolio-website',
  '/projects/e-commerce-app',
  '/blog',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateRandomTimestamp(): Date {
  const now = new Date();
  const daysBack = Math.floor(Math.random() * 30); // Random day in last 30 days
  const hoursBack = Math.floor(Math.random() * 24); // Random hour
  const minutesBack = Math.floor(Math.random() * 60); // Random minute
  
  const timestamp = new Date(now);
  timestamp.setDate(timestamp.getDate() - daysBack);
  timestamp.setHours(timestamp.getHours() - hoursBack);
  timestamp.setMinutes(timestamp.getMinutes() - minutesBack);
  
  return timestamp;
}

async function createSampleAnalyticsData(): Promise<void> {
  console.log('Creating sample analytics data with geographic information...');
  
  const events = [];
  const sessions = new Set<string>();
  
  // Generate 100 random page view events
  for (let i = 0; i < 100; i++) {
    const location = getRandomElement(sampleCountries);
    const page = getRandomElement(samplePages);
    const sessionId = generateSessionId();
    const timestamp = generateRandomTimestamp();
    
    // Ensure we have some returning visitors
    const existingSessionId = sessions.size > 0 && Math.random() < 0.3 
      ? Array.from(sessions)[Math.floor(Math.random() * sessions.size)]
      : sessionId;
    
    sessions.add(existingSessionId);
    
    events.push({
      eventType: 'page_view',
      page,
      referrer: Math.random() < 0.6 ? null : 'https://google.com',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      sessionId: existingSessionId,
      userId: null,
      data: null,
      timestamp,
      country: location.country,
      region: location.region,
      city: location.city,
      latitude: location.lat,
      longitude: location.lng,
    });
  }
  
  // Generate some session start events
  for (const sessionId of Array.from(sessions).slice(0, 50)) {
    const location = getRandomElement(sampleCountries);
    const timestamp = generateRandomTimestamp();
    
    events.push({
      eventType: 'session_start',
      page: null,
      referrer: null,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      sessionId,
      userId: null,
      data: {
        timezone: 'UTC',
        screenWidth: 1920,
        screenHeight: 1080,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timestamp,
      country: location.country,
      region: location.region,
      city: location.city,
      latitude: location.lat,
      longitude: location.lng,
    });
  }
  
  try {
    await db.insert(analyticsEvents).values(events);
    
    console.log(`✅ Successfully created ${events.length} sample analytics events`);
    console.log(`📊 Unique sessions: ${sessions.size}`);
    console.log(`🌍 Countries represented: ${[...new Set(events.map(e => e.country))].length}`);
    console.log(`🏙️ Cities represented: ${[...new Set(events.map(e => e.city))].length}`);
    
    // Display summary by country
    const countryStats = events
      .filter(e => e.eventType === 'page_view')
      .reduce((acc: Record<string, number>, event) => {
        acc[event.country] = (acc[event.country] || 0) + 1;
        return acc;
      }, {});
    
    console.log('\\n📍 Page views by country:');
    Object.entries(countryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([country, count]) => {
        console.log(`  ${country}: ${count} views`);
      });
      
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    await createSampleAnalyticsData();
    console.log('\\n🎉 Sample data creation completed!');
    console.log('\\nYou can now visit your analytics dashboard to see geographic data.');
    console.log('Run: npm run dev:full');
    console.log('Then visit: http://localhost:3333/analytics');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
