// Debug script to test GitHub API from browser context
console.log('🔍 Debugging GitHub API...');
console.log('NEXT_PUBLIC_GITHUB_TOKEN:', process.env.NEXT_PUBLIC_GITHUB_TOKEN ? 'SET' : 'NOT SET');
console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'SET' : 'NOT SET');

// Test the fetchFeaturedProjects function
import { fetchFeaturedProjects } from './src/services/github-service.js';

fetchFeaturedProjects()
  .then(result => {
    console.log('✅ Success:', result);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });