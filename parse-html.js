const fs = require('fs');
const html = fs.readFileSync('R:\\Users\\Usuario\\Documents\\Nova pasta (2)\\Clientes _ MEGA SERVERS.html', 'utf-8');
const trRegex = /<tr[\s\S]*?<\/tr>/g;
const rows = html.match(trRegex);
if(rows && rows.length > 1) {
  fs.writeFileSync('R:\\Users\\Usuario\\Meu Drive\\Painel site Mxxcontrol-x-sistema\\first-row.html', rows[1]);
}
