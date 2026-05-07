const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'maxxcontrol.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando tabelas em:', dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Erro ao listar tabelas:', err);
  } else {
    console.log('📋 Tabelas encontradas:', tables.map(t => t.name).join(', '));
    
    if (tables.find(t => t.name === 'branding_settings')) {
        db.all("PRAGMA table_info(branding_settings)", (err, info) => {
            console.log('📊 Colunas de branding_settings:', info.map(c => c.name).join(', '));
            db.close();
        });
    } else {
        console.log('⚠️ Tabela branding_settings NÃO ENCONTRADA!');
        db.close();
    }
  }
});
