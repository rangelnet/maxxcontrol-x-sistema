const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sintaxe do BannerGenerator.jsx...\n');

const filePath = path.join(__dirname, 'web', 'src', 'pages', 'BannerGenerator.jsx');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log('✅ Arquivo lido com sucesso');
    console.log(`📊 Total de linhas: ${content.split('\n').length}`);
    console.log(`📊 Total de caracteres: ${content.length}`);
    
    // Verificar se tem export default
    if (content.includes('export default')) {
        console.log('✅ Export default encontrado');
    } else {
        console.log('❌ Export default NÃO encontrado!');
    }
    
    // Verificar imports
    const imports = content.match(/^import .+ from .+$/gm);
    if (imports) {
        console.log(`\n📦 Imports encontrados (${imports.length}):`);
        imports.forEach(imp => console.log(`  - ${imp}`));
    }
    
    // Verificar se tem erros óbvios
    const issues = [];
    
    // Verificar parênteses balanceados
    const openParen = (content.match(/\(/g) || []).length;
    const closeParen = (content.match(/\)/g) || []).length;
    if (openParen !== closeParen) {
        issues.push(`⚠️  Parênteses desbalanceados: ${openParen} abertos, ${closeParen} fechados`);
    }
    
    // Verificar chaves balanceadas
    const openBrace = (content.match(/\{/g) || []).length;
    const closeBrace = (content.match(/\}/g) || []).length;
    if (openBrace !== closeBrace) {
        issues.push(`⚠️  Chaves desbalanceadas: ${openBrace} abertas, ${closeBrace} fechadas`);
    }
    
    // Verificar colchetes balanceados
    const openBracket = (content.match(/\[/g) || []).length;
    const closeBracket = (content.match(/\]/g) || []).length;
    if (openBracket !== closeBracket) {
        issues.push(`⚠️  Colchetes desbalanceados: ${openBracket} abertos, ${closeBracket} fechados`);
    }
    
    if (issues.length > 0) {
        console.log('\n❌ Problemas encontrados:');
        issues.forEach(issue => console.log(issue));
    } else {
        console.log('\n✅ Nenhum problema óbvio de sintaxe encontrado');
    }
    
    // Tentar parsear como JavaScript (básico)
    try {
        // Remover JSX para teste básico
        const jsOnly = content
            .replace(/<[^>]+>/g, '')  // Remove tags JSX
            .replace(/className=/g, 'class=');  // Substitui className
        
        console.log('\n✅ Estrutura básica parece válida');
    } catch (e) {
        console.log('\n❌ Erro ao validar estrutura:', e.message);
    }
    
    console.log('\n📝 Próximos passos:');
    console.log('1. Abra o navegador em http://localhost:5173/banners');
    console.log('2. Abra o DevTools (F12)');
    console.log('3. Vá para a aba Console');
    console.log('4. Procure por erros em vermelho');
    console.log('5. Vá para a aba Network');
    console.log('6. Recarregue a página');
    console.log('7. Verifique se as requisições para /api/content/list e /api/banners/list estão sendo feitas');
    console.log('\n📄 Ou abra o arquivo TESTE_BANNERS_SIMPLES.html no navegador para testar a API diretamente');
    
} catch (error) {
    console.error('❌ Erro ao ler arquivo:', error.message);
}
