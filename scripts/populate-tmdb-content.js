/**
 * Script para popular a tabela conteudos com filmes/séries do TMDB
 * 
 * Uso:
 * node scripts/populate-tmdb-content.js
 */

const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY || '7bc56e27708a9d2069fc999d44a6be0a';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchPopularMovies(page = 1) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'pt-BR',
        page: page
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar filmes:', error.message);
    return [];
  }
}

async function fetchPopularSeries(page = 1) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'pt-BR',
        page: page
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Erro ao buscar séries:', error.message);
    return [];
  }
}

function generateSQL(contents) {
  let sql = `-- Script gerado automaticamente do TMDB\n`;
  sql += `-- Data: ${new Date().toISOString()}\n`;
  sql += `-- Total de conteúdos: ${contents.length}\n\n`;
  
  sql += `INSERT INTO conteudos (tmdb_id, tipo, titulo, titulo_original, descricao, poster_path, backdrop_path, nota, ano, generos, duracao, ativo) VALUES\n`;
  
  const values = contents.map((content, index) => {
    const isLast = index === contents.length - 1;
    const comma = isLast ? ';' : ',';
    
    const tmdbId = content.id;
    const tipo = content.media_type || content.tipo;
    const titulo = (content.title || content.name || '').replace(/'/g, "''");
    const tituloOriginal = (content.original_title || content.original_name || '').replace(/'/g, "''");
    const descricao = (content.overview || '').replace(/'/g, "''");
    const posterPath = content.poster_path || '';
    const backdropPath = content.backdrop_path || '';
    const nota = content.vote_average || 0;
    const ano = (content.release_date || content.first_air_date || '').split('-')[0] || '';
    const generos = content.genre_ids ? `ARRAY[${content.genre_ids.join(',')}]` : 'ARRAY[]::integer[]';
    const duracao = content.runtime || content.episode_run_time?.[0] || 0;
    
    return `(${tmdbId}, '${tipo}', '${titulo}', '${tituloOriginal}', '${descricao}', '${posterPath}', '${backdropPath}', ${nota}, '${ano}', ${generos}, ${duracao}, true)${comma}`;
  });
  
  sql += values.join('\n');
  sql += `\n\nON CONFLICT (tmdb_id) DO NOTHING;\n`;
  
  return sql;
}

async function main() {
  console.log('🎬 Buscando filmes populares do TMDB...\n');
  
  // Buscar 10 filmes populares
  const movies = await fetchPopularMovies(1);
  const moviesData = movies.slice(0, 10).map(m => ({ ...m, tipo: 'filme', media_type: 'filme' }));
  
  console.log(`✅ ${moviesData.length} filmes encontrados\n`);
  
  // Buscar 10 séries populares
  const series = await fetchPopularSeries(1);
  const seriesData = series.slice(0, 10).map(s => ({ ...s, tipo: 'serie', media_type: 'serie' }));
  
  console.log(`✅ ${seriesData.length} séries encontradas\n`);
  
  // Combinar tudo
  const allContent = [...moviesData, ...seriesData];
  
  // Gerar SQL
  const sql = generateSQL(allContent);
  
  // Salvar em arquivo
  const fs = require('fs');
  const outputPath = './database/migrations/populate_tmdb_content.sql';
  fs.writeFileSync(outputPath, sql);
  
  console.log(`\n📝 SQL gerado com sucesso!`);
  console.log(`📁 Arquivo: ${outputPath}`);
  console.log(`\n📋 Conteúdos incluídos:\n`);
  
  allContent.forEach((content, index) => {
    const titulo = content.title || content.name;
    const tipo = content.tipo === 'filme' ? '🎬' : '📺';
    const nota = content.vote_average.toFixed(1);
    console.log(`${index + 1}. ${tipo} ${titulo} (${nota}⭐)`);
  });
  
  console.log(`\n\n🚀 Próximos passos:`);
  console.log(`1. Abra o Supabase SQL Editor`);
  console.log(`2. Cole o conteúdo do arquivo: ${outputPath}`);
  console.log(`3. Execute o script`);
  console.log(`4. Acesse: https://maxxcontrol-frontend.onrender.com/banners\n`);
}

main().catch(console.error);
