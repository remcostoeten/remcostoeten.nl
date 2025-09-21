#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { execSync } from 'child_process';

const contentDirectory = path.join(process.cwd(), 'content/blog');
const syncScript = path.join(process.cwd(), 'scripts/sync-blog-metadata.ts');

function runSync() {
  try {
    console.log('🔄 Blog content changed, syncing metadata...');
    execSync(`tsx ${syncScript}`, { stdio: 'inherit' });
    console.log('✅ Sync completed\n');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

function startWatcher() {
  console.log('👀 Watching for blog content changes...');
  console.log(`📁 Watching directory: ${contentDirectory}`);
  console.log('Press Ctrl+C to stop\n');

  if (!fs.existsSync(contentDirectory)) {
    console.error(`❌ Content directory not found: ${contentDirectory}`);
    process.exit(1);
  }

  // Initial sync
  runSync();

  // Watch for changes
  const watcher = chokidar.watch(contentDirectory, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('add', (filePath) => {
      if (filePath.endsWith('.mdx') || filePath.endsWith('.md')) {
        console.log(`📝 New file detected: ${path.basename(filePath)}`);
        runSync();
      }
    })
    .on('change', (filePath) => {
      if (filePath.endsWith('.mdx') || filePath.endsWith('.md')) {
        console.log(`📝 File modified: ${path.basename(filePath)}`);
        runSync();
      }
    })
    .on('unlink', (filePath) => {
      if (filePath.endsWith('.mdx') || filePath.endsWith('.md')) {
        console.log(`🗑️  File deleted: ${path.basename(filePath)}`);
        runSync();
      }
    })
    .on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping watcher...');
    watcher.close();
    process.exit(0);
  });
}

startWatcher();
