const fs = require('fs');
const path = require('path');

const excludeFiles = ['Landing.jsx', 'UploadPlaylist.jsx', 'MaxxPlayerShowcase.jsx', 'Login.jsx'];

const classMap = {
  'text-6xl': 'text-5xl',
  'text-5xl': 'text-4xl',
  'text-4xl': 'text-3xl',
  'text-3xl': 'text-2xl',
  'p-8': 'p-6',
  'p-6': 'p-5',
  'py-24': 'py-12',
  'py-20': 'py-10',
  'py-16': 'py-8',
  'px-8': 'px-6',
  'pt-8': 'pt-6',
  'pb-8': 'pb-6',
  'my-8': 'my-6',
  'mt-8': 'mt-6',
  'mb-8': 'mb-6',
  'gap-8': 'gap-6',
  'space-y-8': 'space-y-6',
  'space-x-8': 'space-x-6',
  'h-16': 'h-14',
  'py-3.5': 'py-2.5',
  'rounded-2xl': 'rounded-xl',
  'rounded-xl': 'rounded-lg'
};

// Cria um regex que busca exatamente as classes inteiras (com word boundaries)
// para substituir em uma única passada, evitando que "text-4xl" vire "text-3xl" e depois "text-2xl".
const regex = new RegExp(`\\b(${Object.keys(classMap).join('|')})\\b`, 'g');

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
      
      const newContent = content.replace(regex, match => classMap[match]);
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`✅ Scaled down safely: ${file}`);
      }
    }
  }
}

const pagesDir = path.join(__dirname, 'web', 'src', 'pages');
const componentsDir = path.join(__dirname, 'web', 'src', 'components');

console.log('Iniciando o escalonamento seguro...');
processDirectory(pagesDir);
processDirectory(componentsDir);
console.log('Finalizado com sucesso!');
