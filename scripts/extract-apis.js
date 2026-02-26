const fs = require('fs');
const path = require('path');

// Caminho do projeto Android
const PROJECT_PATH = 'R:\\Users\\Usuario\\Documents\\tv-maxx\\TV-MAXX-PRO-Android';
const OUTPUT_FILE = 'API_ENDPOINTS.md';

// Padrões para encontrar URLs de API
const patterns = [
  /https?:\/\/[^\s"']+/g,                           // URLs completas
  /BASE_URL\s*=\s*["']([^"']+)["']/g,              // BASE_URL
  /baseUrl\s*=\s*["']([^"']+)["']/g,               // baseUrl
  /\.get\(["']([^"']+)["']/g,                       // Retrofit GET
  /\.post\(["']([^"']+)["']/g,                      // Retrofit POST
  /\.put\(["']([^"']+)["']/g,                       // Retrofit PUT
  /\.delete\(["']([^"']+)["']/g,                    // Retrofit DELETE
  /@GET\(["']([^"']+)["']/g,                        // Anotação @GET
  /@POST\(["']([^"']+)["']/g,                       // Anotação @POST
  /@PUT\(["']([^"']+)["']/g,                        // Anotação @PUT
  /@DELETE\(["']([^"']+)["']/g,                     // Anotação @DELETE
  /endpoint\s*=\s*["']([^"']+)["']/gi,              // endpoint
  /url\s*=\s*["']([^"']+)["']/gi,                   // url
];

const apis = new Set();
const files = [];

// Função para buscar arquivos recursivamente
function findFiles(dir, extensions = ['.java', '.kt', '.xml', '.json']) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Ignorar pastas comuns que não têm código
          if (!['build', 'node_modules', '.git', '.gradle'].includes(item)) {
            findFiles(fullPath, extensions);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      } catch (err) {
        // Ignorar erros de acesso a arquivos específicos
      }
    }
  } catch (err) {
    console.error(`Erro ao ler diretório ${dir}:`, err.message);
  }
}

// Função para extrair APIs de um arquivo
function extractAPIs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const url = match[1] || match[0];
        if (url && url.length > 5) {
          apis.add(url);
        }
      }
    });
  } catch (err) {
    // Ignorar erros de leitura
  }
}

// Executar
console.log('🔍 Procurando APIs no projeto Android...\n');
console.log(`📂 Projeto: ${PROJECT_PATH}\n`);

if (!fs.existsSync(PROJECT_PATH)) {
  console.error('❌ Projeto não encontrado!');
  process.exit(1);
}

findFiles(PROJECT_PATH);
console.log(`📄 Arquivos encontrados: ${files.length}\n`);

files.forEach(file => extractAPIs(file));
console.log(`🔗 APIs encontradas: ${apis.size}\n`);

// Organizar e salvar
const sortedAPIs = Array.from(apis).sort();

let output = '# 🔗 APIs Extraídas do TV-MAXX-PRO-Android\n\n';
output += `**Total de endpoints encontrados:** ${sortedAPIs.length}\n\n`;
output += '---\n\n';

// Separar por tipo
const baseUrls = sortedAPIs.filter(api => api.startsWith('http'));
const endpoints = sortedAPIs.filter(api => !api.startsWith('http'));

if (baseUrls.length > 0) {
  output += '## 🌐 Base URLs\n\n';
  baseUrls.forEach(url => {
    output += `- \`${url}\`\n`;
  });
  output += '\n';
}

if (endpoints.length > 0) {
  output += '## 📡 Endpoints\n\n';
  endpoints.forEach(endpoint => {
    output += `- \`${endpoint}\`\n`;
  });
  output += '\n';
}

output += '---\n\n';
output += `*Gerado em: ${new Date().toLocaleString('pt-BR')}*\n`;

fs.writeFileSync(OUTPUT_FILE, output);

console.log('✅ APIs extraídas com sucesso!\n');
console.log(`📄 Arquivo gerado: ${OUTPUT_FILE}\n`);
console.log('═══════════════════════════════════');
console.log('📊 RESUMO');
console.log('═══════════════════════════════════');
console.log(`Base URLs: ${baseUrls.length}`);
console.log(`Endpoints: ${endpoints.length}`);
console.log(`Total: ${sortedAPIs.length}`);
console.log('═══════════════════════════════════\n');

// Mostrar preview
if (sortedAPIs.length > 0) {
  console.log('🔍 Preview das primeiras 10 APIs:\n');
  sortedAPIs.slice(0, 10).forEach((api, i) => {
    console.log(`${i + 1}. ${api}`);
  });
  if (sortedAPIs.length > 10) {
    console.log(`\n... e mais ${sortedAPIs.length - 10} APIs\n`);
  }
}
