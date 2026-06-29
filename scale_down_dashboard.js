const fs = require('fs');
const path = require('path');

const excludeFiles = ['Landing.jsx', 'UploadPlaylist.jsx', 'MaxxPlayerShowcase.jsx'];

const replacements = [
  // Typography scaling
  { regex: /text-6xl/g, replacement: 'text-5xl' },
  { regex: /text-5xl/g, replacement: 'text-4xl' },
  { regex: /text-4xl/g, replacement: 'text-3xl' },
  { regex: /text-3xl/g, replacement: 'text-2xl' },
  
  // Padding & Margin scaling
  { regex: /p-8/g, replacement: 'p-6' },
  { regex: /p-6/g, replacement: 'p-5' },
  { regex: /py-24/g, replacement: 'py-12' },
  { regex: /py-20/g, replacement: 'py-10' },
  { regex: /py-16/g, replacement: 'py-8' },
  { regex: /px-8/g, replacement: 'px-6' },
  { regex: /pt-8/g, replacement: 'pt-6' },
  { regex: /pb-8/g, replacement: 'pb-6' },
  { regex: /my-8/g, replacement: 'my-6' },
  { regex: /mt-8/g, replacement: 'mt-6' },
  { regex: /mb-8/g, replacement: 'mb-6' },
  
  // Gaps & Spaces
  { regex: /gap-8/g, replacement: 'gap-6' },
  { regex: /space-y-8/g, replacement: 'space-y-6' },
  { regex: /space-x-8/g, replacement: 'space-x-6' },
  
  // Heights and Widths
  { regex: /h-16/g, replacement: 'h-14' }, // navbar heights
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.jsx')) {
      if (excludeFiles.includes(file)) continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      replacements.forEach(({ regex, replacement }) => {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Scaled down: ${fullPath}`);
      }
    }
  }
}

const pagesDir = path.join(__dirname, 'web', 'src', 'pages');
const componentsDir = path.join(__dirname, 'web', 'src', 'components');

processDirectory(pagesDir);
processDirectory(componentsDir);

console.log('Scale down completed across the dashboard!');
