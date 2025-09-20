#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up development environment for real analytics...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully');
  } else {
    // Create a basic .env file
    const basicEnvContent = `# Storage Configuration
STORAGE_TYPE=database

# PostgreSQL Database Configuration
# Replace with your actual database URL
DATABASE_URL="postgresql://username:password@localhost:5432/analytics"

# Server Configuration
PORT=4001
`;
    fs.writeFileSync(envPath, basicEnvContent);
    console.log('✅ Basic .env file created');
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Next steps:');
console.log('1. Update the DATABASE_URL in your .env file with your actual database connection string');
console.log('2. Run: npm install');
console.log('3. Run: npx drizzle-kit generate');
console.log('4. Run: npx drizzle-kit migrate');
console.log('5. Run: npm run dev');
console.log('\n💡 For detailed setup instructions, see setup-database.md');

console.log('\n🎉 Development environment setup complete!');


