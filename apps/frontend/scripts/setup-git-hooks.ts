#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

const gitHooksDir = path.resolve(process.cwd(), '../../.git/hooks');
const frontendDir = process.cwd();

function createPreCommitHook() {
  const preCommitContent = `#!/bin/sh
# Pre-commit hook to sync blog metadata

echo "🔄 Pre-commit: Syncing blog metadata..."

# Check if any MDX files are staged
if git diff --cached --name-only | grep -E '\\.(mdx|md)$' > /dev/null; then
  echo "📝 MDX files detected in commit, syncing metadata..."
  cd ${frontendDir}
  npm run blog:sync
  
  if [ $? -ne 0 ]; then
    echo "❌ Blog sync failed. Commit aborted."
    exit 1
  fi
  
  echo "✅ Blog metadata synced successfully"
else
  echo "ℹ️  No MDX files in commit, skipping sync"
fi
`;

  const preCommitPath = path.join(gitHooksDir, 'pre-commit');
  fs.writeFileSync(preCommitPath, preCommitContent);
  fs.chmodSync(preCommitPath, '755');
  console.log('✅ Created pre-commit hook');
}

function createPostCommitHook() {
  const postCommitContent = `#!/bin/sh
# Post-commit hook to sync blog metadata

echo "🔄 Post-commit: Syncing blog metadata..."

# Check if any MDX files were committed
if git diff HEAD~1 --name-only | grep -E '\\.(mdx|md)$' > /dev/null; then
  echo "📝 MDX files were committed, syncing metadata..."
  cd ${frontendDir}
  npm run blog:sync
  
  if [ $? -eq 0 ]; then
    echo "✅ Blog metadata synced successfully"
  else
    echo "⚠️  Blog sync failed, but commit was successful"
  fi
else
  echo "ℹ️  No MDX files in commit, skipping sync"
fi
`;

  const postCommitPath = path.join(gitHooksDir, 'post-commit');
  fs.writeFileSync(postCommitPath, postCommitContent);
  fs.chmodSync(postCommitPath, '755');
  console.log('✅ Created post-commit hook');
}

function setupGitHooks() {
  console.log('🔧 Setting up Git hooks for blog automation...\n');

  if (!fs.existsSync(gitHooksDir)) {
    console.error('❌ Git hooks directory not found. Make sure you are in a Git repository.');
    console.error('Looking for:', gitHooksDir);
    process.exit(1);
  }

  try {
    createPreCommitHook();
    createPostCommitHook();
    
    console.log('\n✅ Git hooks setup completed!');
    console.log('\n📋 What happens now:');
    console.log('  • Pre-commit: Syncs metadata before committing MDX changes');
    console.log('  • Post-commit: Syncs metadata after committing MDX changes');
    console.log('\n💡 To disable hooks temporarily:');
    console.log('  git commit --no-verify');
  } catch (error) {
    console.error('❌ Failed to setup Git hooks:', error);
    process.exit(1);
  }
}

setupGitHooks();
