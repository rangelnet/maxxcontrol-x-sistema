const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'web', 'src', 'pages', 'Landing.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  { regex: /py-24/g, replacement: 'py-12' },
  { regex: /pt-28/g, replacement: 'pt-20' },
  { regex: /pb-20/g, replacement: 'pb-12' },
  { regex: /text-5xl md:text-7xl lg:text-8xl/g, replacement: 'text-4xl md:text-5xl lg:text-6xl' },
  { regex: /text-3xl md:text-5xl/g, replacement: 'text-2xl md:text-4xl' },
  { regex: /text-4xl md:text-6xl/g, replacement: 'text-3xl md:text-5xl' },
  { regex: /px-10 py-5/g, replacement: 'px-6 py-3' },
  { regex: /px-10 py-3\.5/g, replacement: 'px-6 py-2' },
  { regex: /w-64 md:w-80/g, replacement: 'w-48 md:w-64' },
  { regex: /w-24 md:w-32 xl:w-40/g, replacement: 'w-20 md:w-24 xl:w-32' },
  { regex: /h-\[600px\]/g, replacement: 'h-[400px]' },
  { regex: /gap-16/g, replacement: 'gap-10' },
  { regex: /max-w-7xl/g, replacement: 'max-w-6xl' },
  { regex: /max-w-6xl/g, replacement: 'max-w-5xl' },
  { regex: /p-8/g, replacement: 'p-6' },
  { regex: /mb-16/g, replacement: 'mb-10' },
  { regex: /mt-24/g, replacement: 'mt-12' },
  { regex: /min-h-\[80vh\]/g, replacement: 'min-h-[60vh]' },
  { regex: /text-lg md:text-xl/g, replacement: 'text-base md:text-lg' }
];

replacements.forEach(({ regex, replacement }) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Scale down applied to Landing.jsx');
