// Test script to verify GitHub API integration
import { GitHub } from '@remcostoeten/fync';

const github = GitHub({ 
  token: 'github_pat_11ANYC3MQ0Hn2RdKXNV9tt_0DZHM9DdjAhxYmX6yCkS89LWNoz4zI0geWEUOtSNxaVN5GA722G'
});

async function testGitHubAPI() {
  console.log('🔄 Testing GitHub API with fync...');
  
  const repos = [
    'nextjs-15-roll-your-own-authentication',
    'remcostoeten.nl'
  ];
  
  for (const repoName of repos) {
    try {
      console.log(`\n📦 Fetching ${repoName}...`);
      
      const repo = await github.repos.getRepo({ 
        owner: 'remcostoeten', 
        repo: repoName 
      });
      
      console.log(`✅ ${repo.name}`);
      console.log(`   📝 ${repo.description || 'No description'}`);
      console.log(`   ⭐ ${repo.stargazers_count} stars`);
      console.log(`   🍴 ${repo.forks_count} forks`);
      console.log(`   💻 ${repo.language || 'Unknown language'}`);
      console.log(`   🔗 ${repo.html_url}`);
      console.log(`   📅 Updated: ${new Date(repo.updated_at).toLocaleDateString()}`);
      
      if (repo.topics && repo.topics.length > 0) {
        console.log(`   🏷️  Topics: ${repo.topics.join(', ')}`);
      }
      
    } catch (error) {
      console.error(`❌ Error fetching ${repoName}:`, error.message);
    }
  }
}

testGitHubAPI().catch(console.error);