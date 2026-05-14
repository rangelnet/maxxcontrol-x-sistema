const fs = require('fs');
const path = require('path');

const srcDir = path.join('R:', 'Users', 'Usuario', 'Meu Drive', 'MAXX PLAYER-WEB', 'maxxplayer-web', 'public', 'assets', 'categories');
const destDir = path.join(__dirname, 'public', 'uploads', 'tv-categories');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.readdir(srcDir, (err, files) => {
    if (err) {
        console.error('Erro ao ler diretório de origem:', err);
        return;
    }
    
    files.forEach(file => {
        const srcFile = path.join(srcDir, file);
        // Corrige o nome do arquivo (remove espaços antes do ponto que vimos no smartCategories)
        const cleanName = file.replace(' .webp', '.webp').replace(' .png', '.png');
        const destFile = path.join(destDir, cleanName);
        
        fs.copyFileSync(srcFile, destFile);
        console.log(`Copiado: ${file} -> ${cleanName}`);
    });
    console.log('Todas as imagens copiadas com sucesso.');
});
