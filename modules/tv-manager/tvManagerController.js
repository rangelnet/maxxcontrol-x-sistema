const pool = require('../../config/database');
const smartCategorizer = require('./smartCategorizer');
const { uploadToSupabase } = require('../../services/supabaseStorage');

/**
 * Retorna as categorias configuradas
 */
exports.getCategories = async (req, res) => {
    try {
        let result = await pool.query('SELECT * FROM tv_categories ORDER BY ordem ASC');
        
        // Se não houver categorias, auto-preencher com as categorias padrão do Web Player
        if (result.rows.length === 0) {
            const defaultCategories = [
                { name: 'FAVORITOS', icon: 'logo_cate_estrela.webp', icon_type: 'image', keywords: [], excludeKeywords: [] },
                { name: 'TODOS CANAIS', icon: 'ic_channel.png', icon_type: 'image', keywords: [], excludeKeywords: [] },
                { name: 'JOGOS DO DIA', icon: 'logo_cate_esportes.webp', icon_type: 'image', keywords: ['jogos do', 'jogo do', 'evento em breve', 'partidas de hoje', 'gols da rodada', 'eventos ao vivo', 'pay-per-view', 'campeonato', 'paulistão', 'cariocão', '⚽', '〽️', 'premiere', 'ppv', 'mosaico', 'x-sports', 'conmebol', 'libertadores', 'copa do brasil', 'brasileirão', 'brasileirao', 'champions', 'uefa', 'liga', 'jogos de hoje', 'futebol ao vivo'], excludeKeywords: [] },
                { name: 'PLAYBACK', icon: 'logo_cate_playbac.webp', icon_type: 'image', keywords: ['playback', 'catchup', 'reprise'], excludeKeywords: [] },
                { name: 'BBB 2026', icon: 'logo_cate_fazenda.webp', icon_type: 'image', keywords: ['bbb', 'bbb 26', 'bbb 2026'], excludeKeywords: [] },
                { name: 'GLOBO', icon: 'logo_cate_globo.webp', icon_type: 'image', keywords: ['globo', 'amazônica', 'rbs', 'nsc', 'rpc', 'anhanguera', 'morena', 'bahia tv', 'asa branca', 'verdes mares', 'eptv', 'vanguarda', 'intertv'], excludeKeywords: [] },
                { name: 'CANAIS ABERTOS', icon: 'logo_cate_aberta.webp', icon_type: 'image', keywords: ['abertos', 'sbt', 'band', 'record', 'rede tv', 'cultura', 'futura', 'publico', 'público', 'legislativa', 'assembleia', 'câmara', 'senado'], excludeKeywords: [] },
                { name: 'ESPORTES', icon: 'logo_cate_esportes.webp', icon_type: 'image', keywords: ['esporte', 'sportv', 'premiere', 'espn', 'fox sports', 'tnt sports', 'band sports', 'dazn', 'nba', 'nba pass', 'ufc', 'paramount', 'x-sports', 'goat', 'nosso futebol', 'caze', 'cazé', 'combat', 'luta', 'sportynet', 'ge tv', 'apple tv', 'fifa+', 'furacão', 'futsal', 'nsports', 'one football', 'zapping', 'itnet', 'olympia', 'real madrid', 'flamengo tv', 'estaduais', 'paulistão', 'carioca', 'mineiro', 'gaúcho'], excludeKeywords: [] },
                { name: 'DISNEY+', icon: 'logo_cate_disney.webp', icon_type: 'image', keywords: ['disney+', 'disney +', 'disney plus'], excludeKeywords: [] },
                { name: 'CINEMA & LANÇAMENTOS', icon: 'logo_cate_filmes.webp', icon_type: 'image', keywords: ['lançamentos', 'lancamentos', 'estreias', 'estréias', 'recentes', 'marvel', 'ucm', 'oscar', 'exclusivos', 'novidades', '2026', '2025', '2024', '2023', 'novidades da semana', 'pedidos exclusivo'], excludeKeywords: [] },
                { name: 'TELECINE & HBO', icon: 'logo_cate_telecine.webp', icon_type: 'image', keywords: ['telecine', 'hbo'], excludeKeywords: ['24h', '24 h', '24 hora', '24hrs', 'loop', 'reprise', 'usa |', 'uk |', 'pt |', 'es |', 'ar |', 'it |', 'fr |', 'cl |', 'chi |', 'esp |', 'latino', 'international'] },
                { name: 'FILMES E SÉRIES', icon: 'logo_cate_filmes.webp', icon_type: 'image', keywords: ['a&e', 'amc', 'axn', 'cinemax', 'film&arts', 'megapix', 'paramount channel', 'space', 'studio universal', 'syfy', 'tcm', 'tnt', 'tnt series', 'universal channel', 'warner channel', 'cine brasil tv', 'dreamworks', 'universal premiere', 'universal reality', 'universal tv', 'canal sony', 'sony movies', 'runtime', 'cine sky', 'sky filmes', 'usa fhd', 'usa hd', 'usa sd'], excludeKeywords: ['24h', '24 h', '24 hora', '24hrs', 'loop', 'reprise', 'usa |', 'uk |', 'pt |', 'es |', 'ar |', 'it |', 'fr |', 'cl |', 'chi |', 'esp |', 'latino', 'international'] },
                { name: 'DOCUMENTÁRIOS', icon: 'logo_cate_doc.webp', icon_type: 'image', keywords: ['documentário', 'documentario', 'discovery', 'animal planet', 'history', 'h2', 'hgtv', 'id - investigação'], excludeKeywords: [] },
                { name: 'NOTÍCIAS', icon: 'logo_cate_news.webp', icon_type: 'image', keywords: ['notícia', 'cnn', 'jovem pan', 'globo news', 'record news', 'band news'], excludeKeywords: [] },
                { name: 'INFANTIL', icon: 'logo_cate_kids.webp', icon_type: 'image', keywords: ['infantil', 'cartoon', 'nick', 'discovery kids', 'gloob', 'boomerang', 'tooncast', 'zoomoo', 'desenho', 'dragon ball', 'power rangers', 'anime'], excludeKeywords: [] },
                { name: 'VARIEDADES', icon: 'logo_cate_varie.webp', icon_type: 'image', keywords: ['variedades', 'comedy central', 'e!', 'fashion tv', 'fish tv', 'food network', 'mtv', 'multishow', 'playtv', 't&l', 'tbs', 'tlc', 'tru tv', 'viva', 'wobi', 'woohoo', 'chef tv', 'sabor & arte', 'agro', 'rural'], excludeKeywords: [] },
                { name: 'RELIGIOSOS', icon: 'logo_cate_religi.webp', icon_type: 'image', keywords: ['religioso', 'gospel', 'espírita', 'espirita', 'catolico', 'católico', 'canção nova', 'aparecida', 'novo tempo', 'evangelizar', 'pai eterno', 'imaculada', 'igreja', 'rit tv', 'gênesis', 'século 21', 'boa vontade'], excludeKeywords: [] },
                { name: 'CANAIS 4K', icon: '📺', icon_type: 'emoji', keywords: ['4k', 'uhd', 'resolução'], excludeKeywords: [] },
                { name: 'CANAIS H.265', icon: '⚡', icon_type: 'emoji', keywords: ['h.265', 'h265', 'hevc'], excludeKeywords: [] },
                { name: 'CANAIS FULL HD', icon: '🖥️', icon_type: 'emoji', keywords: ['full hd', 'fhd', '1080p'], excludeKeywords: [] },
                { name: 'CANAIS HD', icon: '📺', icon_type: 'emoji', keywords: [' hd ', '| hd', '720p'], excludeKeywords: [] },
                { name: 'CANAIS SD', icon: '📺', icon_type: 'emoji', keywords: [' sd ', '| sd', '480p', 'baixa qualidade'], excludeKeywords: [] },
                { name: 'EUA & UK', icon: '🇺🇸', icon_type: 'emoji', keywords: ['usa |', 'u.s.a', 'united states', 'uk |', 'united kingdom', 'ingles', 'english', 'eng |', 'fox news', 'cnn internacional', 'bbc world', 'euronews english'], excludeKeywords: [] },
                { name: 'PORTUGAL', icon: 'logo_cate_port.webp', icon_type: 'image', keywords: ['pt |', 'portugal', 'p.t', 'cnn portugal', 'euronews português', 'rtp', 'tvi', 'sic'], excludeKeywords: [] },
                { name: 'ESPANHA', icon: '🇪🇸', icon_type: 'emoji', keywords: ['es |', 'spa |', 'latino', 'espanha', 'españa', 'esp |', 'euronews en español', 'tve', 'antena 3'], excludeKeywords: [] },
                { name: 'ITÁLIA', icon: '🇮🇹', icon_type: 'emoji', keywords: ['rai internacional', 'rai'], excludeKeywords: [] },
                { name: 'ARGENTINA', icon: '🇦🇷', icon_type: 'emoji', keywords: ['ar |', 'arg |', 'argentina', 'a.r'], excludeKeywords: [] },
                { name: 'FRANÇA', icon: '🇫🇷', icon_type: 'emoji', keywords: ['fr |', 'fra |', 'frança', 'france'], excludeKeywords: [] },
                { name: 'CHILE', icon: '🇨🇱', icon_type: 'emoji', keywords: ['cl |', 'chi |', 'chile'], excludeKeywords: [] },
                { name: '24H MAXX', icon: 'logo_cate_24.webp', icon_type: 'image', keywords: ['24 hora', '24h ', '24 h', '24hrs', '24 hrs', 'coletânea', 'coletanea', 'coleção', 'colecao', 'dorama', 'series 24h', 'desenhos 24h', 'dragon ball 24h', 'power rangers 24h', 'runtime', 'discovery plus', 'batman', 'trapalhões', '007', 'star wars', 'bourne', 'brinquedo assassino', 'rocky', 'jornada nas estrelas', 'resident evil', 'jogos vorazes', 'x-men', 'vingadores', 'robocop', 'rambo', 'velozes & furiosos', 'harry potter', 'o senhor dos aneis', 'panico na floresta', 'a hora do pesadelo', 'jogos mortais', 'massacre da serra eletrica', 'chaves', 'chapolin'], excludeKeywords: [] },
                { name: 'CANAIS ADULTOS', icon: 'logo_cate_adul.webp', icon_type: 'image', keywords: ['adulto', 'xxx', 'onlyfans', 'brasileirinhas', 'hentai', 'playboy', 'sextreme', 'venus', 'prive', 'hot', '🔞', 'of ', 'extra', 'sextapa', 'sexhot', 'sexprazer', 'sexo', 'erotica', 'erótica'], excludeKeywords: [] }
            ];

            // Tentar copiar imagens do Web Player para o Painel automaticamente
            const fs = require('fs');
            const path = require('path');
            try {
                const srcDir = path.join('R:', 'Users', 'Usuario', 'Meu Drive', 'MAXX PLAYER-WEB', 'maxxplayer-web', 'public', 'assets', 'categories');
                const destDir = path.join(process.cwd(), 'public', 'uploads', 'tv-categories');
                if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
                
                if (fs.existsSync(srcDir)) {
                    fs.readdirSync(srcDir).forEach(file => {
                        const srcFile = path.join(srcDir, file);
                        const cleanName = file.replace(' .webp', '.webp').replace(' .png', '.png');
                        const destFile = path.join(destDir, cleanName);
                        fs.copyFileSync(srcFile, destFile);
                    });
                }
            } catch (e) {
                console.warn('Aviso: Não foi possível copiar os ícones automaticamente. Eles precisarão ser colocados em public/uploads/tv-categories/ manualmente.', e.message);
            }

            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                for (let i = 0; i < defaultCategories.length; i++) {
                    const cat = defaultCategories[i];
                    await client.query(
                        'INSERT INTO tv_categories (name, icon, icon_type, keywords, exclude_keywords, ordem) VALUES ($1, $2, $3, $4, $5, $6)',
                        [cat.name, cat.icon, cat.icon_type, JSON.stringify(cat.keywords), JSON.stringify(cat.excludeKeywords), i]
                    );
                }
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                console.error('Erro no auto-seed de categorias:', e);
            } finally {
                client.release();
            }

            // Buscar novamente após inserir
            result = await pool.query('SELECT * FROM tv_categories ORDER BY ordem ASC');
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar categorias de TV:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Cria uma nova categoria
 */
exports.createCategory = async (req, res) => {
    let { name, icon, icon_type } = req.body;
    
    if (req.file) {
        try {
            icon = await uploadToSupabase(req.file, 'tv-categories');
            icon_type = 'image';
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao salvar a imagem na nuvem.' });
        }
    }

    try {
        const result = await pool.query(
            'INSERT INTO tv_categories (name, icon, icon_type) VALUES ($1, $2, $3) RETURNING *',
            [name, icon || '📺', icon_type || 'emoji']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar categoria de TV:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Atualiza uma categoria
 */
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    let { name, icon, icon_type } = req.body;
    
    if (req.file) {
        try {
            icon = await uploadToSupabase(req.file, 'tv-categories');
            icon_type = 'image';
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao salvar a imagem na nuvem.' });
        }
    }

    try {
        const result = await pool.query(
            'UPDATE tv_categories SET name = COALESCE($1, name), icon = COALESCE($2, icon), icon_type = COALESCE($3, icon_type), updated_at = NOW() WHERE id = $4 RETURNING *',
            [name, icon, icon_type, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar categoria de TV:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Exclui uma categoria (e desvincula canais)
 */
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tv_categories WHERE id = $1', [id]);
        res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir categoria de TV:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Reordena categorias
 */
exports.reorderCategories = async (req, res) => {
    const { items } = req.body; // Array de { id, ordem }
    try {
        const client = await pool.connect();
        await client.query('BEGIN');
        for (const item of items) {
            await client.query('UPDATE tv_categories SET ordem = $1 WHERE id = $2', [item.ordem, item.id]);
        }
        await client.query('COMMIT');
        client.release();
        res.json({ message: 'Categorias reordenadas com sucesso' });
    } catch (error) {
        console.error('Erro ao reordenar categorias de TV:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Retorna os canais de uma categoria
 */
exports.getChannelsByCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM tv_channels WHERE category_id = $1 ORDER BY ordem ASC', [categoryId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar canais da categoria:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Move canais para uma categoria
 */
exports.moveChannels = async (req, res) => {
    const { channelIds, targetCategoryId } = req.body;
    try {
        await pool.query('UPDATE tv_channels SET category_id = $1 WHERE id = ANY($2)', [targetCategoryId, channelIds]);
        res.json({ message: 'Canais movidos com sucesso' });
    } catch (error) {
        console.error('Erro ao mover canais:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Exclui um canal
 */
exports.removeChannel = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tv_channels WHERE id = $1', [id]);
        res.json({ message: 'Canal excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir canal:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Retorna os canais no staging (sem categoria)
 */
exports.getStagingChannels = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tv_channels WHERE category_id IS NULL ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar canais em staging:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

/**
 * Importa lista Xtream
 */
exports.importPlaylist = async (req, res) => {
    const { url, username, password } = req.body;
    
    if (!url || !username || !password) {
        return res.status(400).json({ error: 'URL, Usuário e Senha são obrigatórios' });
    }

    try {
        const baseUrl = url.replace(/\/$/, '');
        
        // 1. Buscar Categorias
        const catResponse = await fetch(`${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`);
        if (!catResponse.ok) throw new Error('Falha ao conectar na API Xtream (Categorias)');
        const categories = await catResponse.json();

        // 2. Buscar Canais
        const streamsResponse = await fetch(`${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`);
        if (!streamsResponse.ok) throw new Error('Falha ao conectar na API Xtream (Canais)');
        const streams = await streamsResponse.json();

        // Mapa de IDs de categoria para Nomes
        const catMap = {};
        if (Array.isArray(categories)) {
            categories.forEach(c => {
                catMap[c.category_id] = c.category_name;
            });
        }

        let importedCount = 0;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // 3. Buscar categorias do banco de dados (regras de inteligência)
            const dbCategoriesQuery = await client.query('SELECT id, name, keywords, exclude_keywords FROM tv_categories');
            const dbCategories = dbCategoriesQuery.rows.map(cat => ({
                id: cat.id,
                name: cat.name,
                keywords: cat.keywords || [],
                excludeKeywords: cat.exclude_keywords || []
            }));

            // Função helper da inteligência de auto-match (idêntica ao Web Player)
            const findBestCategoryForChannel = (channelName) => {
                if (!channelName) return null;
                const nameLower = String(channelName).toLowerCase();
                
                for (const cat of dbCategories) {
                    let kws = [];
                    let exc = [];
                    
                    try { kws = Array.isArray(cat.keywords) ? cat.keywords : JSON.parse(cat.keywords || '[]'); } catch(e){}
                    try { exc = Array.isArray(cat.excludeKeywords) ? cat.excludeKeywords : JSON.parse(cat.excludeKeywords || '[]'); } catch(e){}

                    if (kws.length > 0) {
                        // Verifica excludes primeiro
                        const hasExclude = exc.some(ex => nameLower.includes(String(ex).toLowerCase()));
                        if (hasExclude) continue;

                        // Verifica includes
                        const hasMatch = kws.some(kw => nameLower.includes(String(kw).toLowerCase()));
                        if (hasMatch) return cat.id; // Retorna o ID da categoria que deu match
                    }
                }
                return null; // Staging (Sem Categoria)
            };
            
            // 4. Carregar canais existentes para memória (O(1) lookups para evitar gargalo N+1 e Timeouts)
            const existingChannelsQuery = await client.query('SELECT stream_id FROM tv_channels');
            const existingStreamIds = new Set(existingChannelsQuery.rows.map(row => row.stream_id));

            // Inserir canais novos
            if (Array.isArray(streams)) {
                for (const stream of streams) {
                    const sourceCategoryName = catMap[stream.category_id] || 'Sem Categoria';
                    
                    // Verificação O(1) sem bater no banco de dados para cada canal
                    if (!existingStreamIds.has(stream.stream_id)) {
                        // CAMADA 1: Aplicar Inteligência por Keywords do cliente:
                        let matchedCategoryId = findBestCategoryForChannel(stream.name);

                        // CAMADA 2 (CÉREBRO LOCAL): Se as keywords não acharam, o dicionário de 900+ canais tenta:
                        if (!matchedCategoryId) {
                            const brainSuggestion = smartCategorizer.auditChannel(stream.name, dbCategories, null);
                            if (brainSuggestion) {
                                matchedCategoryId = brainSuggestion.suggestedCategoryId;
                            }
                        }

                        await client.query(
                            `INSERT INTO tv_channels (name, stream_url, stream_id, logo_url, epg_channel_id, source_category_name, category_id) 
                             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                            [
                                stream.name,
                                `${baseUrl}/live/${username}/${password}/${stream.stream_id}.ts`, // Formato padrão ts
                                stream.stream_id,
                                stream.stream_icon,
                                stream.epg_channel_id,
                                sourceCategoryName,
                                matchedCategoryId // NULL = Staging, ID = Auto-Categorizado pelo Cérebro
                            ]
                        );
                        // Adicionar ao Set para não duplicar se a própria lista enviar dois iguais
                        existingStreamIds.add(stream.stream_id);
                        importedCount++;
                    }
                }
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        res.json({ message: 'Importação concluída', importedCount });
    } catch (error) {
        console.error('Erro na importação:', error);
        res.status(500).json({ error: error.message || 'Erro ao importar lista' });
    }
};

/**
 * Retorna a configuração completa para o MAC (Rota Pública)
 */
exports.getConfigForDevice = async (req, res) => {
    // Retornar as categorias com seus respectivos canais
    try {
        const catResult = await pool.query('SELECT * FROM tv_categories WHERE is_active = true ORDER BY ordem ASC');
        const categories = catResult.rows;

        const chanResult = await pool.query('SELECT * FROM tv_channels WHERE is_active = true AND category_id IS NOT NULL ORDER BY ordem ASC');
        const channels = chanResult.rows;

        // ═══════════════════════════════════════════════════════
        // 🧠 AGRUPAMENTO INTELIGENTE DE QUALIDADES
        // Detecta: MAX 01/02/03, Globo SD/HD/FHD, ESPN 1/2/3
        // Agrupa num único canal com array de "qualities" alternativas
        // ═══════════════════════════════════════════════════════
        const getBaseName = (name) => {
            return String(name)
                .toLowerCase()
                .replace(/\b(fhd|full\s*hd|hd|sd|4k|uhd|h265|h\.265|hevc|vip)\b/gi, '')
                .replace(/\s*\d{1,3}\s*$/, '')     // Remove números finais (01, 02...)
                .replace(/\s*#\d+\s*$/, '')         // Remove #1, #2...
                .replace(/[\[\]\(\)\|]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        };

        const getQualityLabel = (name) => {
            const n = String(name);
            // Detectar qualidade explícita
            if (/\bfhd\b|full\s*hd/i.test(n)) return 'FHD';
            if (/\b4k\b|\buhd\b/i.test(n)) return '4K';
            if (/\bhd\b/i.test(n)) return 'HD';
            if (/\bsd\b/i.test(n)) return 'SD';
            // Detectar número de servidor
            const numMatch = n.match(/\s(\d{1,3})\s*$/);
            if (numMatch) return `#${numMatch[1]}`;
            return 'Principal';
        };

        // Agrupar canais por nome base DENTRO de cada categoria
        const result = categories.map(cat => {
            const catChannels = channels.filter(ch => ch.category_id === cat.id);
            
            // Agrupar por nome base
            const groups = {};
            for (const ch of catChannels) {
                const base = getBaseName(ch.name);
                if (!groups[base]) groups[base] = [];
                groups[base].push(ch);
            }

            // Montar a lista final: canal principal + qualidades
            const processedChannels = [];
            for (const [baseName, variants] of Object.entries(groups)) {
                if (variants.length === 1) {
                    // Canal único, sem variantes
                    processedChannels.push({ ...variants[0], qualities: [] });
                } else {
                    // Canal com variantes: o primeiro é o principal
                    const primary = variants[0];
                    const qualities = variants.map(v => ({
                        id: v.id,
                        name: v.name,
                        label: getQualityLabel(v.name),
                        stream_url: v.stream_url
                    }));
                    processedChannels.push({
                        ...primary,
                        qualities // Array com todas as qualidades/servidores
                    });
                }
            }

            return {
                ...cat,
                channels: processedChannels
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Erro ao buscar config do device:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
};

/**
 * Envia um push notification via WebSocket para forçar as TVs a recarregarem as categorias
 */
exports.syncDevices = async (req, res) => {
    try {
        const { broadcast } = require('../../websocket/wsServer');
        
        // Dispara o evento de force_reload para todos os aparelhos
        broadcast({ 
            type: 'FORCE_RELOAD_TV_CONFIG', 
            payload: { message: 'Atualização das categorias da TV' } 
        });

        res.json({ message: 'Sincronização enviada para todos os aparelhos.' });
    } catch (error) {
        console.error('Erro ao sincronizar aparelhos:', error);
        res.status(500).json({ error: 'Erro ao enviar sincronização via WebSocket' });
    }
};

/**
 * Ferramenta Rápida: Limpa sufixos de qualidades dos nomes (ex: "Globo SP FHD" -> "Globo SP")
 */
exports.cleanNames = async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const channels = await client.query('SELECT id, name FROM tv_channels');
            let updated = 0;
            
            for (const ch of channels.rows) {
                // regex JS para limpeza de sufixos de qualidade: (HD) [FHD] UHD 4K VIP
                const re = /\s*([\[\(])?\s*(fhd|hd|sd|4k|h\.?265|hevc|uhd|vip)\s*([\]\)])?\s*/gi;
                let newName = ch.name.replace(re, ' ').replace(/\s{2,}/g, ' ').trim();
                
                // Tratar traços soltos no final do nome, ex: "Globo - "
                newName = newName.replace(/\s*-\s*$/, '').trim();

                if (newName !== ch.name && newName.length > 0) {
                    await client.query('UPDATE tv_channels SET name = $1 WHERE id = $2', [newName, ch.id]);
                    updated++;
                }
            }
            
            await client.query('COMMIT');
            res.json({ message: 'Limpeza de nomes concluída!', updatedCount: updated });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Erro na limpeza de nomes:', error);
        res.status(500).json({ error: 'Erro ao limpar nomes' });
    }
};

/**
 * Ferramenta Rápida: Excluir canais baseado na qualidade informada
 */
exports.bulkDeleteQualities = async (req, res) => {
    const { quality } = req.body; // 'SD', 'HD'
    if (!quality) return res.status(400).json({ error: 'Qualidade não informada' });

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            let deleteQuery = '';
            
            if (quality.toUpperCase() === 'SD') {
                deleteQuery = `DELETE FROM tv_channels WHERE name ILIKE '% SD%' OR name ILIKE '%[SD]%' OR name ILIKE '%(SD)%'`;
            } else if (quality.toUpperCase() === 'HD') {
                deleteQuery = `DELETE FROM tv_channels WHERE (name ILIKE '% HD%' OR name ILIKE '%[HD]%' OR name ILIKE '%(HD)%') AND name NOT ILIKE '%FHD%'`;
            } else {
                throw new Error('Qualidade inválida para exclusão');
            }

            const result = await client.query(deleteQuery);
            await client.query('COMMIT');
            res.json({ message: `Canais ${quality} excluídos com sucesso.`, deletedCount: result.rowCount });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Erro no bulk delete:', error);
        res.status(500).json({ error: 'Erro ao excluir canais' });
    }
};

/**
 * Ajuste Fino: Atualiza os dados de um canal específico (Nome)
 */
exports.updateChannelName = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'O nome do canal não pode ser vazio.' });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('UPDATE tv_channels SET name = $1 WHERE id = $2', [name.trim(), id]);
            res.json({ message: 'Canal atualizado com sucesso!' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Erro ao atualizar canal:', error);
        res.status(500).json({ error: 'Erro ao atualizar canal' });
    }
};
/**
 * Ajuste Fino: Exclui Múltiplos Canais (Bulk Delete by IDs)
 */
exports.deleteMultipleChannels = async (req, res) => {
    const { channelIds } = req.body;

    if (!Array.isArray(channelIds) || channelIds.length === 0) {
        return res.status(400).json({ error: 'Nenhum canal fornecido.' });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Usando ANY para excluir um array de IDs rapidamente
            const result = await client.query('DELETE FROM tv_channels WHERE id = ANY($1::int[])', [channelIds]);
            await client.query('COMMIT');
            res.json({ message: 'Canais excluídos com sucesso!', deletedCount: result.rowCount });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Erro ao excluir múltiplos canais:', error);
        res.status(500).json({ error: 'Erro ao excluir canais' });
    }
};


/**
 * Detecta canais duplicados com numeração sequencial (MAX 01, MAX 02, MAX 03...)
 * Agrupa pelo nome base e retorna os grupos com 2+ canais.
 */
exports.detectDuplicateChannels = async (req, res) => {
    try {
        const channelsQuery = await pool.query('SELECT id, name, category_id, stream_url FROM tv_channels ORDER BY name ASC');
        const channels = channelsQuery.rows;

        // Extrair o nome base removendo números finais, qualidade e sufixos
        const getBaseName = (name) => {
            return String(name)
                .toLowerCase()
                .replace(/\b(fhd|full\s*hd|hd|sd|4k|uhd|h265|h\.265|hevc|vip)\b/gi, '')
                .replace(/\s*\d{1,3}\s*$/, '')       // Remove números no final (01, 02, 1, 2...)
                .replace(/\s*#\d+\s*$/, '')           // Remove #1, #2...
                .replace(/[\[\]\(\)\|]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        };

        // Agrupar por nome base
        const groups = {};
        for (const ch of channels) {
            const base = getBaseName(ch.name);
            if (base.length < 2) continue;
            if (!groups[base]) groups[base] = [];
            groups[base].push({
                id: ch.id,
                name: ch.name,
                categoryId: ch.category_id,
                streamUrl: ch.stream_url
            });
        }

        // Filtrar apenas grupos com 2+ canais (duplicados reais)
        const duplicates = [];
        for (const [baseName, channels] of Object.entries(groups)) {
            if (channels.length >= 2) {
                duplicates.push({
                    baseName,
                    count: channels.length,
                    channels
                });
            }
        }

        // Ordenar por quantidade de duplicados (mais duplicados primeiro)
        duplicates.sort((a, b) => b.count - a.count);

        res.json({ duplicates, totalGroups: duplicates.length });
    } catch (error) {
        console.error('Erro ao detectar duplicados:', error);
        res.status(500).json({ error: 'Erro ao detectar canais duplicados' });
    }
};

/**
 * Auditoria Inteligente de Categorias
 * Analisa os canais de uma categoria selecionada e sugere mudanças de acordo com o Cérebro Local.
 */
exports.auditCategoryChannels = async (req, res) => {
    const { categoryId } = req.body;
    if (!categoryId) return res.status(400).json({ error: 'ID da categoria é obrigatório' });

    try {
        // 1. Pegar todos os canais desta categoria
        const channelsQuery = await pool.query('SELECT id, name FROM tv_channels WHERE category_id = $1', [categoryId]);
        const channels = channelsQuery.rows;

        // 2. Pegar as categorias do banco do cliente (para o Cérebro saber pra onde mandar)
        const categoriesQuery = await pool.query('SELECT id, name, keywords FROM tv_categories');
        const dbCategories = categoriesQuery.rows;

        // 3. Rodar Auditoria (a inteligência de 2 camadas está no smartCategorizer)
        const suggestions = [];

        for (const channel of channels) {
            const suggestion = smartCategorizer.auditChannel(channel.name, dbCategories, categoryId);
            if (suggestion) {
                suggestions.push({
                    channelId: channel.id,
                    channelName: channel.name,
                    suggestedCategoryId: suggestion.suggestedCategoryId,
                    suggestedCategoryName: suggestion.suggestedCategoryName,
                    reason: suggestion.reason
                });
            }
        }

        res.json({ suggestions });
    } catch (error) {
        console.error('Erro na auditoria de categoria:', error);
        res.status(500).json({ error: 'Erro interno no servidor ao auditar.' });
    }
};

/**
 * Auditoria Inteligente do Staging (Canais Sem Categoria)
 * Analisa TODOS os canais sem categoria e sugere para onde cada um deveria ir.
 */
exports.auditStagingChannels = async (req, res) => {
    try {
        // 1. Pegar todos os canais SEM categoria
        const channelsQuery = await pool.query('SELECT id, name FROM tv_channels WHERE category_id IS NULL');
        const channels = channelsQuery.rows;

        // 2. Pegar as categorias do banco do cliente
        const categoriesQuery = await pool.query('SELECT id, name, keywords FROM tv_categories');
        const dbCategories = categoriesQuery.rows;

        // 3. Rodar Auditoria com o Cérebro (currentCategoryId = null)
        const suggestions = [];
        for (const channel of channels) {
            const suggestion = smartCategorizer.auditChannel(channel.name, dbCategories, null);
            if (suggestion) {
                suggestions.push({
                    channelId: channel.id,
                    channelName: channel.name,
                    suggestedCategoryId: suggestion.suggestedCategoryId,
                    suggestedCategoryName: suggestion.suggestedCategoryName,
                    reason: suggestion.reason
                });
            }
        }

        res.json({ suggestions });
    } catch (error) {
        console.error('Erro na auditoria de staging:', error);
        res.status(500).json({ error: 'Erro interno no servidor ao auditar staging.' });
    }
};
