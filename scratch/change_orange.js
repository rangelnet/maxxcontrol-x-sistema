const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../web/src');

function findAndReplace(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findAndReplace(filePath);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Flags para saber se o arquivo foi alterado
      let changed = false;

      // Substitui o Hexadecimal #FFA500 -> #FC5F16
      if (content.match(/#FFA500/i)) {
        content = content.replace(/#FFA500/gi, '#FC5F16');
        changed = true;
      }

      // Substitui o RGB rgba(255,165,0) -> rgba(252,95,22) (incluindo variações de espaço)
      if (content.match(/255\s*,\s*165\s*,\s*0/g)) {
        content = content.replace(/255\s*,\s*165\s*,\s*0/g, '252, 95, 22');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Atualizado: ${filePath}`);
      }
    }
  }
}

console.log('🔄 Iniciando substituição do laranja #FFA500 para #FC5F16...');
findAndReplace(directoryPath);
console.log('🚀 Finalizado com sucesso!');
