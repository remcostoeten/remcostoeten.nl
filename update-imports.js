const fs = require('fs');
const path = require('path');

const renameMap = {
  "src/App.tsx": "app.tsx",
  "src/SignInForm.tsx": "sign-in-form.tsx",  
  "src/SignOutButton.tsx": "sign-out-button.tsx",
  "src/components/AdminCMS.tsx": "admin-cms.tsx",
  "src/components/RichTextEditor.tsx": "rich-text-editor.tsx",
  "src/components/EnhancedAdminCMS.tsx": "enhanced-admin-cms.tsx",
  "src/components/Widget.tsx": "widget.tsx",
  "src/components/AdminCMS-old.tsx": "admin-cms-old.tsx",
  "src/components/HomePage.tsx": "home-page.tsx"
};

function findAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.') && file !== 'dist') {
      findAllFiles(filePath, fileList);
    } else if (file.match(/\.(tsx?|jsx?|js|mjs|cjs)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Update imports for renamed files
  content = content.replace(/from\s+["']([^"']+)["']/g, (match, importPath) => {
    // Handle App -> app
    if (importPath.includes('./App') || importPath.includes('../App')) {
      const newPath = importPath.replace(/\/App($|")/, '/app$1');
      updated = true;
      return `from "${newPath}"`;
    }
    
    // Handle other component renames
    if (importPath.includes('HomePage')) {
      updated = true;
      return match.replace('HomePage', 'home-page');
    }
    if (importPath.includes('AdminCMS')) {
      updated = true;
      return match.replace('AdminCMS', 'admin-cms');
    }
    if (importPath.includes('EnhancedAdminCMS')) {
      updated = true;
      return match.replace('EnhancedAdminCMS', 'enhanced-admin-cms');
    }
    if (importPath.includes('RichTextEditor')) {
      updated = true;
      return match.replace('RichTextEditor', 'rich-text-editor');
    }
    if (importPath.includes('SignInForm')) {
      updated = true;
      return match.replace('SignInForm', 'sign-in-form');
    }
    if (importPath.includes('SignOutButton')) {
      updated = true;
      return match.replace('SignOutButton', 'sign-out-button');
    }
    if (importPath.includes('Widget')) {
      updated = true;
      return match.replace('Widget', 'widget');
    }
    
    return match;
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in: ${path.relative(process.cwd(), filePath)}`);
  }
}

const allFiles = findAllFiles(path.join(__dirname, 'src'));
allFiles.push(path.join(__dirname, 'index.html'));

allFiles.forEach(file => {
  updateImports(file);
});

console.log('\nImport updates complete!');
