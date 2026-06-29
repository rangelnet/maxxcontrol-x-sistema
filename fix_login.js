const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'web', 'src', 'pages', 'Login.jsx');

let content = fs.readFileSync(loginPath, 'utf8');

// Title scaling
content = content.replace('text-4xl xl:text-5xl', 'text-3xl xl:text-4xl');
content = content.replace('mb-8', 'mb-6');
content = content.replace('gap-5 mb-10', 'gap-4 mb-6');

// Features
content = content.replace(/w-12 h-12/g, 'w-10 h-10');
content = content.replace(/text-lg font-bold/g, 'text-base font-bold');

// Card padding
content = content.replace('p-8 md:p-10', 'p-6 md:p-8');
content = content.replace('mb-8', 'mb-6');

// Inputs & Buttons
content = content.replace(/py-3\.5/g, 'py-2.5');
content = content.replace(/py-4/g, 'py-3');
content = content.replace(/rounded-2xl/g, 'rounded-xl');
content = content.replace(/rounded-xl/g, 'rounded-lg');

fs.writeFileSync(loginPath, content, 'utf8');
console.log('Login.jsx dimensionado com sucesso!');
