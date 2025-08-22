const fs = require('fs');
const path = require('path');

function findAllSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.') && file !== 'dist') {
      findAllSourceFiles(filePath, fileList);
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let changes = [];
  
  // 1. Remove all comments (except JSDoc)
  content = content.replace(/\/\/[^\n]*/g, '');
  content = content.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, (match) => {
    if (match.includes('/**') && match.includes('@')) {
      return match; // Keep JSDoc
    }
    return '';
  });
  
  // 2. Convert arrow functions to function declarations
  content = content.replace(/(?:export\s+)?const\s+(\w+)\s*=\s*\((.*?)\)\s*(?::\s*[^=]+)?\s*=>\s*{/g, (match, name, params) => {
    if (match.startsWith('export')) {
      changes.push(`Converted arrow function: export const ${name}`);
      return `export function ${name}(${params}) {`;
    }
    changes.push(`Converted arrow function: const ${name}`);
    return `function ${name}(${params}) {`;
  });
  
  // Handle single-expression arrow functions
  content = content.replace(/(?:export\s+)?const\s+(\w+)\s*=\s*\((.*?)\)\s*(?::\s*[^=]+)?\s*=>\s*([^{].*?);/g, (match, name, params, body) => {
    if (match.startsWith('export')) {
      changes.push(`Converted arrow function: export const ${name}`);
      return `export function ${name}(${params}) { return ${body}; }`;
    }
    changes.push(`Converted arrow function: const ${name}`);
    return `function ${name}(${params}) { return ${body}; }`;
  });
  
  // 3. Convert default exports to named exports
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Check if it's main.tsx (entry point) - skip it
  if (fileName === 'main' || fileName === 'vite-env.d') {
    // Skip conversion for entry files
  } else {
    // Handle: export default function ComponentName
    content = content.replace(/export\s+default\s+function\s+(\w+)/g, (match, name) => {
      changes.push(`Converted default export: ${name}`);
      return `export function ${name}`;
    });
    
    // Handle: export default ComponentName
    content = content.replace(/export\s+default\s+(\w+);?\s*$/gm, (match, name) => {
      changes.push(`Converted default export reference: ${name}`);
      return `export { ${name} };`;
    });
  }
  
  // 4. Convert interfaces to types with T prefix
  content = content.replace(/interface\s+(\w+)/g, (match, name) => {
    const newName = name.startsWith('T') ? name : `T${name}`;
    changes.push(`Converted interface ${name} to type ${newName}`);
    return `type ${newName}`;
  });
  
  // 5. Add T prefix to type declarations that don't have it
  content = content.replace(/type\s+([a-z]\w*)\s*=/g, (match, name) => {
    if (!name.startsWith('T')) {
      const newName = `T${name.charAt(0).toUpperCase()}${name.slice(1)}`;
      changes.push(`Added T prefix to type: ${name} -> ${newName}`);
      
      // Replace all occurrences of the old type name
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      content = content.replace(regex, newName);
      
      return `type ${newName} =`;
    }
    return match;
  });
  
  // 6. Rename single non-exported prop types to TProps
  const typeMatches = content.match(/type\s+T\w+\s*=\s*{[^}]+}/g) || [];
  const nonExportedTypes = typeMatches.filter(t => !content.includes(`export ${t.split('=')[0].trim()}`));
  
  if (nonExportedTypes.length === 1) {
    const oldTypeName = nonExportedTypes[0].match(/type\s+(T\w+)/)[1];
    if (oldTypeName !== 'TProps') {
      changes.push(`Renamed single props type: ${oldTypeName} -> TProps`);
      const regex = new RegExp(`\\b${oldTypeName}\\b`, 'g');
      content = content.replace(regex, 'TProps');
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`\nRefactored: ${path.relative(process.cwd(), filePath)}`);
    changes.forEach(change => console.log(`  - ${change}`));
    return true;
  }
  
  return false;
}

console.log('Starting code style refactoring...\n');

const sourceFiles = [
  ...findAllSourceFiles(path.join(__dirname, 'src')),
  ...findAllSourceFiles(path.join(__dirname, 'convex')).filter(f => !f.includes('_generated'))
];

let refactoredCount = 0;

sourceFiles.forEach(file => {
  if (refactorFile(file)) {
    refactoredCount++;
  }
});

console.log(`\n✅ Refactoring complete!`);
console.log(`   Total files processed: ${sourceFiles.length}`);
console.log(`   Files modified: ${refactoredCount}`);
