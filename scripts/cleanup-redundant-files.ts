import fg from 'fast-glob';
import fs from 'fs/promises';
import path from 'path';

type TCleanupConfig = {
  patterns: string[];
  allowlist: string[];
};

// Configuration for files to keep (default allowlist)
const DEFAULT_ALLOWLIST = [
  'node_modules/**',
  '.git/**',
  '.next/**',
  'dist/**',
  'build/**'
];

// Reads the glob patterns from a configuration file or fallback to defaults
async function readGlobPatterns(): Promise<string[]> {
  const configPath = path.join(process.cwd(), 'cleanup-config.json');
  
  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config: TCleanupConfig = JSON.parse(configContent);
    return config.patterns || [];
  } catch (error) {
    console.warn('No cleanup-config.json found, using default patterns');
    return [
      '**/*.log',
      '**/*.tmp',
      '**/temp/**',
      '**/.DS_Store',
      '**/Thumbs.db'
    ];
  }
}

// Reads the allowlist from configuration or returns defaults
async function readAllowlist(): Promise<string[]> {
  const configPath = path.join(process.cwd(), 'cleanup-config.json');
  
  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config: TCleanupConfig = JSON.parse(configContent);
    return config.allowlist || DEFAULT_ALLOWLIST;
  } catch (error) {
    return DEFAULT_ALLOWLIST;
  }
}

// Resolves file paths using fast-glob and filters them with the allowlist
function resolveFilePaths(patterns: string[], allowlist: string[]): string[] {
  const options = {
    ignore: allowlist,
    onlyFiles: false,
    absolute: true,
    dot: true
  };
  return fg.sync(patterns, options);
}

// Checks if a path exists before attempting deletion
async function pathExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

// Deletes files and directories with proper error handling
async function deletePaths(paths: string[]): Promise<void> {
  let deletedCount = 0;
  let errorCount = 0;
  
  for (const filepath of paths) {
    try {
      const exists = await pathExists(filepath);
      if (!exists) {
        console.log(`Skipped (not found): ${filepath}`);
        continue;
      }
      
      await fs.rm(filepath, { recursive: true, force: true });
      console.log(`Deleted: ${filepath}`);
      deletedCount++;
    } catch (error) {
      console.error(`Failed to delete: ${filepath}, ${error}`);
      errorCount++;
    }
  }
  
  console.log(`\nCleanup completed: ${deletedCount} items deleted, ${errorCount} errors`);
}

// The main function to orchestrate the cleanup
async function main(): Promise<void> {
  try {
    console.log('Starting cleanup process...');
    
    const patterns = await readGlobPatterns();
    const allowlist = await readAllowlist();
    
    console.log('Patterns to match:', patterns);
    console.log('Allowlist (protected):', allowlist);
    
    const pathsToDelete = resolveFilePaths(patterns, allowlist);
    
    if (pathsToDelete.length === 0) {
      console.log('No files found matching the patterns.');
      return;
    }
    
    console.log(`Found ${pathsToDelete.length} items to delete`);
    await deletePaths(pathsToDelete);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

