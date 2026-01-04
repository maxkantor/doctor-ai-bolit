// Script to replace domain references in static files during build
const fs = require('fs');
const path = require('path');

const DOMAIN = process.env.VITE_DOMAIN || 'doctoraibolit.com';
const API_DOMAIN = process.env.VITE_API_DOMAIN || 'api.doctoraibolit.com';

console.log(`🔧 Replacing domain references:`);
console.log(`   Domain: ${DOMAIN}`);
console.log(`   API Domain: ${API_DOMAIN}`);

// Files to process
const files = [
  { path: 'public/sitemap.xml', replacements: [[/https:\/\/doctoraibolit\.com/g, `https://${DOMAIN}`]] },
  { path: 'public/robots.txt', replacements: [[/https:\/\/doctoraibolit\.com/g, `https://${DOMAIN}`]] },
  { 
    path: 'index.html', 
    replacements: [
      [/https:\/\/doctoraibolit\.com/g, `https://${DOMAIN}`],
      [/https:\/\/api\.doctoraibolit\.com/g, `https://${API_DOMAIN}`]
    ] 
  }
];

files.forEach(({ path: filePath, replacements }) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  replacements.forEach(([pattern, replacement]) => {
    if (content.match(pattern)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
});

console.log('✅ Domain replacement complete!');
