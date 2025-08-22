const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

const inventory = JSON.parse(fs.readFileSync('file-inventory.json', 'utf8'));
const renameMap = {};

inventory.files.forEach(file => {
  if (file.needsRename) {
    const dir = path.dirname(file.path);
    const ext = path.extname(file.filename);
    const baseName = path.basename(file.filename, ext);
    const newBaseName = toKebabCase(baseName);
    const newFileName = newBaseName + ext;
    const newPath = path.join(dir, newFileName);
    
    if (file.path !== newPath) {
      renameMap[file.relativePath] = path.relative(path.dirname(file.path), newPath).replace(/\\/g, '/');
      
      try {
        execSync(`git mv "${file.path}" "${newPath}"`, { stdio: 'inherit' });
        console.log(`Renamed: ${file.filename} -> ${newFileName}`);
      } catch (error) {
        console.error(`Failed to rename ${file.filename}: ${error.message}`);
      }
    }
  }
});

fs.writeFileSync('rename-map.json', JSON.stringify(renameMap, null, 2));
console.log(`\nRename map saved to rename-map.json`);
console.log(`Total renames: ${Object.keys(renameMap).length}`);
