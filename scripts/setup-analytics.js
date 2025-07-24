#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Analytics System...\n');

// Check if Docker is running
const { execSync } = require('child_process');

try {
  execSync('docker --version', { stdio: 'ignore' });
  console.log('✅ Docker found');
} catch (error) {
  console.log('❌ Docker not found. Please install Docker first.');
  process.exit(1);
}

// Start database
console.log('🚀 Starting PostgreSQL database...');
try {
  execSync('docker-compose up -d postgres', { stdio: 'inherit' });
  console.log('✅ Database started');
} catch (error) {
  console.log('❌ Failed to start database');
  process.exit(1);
}

// Wait a bit for database to be ready
console.log('⏳ Waiting for database to be ready...');
setTimeout(() => {
  // Run migrations
  console.log('📊 Setting up database schema...');
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('✅ Database schema created');
  } catch (error) {
    console.log('❌ Failed to create schema');
    process.exit(1);
  }

  // Seed with sample data
  console.log('🌱 Adding sample analytics data...');
  try {
    execSync('npm run db:seed', { stdio: 'inherit' });
    console.log('✅ Sample data added');
  } catch (error) {
    console.log('⚠️  Could not add sample data (optional)');
  }

  console.log('\n🎉 Analytics setup complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Add analytics routes to your app');
  console.log('   2. Wrap your app with <AnalyticsProvider>');
  console.log('   3. Visit /analytics to see the dashboard');
  console.log('\n📖 Check ANALYTICS.md for detailed usage');
}, 3000);
