const pool = require('../../config/database');
const tmdbService = require('../../services/tmdbService');

// Listar conteúdos
exports.listarConteudos = async (req, res) => {
  const { tipo, limit = 50 } = req.query;

  try {
    let query = 'SELECT * FROM conteudos WHERE ativo = true';
    const params = [];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $${params.length}`;
    }

    query += ` ORDER BY criado_em DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json({ conteudos: result.rows });
  } catch (error) {
    console.error('Erro ao listar conteúdos:', error);
    res.status(500).json({ error: 'Erro ao listar conteúdos' });
  }
};

// Importar filme do TMDB
exports.importarFilme = async (req, res) => {
  const { id } = req.params;

  try {
    const filme = await tmdbService.buscarFilmePorId(id);

    const result = await pool.query(
      `INSERT INTO conteudos (
        tmdb_id, tipo, titulo, titulo_original, descricao, 
        poster_path, backdrop_path, nota, ano, generos, duracao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (tmdb_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        descricao = EXCLUDED.descricao,
        nota = EXCLUDED.nota,
        atualizado_em = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        filme.id,
        'filme',
        filme.title,
        filme.original_title,
        filme.overview,
        filme.poster_path,
        filme.backdrop_path,
        filme.vote_average,
        filme.release_date?.substring(0, 4),
        filme.genres?.map(g => g.name),
        filme.runtime
      ]
    );

    res.json({ 
      message: 'Filme importado com sucesso! 🎬',
      conteudo: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao importar filme:', error);
    res.status(500).json({ error: 'Erro ao importar filme' });
  }
};

// Importar série do TMDB
exports.importarSerie = async (req, res) => {
  const { id } = req.params;

  try {
    const serie = await tmdbService.buscarSeriePorId(id);

    const result = await pool.query(
      `INSERT INTO conteudos (
        tmdb_id, tipo, titulo, titulo_original, descricao, 
        poster_path, backdrop_path, nota, ano, generos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (tmdb_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        descricao = EXCLUDED.descricao,
        nota = EXCLUDED.nota,
        atualizado_em = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        serie.id,
        'serie',
        serie.name,
        serie.original_name,
        serie.overview,
        serie.poster_path,
        serie.backdrop_path,
        serie.vote_average,
        serie.first_air_date?.substring(0, 4),
        serie.genres?.map(g => g.name)
      ]
    );

    res.json({ 
      message: 'Série importada com sucesso! 📺',
      conteudo: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao importar série:', error);
    res.status(500).json({ error: 'Erro ao importar série' });
  }
};

// Pesquisar no TMDB
exports.pesquisarTMDB = async (req, res) => {
  const { q, tipo } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query de pesquisa obrigatória' });
  }

  try {
    const resultados = await tmdbService.pesquisarConteudo(q, tipo);
    res.json(resultados);
  } catch (error) {
    console.error('Erro ao pesquisar:', error);
    res.status(500).json({ error: 'Erro ao pesquisar' });
  }
};

// Obter conteúdos populares do TMDB
exports.obterPopulares = async (req, res) => {
  const { tipo = 'movie', page = 1 } = req.query;

  try {
    let data;
    if (tipo === 'movie') {
      data = await tmdbService.buscarFilmesPopulares(page);
    } else {
      data = await tmdbService.buscarSeriesPopulares(page);
    }

    // Normalizar resultados para o front-end
    const resultados = (data.results || []).map(item => ({
      id: item.id,
      tmdb_id: item.id,
      titulo: item.title || item.name,
      titulo_original: item.original_title || item.original_name,
      descricao: item.overview,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      nota: item.vote_average,
      ano: (item.release_date || item.first_air_date || '').substring(0, 4),
      tipo: tipo === 'movie' ? 'filme' : 'serie'
    }));

    res.json({ resultados });
  } catch (error) {
    console.error('Erro ao buscar populares:', error);
    res.status(500).json({ error: 'Erro ao buscar populares' });
  }
};

// Deletar conteúdo
exports.deletarConteudo = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('UPDATE conteudos SET ativo = false WHERE id = $1', [id]);
    res.json({ message: 'Conteúdo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao deletar conteúdo' });
  }
};

// Gerar banners (placeholder - implementar com canvas depois)
exports.gerarBanners = async (req, res) => {
  const { id } = req.params;

  try {
    // TODO: Implementar geração de banners com canvas
    res.json({ 
      message: 'Geração de banners em desenvolvimento',
      info: 'Será implementado com node-canvas'
    });
  } catch (error) {
    console.error('Erro ao gerar banners:', error);
    res.status(500).json({ error: 'Erro ao gerar banners' });
  }
};

module.exports = exports;
