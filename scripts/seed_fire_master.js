const pool = require('../config/database');

/**
 * Script de Semente: Stranger Fire Master — Elite Edition (Schema V3 Sync)
 * Injeta o template mestre inspirado na Stranger Things respeitando NOT NULL em largura/altura.
 */
async function seedFireMaster() {
  console.log('🔥 Iniciando injeção do modelo Fire Series Master (Deteção de Constraints: largura/altura)...');
  
  const templateNome = 'Stranger Fire Master — Elite Edition';
  const config = {
    theme: 'fire-series',
    bg_url: 'https://image.tmdb.org/t/p/original/56vmqUvXJkZlB2tZ5yE6cEa6h3k.jpg',
    overlay_url: '',
    poster_x: 50,
    poster_y: 48,
    poster_scale: 1,
    text_color: '#FFA500',
    font_family: 'Outfit',
    show_synopsis: true,
    brand_name: 'TV MAXX',
    brand_logo_url: '' 
  };

  const templateData = {
    nome: templateNome,
    tipo: 'movie',
    descricao: 'Modelo Elite inspirado na série Stranger Things com branding adaptável e barra de dispositivos.',
    largura: 1080,
    altura: 1920,
    config: JSON.stringify(config),
    ativo: true
  };

  try {
    // Verificar se já existe (usando coluna 'nome')
    const exists = await pool.query('SELECT id FROM banner_templates WHERE nome = $1', [templateNome]);
    
    if (exists.rows && exists.rows.length > 0) {
      console.log('♻️ Template já existe. Atualizando configurações e dimensões...');
      await pool.query(
        `UPDATE banner_templates 
         SET config = $1, tipo = $2, descricao = $3, largura = $4, altura = $5
         WHERE nome = $6`,
        [templateData.config, templateData.tipo, templateData.descricao, templateData.largura, templateData.altura, templateNome]
      );
      console.log('✅ Template atualizado com sucesso!');
    } else {
      console.log('🆕 Criando novo registro de template (Schema: largura/altura/nome)...');
      await pool.query(
        `INSERT INTO banner_templates (nome, tipo, descricao, config, largura, altura, ativo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [templateData.nome, templateData.tipo, templateData.descricao, templateData.config, templateData.largura, templateData.altura, templateData.ativo]
      );
      console.log('✅ Template injetado com sucesso!');
    }
  } catch (err) {
    console.error('❌ Erro na injeção do template:', err.message);
    
    // Fallback SQLite
    if (err.message.includes('$1')) {
       try {
         const sqliteQuery = `INSERT OR REPLACE INTO banner_templates (nome, tipo, descricao, config, largura, altura, ativo) 
                              VALUES (?, ?, ?, ?, ?, ?, ?)`;
         await pool.query(sqliteQuery, [templateData.nome, templateData.tipo, templateData.descricao, templateData.config, templateData.largura, templateData.altura, templateData.ativo]);
         console.log('✅ Template injetado com sucesso (SQLite Fallback)!');
       } catch (sqliteErr) {
         console.error('❌ Falha total no fallback:', sqliteErr.message);
       }
    }
  } finally {
    process.exit();
  }
}

seedFireMaster();
