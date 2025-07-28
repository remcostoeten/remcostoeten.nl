import * as fs from 'fs';
import * as path from 'path';

type TViolation = {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  code: string;
};

type TLintResults = {
  violations: TViolation[];
  filesScanned: number;
  violationsCount: number;
};

function scanDirectory(dirPath: string): string[] {
  const files: string[] = [];
  
  function walkDir(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && !entry.name.includes('node_modules')) {
          walkDir(fullPath);
        }
      } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dirPath);
  return files;
}

function checkArrowFunctionConstants(content: string, filePath: string): TViolation[] {
  const violations: TViolation[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for arrow function constants
    const arrowFunctionRegex = /^(export\s+)?const\s+\w+\s*=\s*(\([^)]*\)\s*)?=>/;
    const match = arrowFunctionRegex.exec(trimmedLine);
    
    if (match) {
      violations.push({
        file: filePath,
        line: i + 1,
        column: line.indexOf('const') + 1,
        rule: 'no-arrow-function-constants',
        message: 'Arrow function constants are not allowed. Use function declarations instead.',
        code: trimmedLine
      });
    }
  }
  
  return violations;
}

function checkClassKeywords(content: string, filePath: string): TViolation[] {
  const violations: TViolation[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for class declarations (but ignore comments)
    if (!trimmedLine.startsWith('//') && (trimmedLine.startsWith('class ') || trimmedLine.includes(' class '))) {
      violations.push({
        file: filePath,
        line: i + 1,
        column: line.indexOf('class') + 1,
        rule: 'no-classes',
        message: 'Classes are not allowed. Use functional style instead.',
        code: trimmedLine
      });
    }
  }
  
  return violations;
}

function checkDefaultExports(content: string, filePath: string): TViolation[] {
  const violations: TViolation[] = [];
  const lines = content.split('\n');
  
  // Check if this is a Next.js route/page file
  const isNextRoute = filePath.includes('/routes/') || filePath.includes('/pages/');
  const isStorybook = filePath.includes('.stories.');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for default exports
    if (trimmedLine.startsWith('export default ')) {
      // Allow default exports for Next.js routes/pages and Storybook stories
      if (!isNextRoute && !isStorybook) {
        violations.push({
          file: filePath,
          line: i + 1,
          column: line.indexOf('export default') + 1,
          rule: 'no-default-exports',
          message: 'Default exports are not allowed except for Next.js pages/routes and Storybook stories. Use named exports instead.',
          code: trimmedLine
        });
      }
    }
  }
  
  return violations;
}

function checkInterfaceUsage(content: string, filePath: string): TViolation[] {
  const violations: TViolation[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for interface declarations (but ignore comments)
    if (!trimmedLine.startsWith('//') && (trimmedLine.startsWith('interface ') || trimmedLine.includes(' interface '))) {
      violations.push({
        file: filePath,
        line: i + 1,
        column: line.indexOf('interface') + 1,
        rule: 'no-interfaces',
        message: 'Interfaces are not allowed. Use type declarations instead.',
        code: trimmedLine
      });
    }
  }
  
  return violations;
}

function checkTypeNaming(content: string, filePath: string): TViolation[] {
  const violations: TViolation[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for type declarations that don't start with T
    const typeRegex = /^(export\s+)?type\s+([A-Za-z][A-Za-z0-9]*)/;
    const match = typeRegex.exec(trimmedLine);
    
    if (match) {
      const typeName = match[2];
      if (!typeName.startsWith('T')) {
        violations.push({
          file: filePath,
          line: i + 1,
          column: line.indexOf('type') + 1,
          rule: 'type-naming',
          message: `Type names must be prefixed with 'T'. Found: ${typeName}`,
          code: trimmedLine
        });
      }
    }
  }
  
  return violations;
}

async function lintFile(filePath: string): Promise<TViolation[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations: TViolation[] = [];
  
  violations.push(...checkArrowFunctionConstants(content, filePath));
  violations.push(...checkClassKeywords(content, filePath));
  violations.push(...checkDefaultExports(content, filePath));
  violations.push(...checkInterfaceUsage(content, filePath));
  violations.push(...checkTypeNaming(content, filePath));
  
  return violations;
}

async function lintRules(rootPath: string = '.'): Promise<TLintResults> {
  console.log('🔍 Scanning for rule violations...\n');
  
  const files = scanDirectory(rootPath);
  const allViolations: TViolation[] = [];
  
  for (const file of files) {
    const violations = await lintFile(file);
    allViolations.push(...violations);
  }
  
  return {
    violations: allViolations,
    filesScanned: files.length,
    violationsCount: allViolations.length
  };
}

function printResults(results: TLintResults) {
  console.log(`📊 Scanned ${results.filesScanned} TypeScript files`);
  console.log(`❌ Found ${results.violationsCount} rule violations\n`);
  
  if (results.violations.length === 0) {
    console.log('✅ No rule violations found!');
    return;
  }
  
  // Group violations by file
  const violationsByFile = new Map<string, TViolation[]>();
  
  for (const violation of results.violations) {
    const existing = violationsByFile.get(violation.file) || [];
    existing.push(violation);
    violationsByFile.set(violation.file, existing);
  }
  
  // Print violations grouped by file
  for (const [file, violations] of violationsByFile.entries()) {
    console.log(`\n📄 ${file}`);
    console.log('─'.repeat(file.length + 4));
    
    for (const violation of violations) {
      console.log(`  ${violation.line}:${violation.column} - ${violation.rule}`);
      console.log(`    ${violation.message}`);
      console.log(`    ${violation.code}`);
      console.log('');
    }
  }
  
  // Summary by rule type
  const ruleCount = new Map<string, number>();
  for (const violation of results.violations) {
    ruleCount.set(violation.rule, (ruleCount.get(violation.rule) || 0) + 1);
  }
  
  console.log('\n📈 Violations by rule:');
  for (const [rule, count] of ruleCount.entries()) {
    console.log(`  ${rule}: ${count}`);
  }
}

async function main() {
  try {
    const results = await lintRules('.');
    printResults(results);
    
    if (results.violationsCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running lint rules:', error);
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { lintRules, type TViolation, type TLintResults };
