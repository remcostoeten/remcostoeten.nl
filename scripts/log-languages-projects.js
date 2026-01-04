const https = require('https');

const GITHUB_USERNAME = 'remcostoeten';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// Projects from registry
const projects = [
  {
    slug: 'edge-commerce',
    title: 'Edge Commerce',
    stack: ['Next.js', 'Tailwind', 'Vercel Edge', 'Postgres', 'Stripe'],
    github: 'vercel/commerce'
  },
  {
    slug: 'spatial-canvas',
    title: 'Spatial Canvas',
    stack: ['Next.js', 'Tailwind', 'WebRTC', 'Framer Motion', 'Zustand'],
    github: 'tldraw/tldraw'
  },
  {
    slug: 'personal-portfolio',
    title: 'Personal Portfolio',
    stack: ['Next.js', 'Tailwind', 'MDX', 'PostHog', 'Vercel'],
  }
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Language-Fetcher'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔍 Fetching repositories from GitHub...\n');

  try {
    const repos = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);

    // Group repos by language
    const languageMap = {};

    repos.forEach(repo => {
      if (!repo.language) return;

      if (!languageMap[repo.language]) {
        languageMap[repo.language] = {
          count: 0,
          repos: []
        };
      }

      languageMap[repo.language].count++;
      languageMap[repo.language].repos.push({
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        description: repo.description
      });
    });

    // Sort languages by count
    const sortedLanguages = Object.entries(languageMap)
      .sort((a, b) => b[1].count - a[1].count);

    console.log('📊 Languages and Projects Summary:\n');
    console.log('='.repeat(80));

    sortedLanguages.forEach(([lang, data]) => {
      console.log(`\n🔹 ${lang}`);
      console.log(`   Count: ${data.count} repositories`);
      console.log(`   Projects:`);

      data.repos.forEach((repo, idx) => {
        const starsBadge = repo.stars > 0 ? ` ⭐ ${repo.stars}` : '';
        console.log(`      ${idx + 1}. ${repo.name}${starsBadge}`);
        console.log(`         URL: ${repo.url}`);
        if (repo.description) {
          console.log(`         ${repo.description.substring(0, 60)}...`);
        }
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📋 Showcase Array Format:\n');

    // Create showcase array
    const showcaseProjects = sortedLanguages
      .filter(([lang]) => {
        // Include languages with multiple repos or high-visibility projects
        const data = languageMap[lang];
        return data.count > 1 || data.repos.some(r => r.stars > 5);
      })
      .map(([lang, data]) => ({
        language: lang,
        count: data.count,
        featuredProjects: data.repos
          .sort((a, b) => b.stars - a.stars)
          .slice(0, 3)
          .map(repo => ({
            name: repo.name,
            url: repo.url,
            stars: repo.stars,
            forks: repo.forks
          }))
      }));

    console.log(JSON.stringify(showcaseProjects, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('\n🎨 Portfolio Projects:\n');

    projects.forEach(project => {
      console.log(`• ${project.title}`);
      console.log(`  Stack: ${project.stack.join(', ')}`);
      if (project.github) {
        console.log(`  GitHub: https://github.com/${project.github}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('403')) {
      console.log('\n💡 Tip: Set GITHUB_TOKEN environment variable for higher rate limits');
    }
  }
}

main();
