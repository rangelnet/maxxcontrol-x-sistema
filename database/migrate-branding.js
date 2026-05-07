const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'maxxcontrol.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Iniciando migração da tabela branding_settings...');

db.serialize(() => {
  // Adicionar novas colunas se elas não existirem
  const columns = [
    { name: 'tema', type: 'TEXT DEFAULT "Neon"' },
    { name: 'button_primary_color', type: 'TEXT' },
    { name: 'button_secondary_color', type: 'TEXT' },
    { name: 'button_text_color', type: 'TEXT' },
    { name: 'button_focus_color', type: 'TEXT' },
    { name: 'platforms', type: 'TEXT' } // Caso não exista
  ];

  columns.forEach(col => {
    db.run(`ALTER TABLE branding_settings ADD COLUMN ${col.name} ${col.type}`, (err) => {
      if (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`✅ Coluna '${col.name}' já existe.`);
        } else {
          console.error(`❌ Erro ao adicionar coluna '${col.name}':`, err.message);
        }
      } else {
        console.log(`✨ Coluna '${col.name}' adicionada com sucesso.`);
      }
    });
  });

  // Atualizar o registro atual com valores padrão se necessário
  db.run(`UPDATE branding_settings SET 
    tema = 'Neon',
    button_primary_color = '#FC5F16',
    button_secondary_color = '#FF6A00',
    button_text_color = '#FFFFFF',
    button_focus_color = '#FFA500'
    WHERE id = 1 AND (button_primary_color IS NULL OR button_primary_color = '')`);

  console.log('✅ Migração concluída!');
});

db.close();
