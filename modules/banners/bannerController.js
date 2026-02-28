const pool = require('../../config/database');
// const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs').promises;

// GET /api/banners/list - Listar todos os banners
exports.listBanners = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM banners ORDER BY created_at DESC'
    );
    res.json({ banners: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/banners/:id - Buscar banner específico
exports.getBanner = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM banners WHERE id = $1', [id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Banner não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/banners/create - Criar novo banner
exports.createBanner = async (req, res) => {
  const { type, title, data, template } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO banners (type, title, data, template, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [type, title, JSON.stringify(data), template]
    );
    
    res.json({ success: true, banner: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/banners/:id - Atualizar banner
exports.updateBanner = async (req, res) => {
  const { id } = req.params;
  const { title, data, template } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE banners 
       SET title = $1, data = $2, template = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, JSON.stringify(data), template, id]
    );
    
    if (result.rows.length > 0) {
      res.json({ success: true, banner: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Banner não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/banners/:id - Deletar banner
exports.deleteBanner = async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM banners WHERE id = $1', [id]);
    res.json({ success: true, message: 'Banner deletado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/banners/generate - Gerar imagem do banner
exports.generateBanner = async (req, res) => {
  const { type, data } = req.body;
  
  try {
    // Por enquanto, retorna apenas os dados sem gerar imagem
    // A geração de imagem com canvas requer dependências nativas no servidor
    // Alternativa: usar serviço externo ou gerar no frontend
    
    res.json({ 
      success: true, 
      message: 'Banner configurado com sucesso',
      data: data,
      note: 'Geração de imagem será implementada em breve'
    });
  } catch (err) {
    console.error('Erro ao gerar banner:', err);
    res.status(500).json({ error: err.message });
  }
};

// Funções de geração comentadas temporariamente
// Requerem biblioteca canvas com dependências nativas

/*
// Gerar banner de filme/série
async function generateMovieBanner(data) {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
  gradient.addColorStop(0, '#0a0a0a');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1920, 1080);
  
  // Carregar poster do TMDB
  if (data.posterUrl) {
    try {
      const poster = await loadImage(data.posterUrl);
      ctx.drawImage(poster, 1200, 150, 600, 900);
      
      // Sombra no poster
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
    } catch (err) {
      console.error('Erro ao carregar poster:', err);
    }
  }
  
  // Título
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#FF6A00';
  ctx.font = 'bold 80px Arial';
  ctx.fillText(data.title || 'Título', 100, 200);
  
  // Ano
  ctx.fillStyle = '#ffffff';
  ctx.font = '40px Arial';
  ctx.fillText(`(${data.year || '2025'})`, 100, 280);
  
  // Descrição
  ctx.fillStyle = '#cccccc';
  ctx.font = '32px Arial';
  const description = data.description || 'Descrição do conteúdo';
  wrapText(ctx, description, 100, 380, 1000, 45);
  
  // Rating (estrelas)
  if (data.rating) {
    const stars = Math.round(data.rating / 2);
    ctx.fillStyle = '#FFD700';
    ctx.font = '60px Arial';
    ctx.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), 100, 900);
  }
  
  // Badges
  if (data.dubbed) {
    drawBadge(ctx, 'DUBLADO', 100, 50, '#00AA00');
  }
  if (data.isNew) {
    drawBadge(ctx, 'LANÇAMENTO', 350, 50, '#FF6A00');
  }
  
  return canvas.toBuffer('image/png');
}

// Gerar banner de futebol
async function generateFootballBanner(data) {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  
  // Background com gradiente de fogo
  const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
  gradient.addColorStop(0, '#1a0000');
  gradient.addColorStop(0.5, '#330000');
  gradient.addColorStop(1, '#1a0000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1920, 1080);
  
  // Título
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 70px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || 'TABELA DE JOGOS', 960, 120);
  
  // Data
  ctx.fillStyle = '#FF6A00';
  ctx.font = 'bold 50px Arial';
  ctx.fillText(data.date || 'HOJE', 960, 200);
  
  // Jogos
  let yPos = 300;
  (data.matches || []).forEach((match, index) => {
    drawMatch(ctx, match, yPos);
    yPos += 180;
  });
  
  // Logo Fire TV (cantos)
  ctx.fillStyle = '#FF6A00';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('🔥 Fire TV', 50, 1030);
  ctx.textAlign = 'right';
  ctx.fillText('Fire TV 🔥', 1870, 1030);
  
  return canvas.toBuffer('image/png');
}

// Desenhar partida
function drawMatch(ctx, match, y) {
  // Box da partida
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(200, y, 1520, 150);
  
  // Campeonato
  ctx.fillStyle = '#cccccc';
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(match.league || 'CAMPEONATO', 960, y + 40);
  
  // Time 1
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(match.team1 || 'TIME 1', 800, y + 100);
  
  // VS
  ctx.fillStyle = '#FF6A00';
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('VS', 960, y + 100);
  
  // Time 2
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(match.team2 || 'TIME 2', 1120, y + 100);
  
  // Horário
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 35px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(match.time || '20:00', 1650, y + 100);
}

// Desenhar badge
function drawBadge(ctx, text, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 200, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + 100, y + 40);
  ctx.textAlign = 'left';
}

// Quebrar texto em múltiplas linhas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  
  for (let i = 0; i < words.length && lineCount < 5; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  
  if (lineCount < 5) {
    ctx.fillText(line, x, y);
  }
}

module.exports = exports;
*/

module.exports = exports;
