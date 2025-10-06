#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitInfo() {
  try {
    // Get the latest commit hash and message
    const commitInfo = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
    const [hash, ...messageParts] = commitInfo.split(' ');
    const message = messageParts.join(' ');

    // Get the commit timestamp
    const timestamp = execSync('git show -s --format="%ai" HEAD', { encoding: 'utf8' }).trim();

    return {
      hash,
      message,
      timestamp
    };
  } catch (error) {
    console.warn('Could not get git info:', error.message);
    return {
      hash: 'unknown',
      message: 'Local development',
      timestamp: new Date().toISOString()
    };
  }
}

function generateGitInfo() {
  const gitInfo = getGitInfo();

  // Create the content for the .env file
  const envContent = `NEXT_PUBLIC_GIT_COMMIT_INFO='${JSON.stringify({
    hash: gitInfo.hash,
    message: gitInfo.message,
    timestamp: gitInfo.timestamp
  })}'\n`;

  // Write to .env.local if it exists, otherwise create it
  const envPath = path.join(process.cwd(), '.env.local');
  let existingContent = '';

  if (fs.existsSync(envPath)) {
    existingContent = fs.readFileSync(envPath, 'utf8');
    // Remove existing NEXT_PUBLIC_GIT_COMMIT_INFO line if it exists
    existingContent = existingContent
      .split('\n')
      .filter(line => !line.startsWith('NEXT_PUBLIC_GIT_COMMIT_INFO='))
      .join('\n');
  }

  const newContent = existingContent + envContent;
  fs.writeFileSync(envPath, newContent);

  console.log('✅ Generated git commit info:', gitInfo);
}

generateGitInfo();
