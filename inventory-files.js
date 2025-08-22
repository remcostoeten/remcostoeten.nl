const fs = require('fs');
const path = require('path');

function findSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      findSourceFiles(filePath, fileList);
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const srcPath = path.join(__dirname, 'src');
const convexPath = path.join(__dirname, 'convex');
const sourceFiles = [
  ...findSourceFiles(srcPath),
  ...findSourceFiles(convexPath).filter(f => !f.includes('_generated'))
];

const inventory = {
  timestamp: new Date().toISOString(),
  totalFiles: sourceFiles.length,
  files: sourceFiles.map(file => ({
    path: file,
    relativePath: path.relative(__dirname, file),
    filename: path.basename(file),
    needsRename: !path.basename(file).match(/^[a-z][a-z0-9-]*\.(tsx?|jsx?)$/)
  }))
};

fs.writeFileSync('file-inventory.json', JSON.stringify(inventory, null, 2));
console.log(`Found ${inventory.totalFiles} source files`);
console.log(`Files needing rename: ${inventory.files.filter(f => f.needsRename).length}`);
