#!/usr/bin/env node

/**
 * Script para popular conteúdos automaticamente usando a API do TMDB
 * 
 * USO:
 * node popular-conteudos-automatico.js
 * 
 * O script vai:
 * 1. Buscar filmes e séries populares no TMDB
 * 2. Inserir diretamente no Supabase
 * 3. Mostrar progresso em tempo real
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurações
const TMDB_API_KEY = process.env.TMDB_API_KEY || '7bc56e27708a9d2069fc999d44a6be0a';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mmfbirjrhrhobbnzfffe.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_oUowKSGxGtxiy96we_bSvA_KZ-9aSROB';

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Buscar filmes populares do TMDB
async function buscarFilmesPopulares(quantidade = 10) {
  try {
    log(`\n📽️  Buscando ${quantidade} filmes populares no TMDB...`, 'blue');
    
    const paginas = Math.ceil(quantidade / 20);
    let filmes = [];
    
    for (let page = 1; page <= paginas; page++) {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          page
        }
      });
      
      filmes = filmes.concat(response.data.results);
      log(`  ✓ Página ${page}/${paginas} carregada`, 'green');
    }
    
    return filmes.slice(0, quantidade);
  } catch (error) {
    log(`  ✗ Erro ao buscar filmes: ${error.message}`, 'red');
    return [];
  }
}

// Buscar séries populares do TMDB
async function buscarSeriesPopulares(quantidade = 10) {
  try {
    log(`\n📺 Buscando ${quantidade} séries populares no TMDB...`, 'blue');
    
    const paginas = Math.ceil(quantidade / 20);
    let series = [];
    
    for (let page = 1; page <= paginas; page++) {
      const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'pt-BR',
          page
        }
      });
      
      series = series.concat(response.data.results);
      log(`  ✓ Página ${page}/${paginas} carregada`, 'green');
    }
    
    return series.slice(0, quantidade);
  } catch (error) {
    log(`  ✗ Erro ao buscar séries: ${error.message}`, 'red');
    return [];
  }
}

// Inserir conteúdo no Supabase
async function inserirConteudo(conteudo, tipo) {
  try {
    const dados = {
      tmdb_id: conteudo.id,
      tipo: tipo,
      titulo: conteudo.title || conteudo.name,
      titulo_original: conteudo.original_title || conteudo.original_name,
      descricao: conteudo.overview,
      poster_path: conteudo.poster_path,
      backdrop_path: conteudo.backdrop_path,
      nota: conteudo.vote_average,
      ano: (conteudo.release_date || conteudo.first_air_date || '').split('-')[0],
      ativo: true
    };
    
    const { data, error } = await supabase
      .from('conteudos')
      .upsert(dados, { onConflict: 'tmdb_id' })
      .select();
    
    if (error) {
      log(`  ✗ Erro ao inserir "${dados.titulo}": ${error.message}`, 'red');
      return false;
    }
    
    log(`  ✓ ${dados.titulo} (${dados.ano})`, 'green');
    return true;
  } catch (error) {
    log(`  ✗ Erro: ${error.message}`, 'red');
    return false;
  }
}

// Função principal
async function main() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║  🎬 POPULAR CONTEÚDOS AUTOMATICAMENTE                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  log('\n📊 Configurações:', 'yellow');
  log(`  • TMDB API Key: ${TMDB_API_KEY.substring(0, 10)}...`, 'yellow');
  log(`  • Supabase URL: ${SUPABASE_URL}`, 'yellow');
  
  // Verificar conexão com Supabase
  log('\n🔌 Testando conexão com Supabase...', 'blue');
  const { data: testData, error: testError } = await supabase
    .from('conteudos')
    .select('count')
    .limit(1);
  
  if (testError) {
    log(`  ✗ Erro de conexão: ${testError.message}`, 'red');
    log('\n💡 Verifique se o SUPABASE_KEY está correto no .env', 'yellow');
    process.exit(1);
  }
  
  log('  ✓ Conexão estabelecida!', 'green');
  
  // Buscar conteúdos
  const filmes = await buscarFilmesPopulares(10);
  const series = await buscarSeriesPopulares(10);
  
  if (filmes.length === 0 && series.length === 0) {
    log('\n✗ Nenhum conteúdo encontrado!', 'red');
    process.exit(1);
  }
  
  // Inserir filmes
  log('\n📽️  Inserindo filmes no banco...', 'blue');
  let filmesInseridos = 0;
  for (const filme of filmes) {
    if (await inserirConteudo(filme, 'filme')) {
      filmesInseridos++;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Delay para não sobrecarregar
  }
  
  // Inserir séries
  log('\n📺 Inserindo séries no banco...', 'blue');
  let seriesInseridas = 0;
  for (const serie of series) {
    if (await inserirConteudo(serie, 'serie')) {
      seriesInseridas++;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Resumo
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║  ✅ PROCESSO CONCLUÍDO!                               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`\n📊 Resumo:`, 'yellow');
  log(`  • Filmes inseridos: ${filmesInseridos}/${filmes.length}`, 'green');
  log(`  • Séries inseridas: ${seriesInseridas}/${series.length}`, 'green');
  log(`  • Total: ${filmesInseridos + seriesInseridas} conteúdos`, 'green');
  
  // Verificar total no banco
  const { count } = await supabase
    .from('conteudos')
    .select('*', { count: 'exact', head: true });
  
  log(`\n📚 Total de conteúdos no banco: ${count}`, 'cyan');
  
  log('\n🎉 Acesse a galeria de banners:', 'yellow');
  log('   https://maxxcontrol-frontend.onrender.com/banners\n', 'cyan');
}

// Executar
main().catch(error => {
  log(`\n✗ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
