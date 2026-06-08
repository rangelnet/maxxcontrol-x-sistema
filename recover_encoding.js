const fs = require('fs');
const path = require('path');

const files = [
    'web/src/pages/Devices.jsx',
    'modules/mac/macController.js',
    'web/src/components/UploadExcelModal.jsx'
];

// Mapping of Windows-1252 decoded UTF-8 bytes back to their original characters
const charMap = {
    'Ã£': 'ã',
    'Ã³': 'ó',
    'Ã¡': 'á',
    'Ã­': 'í',
    'Ã§': 'ç',
    'Ãµ': 'õ',
    'Ãª': 'ê',
    'Ã©': 'é',
    'Ã¢': 'â',
    'Ãº': 'ú',
    'Ã ': 'à',
    'ÃŠ': 'Ê',
    'Ã‡': 'Ç',
    'Ã ': 'Í',
    'Ã“': 'Ó',
    'Ã‰': 'É',
    'Ãƒ': 'Ã',
    'Ã‚': 'Â',
    'Ã”': 'Ô',
    'Ãš': 'Ú',
    'â”€': '─'
};

for (const relPath of files) {
    const fullPath = path.join('R:/Meu Drive/Painel Maxxcontrol-x-sistema', relPath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        for (const [bad, good] of Object.entries(charMap)) {
            content = content.split(bad).join(good);
        }
        
        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Fixed encoding in: ${relPath}`);
        } else {
            console.log(`No encoding issues found in: ${relPath}`);
        }
    }
}
