/**
 * 🧠 CÉREBRO LOCAL MAXXCONTROL - Super Dicionário de TV
 * Versão 2.0 - Alimentado com pesquisa real da internet
 * 
 * CAMADA 1: Match por MARCA (nome do canal vs nome da categoria)
 * CAMADA 2: Match por GÊNERO (banco de conhecimento real de 500+ canais)
 * 
 * Fontes: SKY Brasil, Claro TV+, operadoras internacionais, Wikipedia, guias de TV
 */

const REAL_WORLD_TV_DATABASE = {

    // ═══════════════════════════════════════════════════════════════
    // 📺 CANAIS ABERTOS (Sinal Aberto Brasileiro + Internacionais)
    // ═══════════════════════════════════════════════════════════════
    "abertos": [
        // Brasil - Redes Nacionais
        "globo", "sbt", "record", "band", "redetv", "rede tv", "gazeta", "cultura", "futura",
        "aparecida", "cancao nova", "cancaonova", "canção nova", "rede minas", "redeminas",
        "rbi", "cnt", "record news", "tv brasil", "tv camara", "tv senado", "tv justica",
        "tv escola", "nbt", "rede vida", "tv ra tim bum", "tvt",
        // Brasil - Afiliadas Globo (por estado)
        "tv bahia", "tv sergipe", "tv anhanguera", "tv liberal", "tv morena",
        "tv tem", "tv fronteira", "tv tribuna", "tv vanguarda", "tv diario",
        "tv gazeta al", "tv gazeta es", "tv centro america", "tv tapajós",
        "tv roraima", "tv amapa", "tv rondonia", "tv acre", "tv grande rio",
        "tv asa branca", "tv cabrália", "tv santa cruz", "tv sudoeste",
        "tv subaé", "tv são francisco", "tv verdes mares", "tv paraíba",
        "inter tv", "inter tv rj", "inter tv cabugi", "inter tv grande minas",
        "rpc", "rpc tv", "tv paranaense", "eptv", "nstv", "tv tem bauru",
        "tv rio sul", "tv mirante", "tv meio norte", "tv clube pi",
        "tv cabo branco", "tv trem", "tv integração",
        // Brasil - Afiliadas Record
        "tv vitória", "tv itapoan", "tv correio", "tv imperial",
        "tv pampa", "tv cidade verde", "record brasília",
        // Brasil - Afiliadas SBT
        "tv alterosa", "tv jornal", "tv aratu", "sbt interior",
        "sbt rs", "sbt sc", "sbt brasília",
        // Brasil - Afiliadas Band
        "band rs", "band vale", "band minas", "band bahia",
        "tv tribuna pe", "rede bandeirantes",
        // Brasil - Regionais e Comunitárias
        "tv ponta negra", "arapuan", "sbt pernambuco",
        "tve bahia", "tve rs", "tv assembleia", "tv alesp",
        "tv alerj", "tv câmara mg", "tv educativa", "canal futura",
        // Portugal
        "rtp", "sic", "tvi",
        // Espanha
        "antena 3", "telecinco", "la sexta", "cuatro",
        // Argentina
        "telefe", "el trece", "america tv", "tv publica",
        // Chile
        "tvn", "canal 13", "mega", "chilevision",
        // México
        "televisa", "tv azteca", "canal 5",
        // USA
        "abc", "nbc", "cbs", "fox", "pbs",
        // UK
        "bbc one", "bbc two", "itv", "channel 4", "channel 5"
    ],

    // ═══════════════════════════════════════════════════════════════
    // ⚽ ESPORTES
    // ═══════════════════════════════════════════════════════════════
    "esportes": [
        // Brasil
        "premiere", "sportv", "sport tv", "bandsports", "band sports",
        "nosso futebol", "nos studios", "combate", "woohoo",
        // Internacional
        "espn", "fox sports", "dazn", "conmebol", "eurosport",
        "bein", "bein sports", "sky sports", "bt sport",
        "star sports", "supersport", "tsn", "sportsnet",
        "tnt sports", "eleven sports", "premier sports",
        // Lutas e Combate
        "ufc", "fight", "combate", "boxing", "wrestling",
        // Motor
        "motorsport", "racing", "nascar",
        // Futebol Internacional
        "gol tv", "goltv", "futbol", "football"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🎬 FILMES E SÉRIES
    // ═══════════════════════════════════════════════════════════════
    "filmes": [
        // Premium Brasil
        "telecine", "megapix", "cinemax",
        // HBO / Warner
        "hbo", "max", "warner", "tnt", "tcm", "space",
        // Star / Disney
        "star channel", "star premium", "star hits", "star action", "star comedy",
        "star life", "star cinema",
        // Fox / Paramount
        "fox channel", "paramount", "paramount network",
        // Universal / NBC
        "universal", "universal channel", "studio universal",
        // Sony / AXN
        "sony", "sony channel", "axn", "axn black", "axn white",
        // AMC
        "amc", "amc+",
        // FX
        "fx", "fxx", "fxm",
        // Outros
        "syfy", "a&e", "lifetime movies",
        "cinema", "cine", "movie", "movies",
        // Streaming Channels
        "netflix", "prime video", "disney plus", "apple tv",
        "globoplay", "hulu", "peacock",
        // Clássicos
        "arte 1"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 📖 DOCUMENTÁRIOS
    // ═══════════════════════════════════════════════════════════════
    "documentarios": [
        "discovery", "discovery channel", "discovery turbo", "discovery science",
        "discovery home", "discovery theater", "discovery familia", "dtv",
        "national geographic", "nat geo", "nat geo wild", "nat geo kids",
        "history", "history channel", "h2", "history 2",
        "animal planet",
        "smithsonian", "smithsonian channel",
        "fishtv", "fish tv",
        "bbc earth", "bbc world",
        "investigation discovery", "id", "true crime",
        "curta!", "curta",
        "travel channel", "dmax",
        "tlc", "food network", "hgtv",
        "quest", "pbs nature"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 📰 NOTÍCIAS
    // ═══════════════════════════════════════════════════════════════
    "noticias": [
        // Brasil
        "globonews", "globo news", "cnn brasil", "cnn",
        "bandnews", "band news", "jovem pan", "jp news",
        "record news", "recordnews",
        // Internacional
        "bbc news", "bbc world news",
        "cnn international", "cnn en espanol",
        "sky news", "al jazeera", "france 24",
        "dw", "deutsche welle", "euronews", "rt",
        "bloomberg", "cnbc", "fox news", "msnbc",
        "nhk world", "i24", "trt world",
        // Portugal
        "sic noticias", "tvi 24", "rtp 3",
        // Argentina
        "c5n", "todo noticias", "tn", "cronica tv", "a24",
        // Espanha
        "rtve 24h"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🧒 INFANTIL
    // ═══════════════════════════════════════════════════════════════
    "infantil": [
        "cartoon", "cartoon network",
        "discovery kids", "disc kids",
        "disney channel", "disney junior", "disney xd",
        "nickelodeon", "nick", "nick jr", "nickjr", "nicktoons", "nick music",
        "boomerang", "tooncast",
        "gloob", "gloobinho",
        "tv ra tim bum", "ratimbum",
        "baby tv", "babytv",
        "ducktv", "jimjam", "frisbee",
        "laeffe", "karusel",
        "treehouse", "cbbc", "cbeebies",
        "pbs kids", "sprout",
        "pluto tv kids"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🎭 VARIEDADES / ENTRETENIMENTO / LIFESTYLE
    // ═══════════════════════════════════════════════════════════════
    "variedades": [
        "gnt", "viva", "multishow",
        "comedy central", "e!", "e! entertainment",
        "lifetime", "tlc", "dtv",
        "food network", "hgtv", "home & health",
        "off", "modo viagem", "travel box", "travel box brazil",
        "travel channel",
        "arte 1", "fashion tv", "ftv",
        "tbs", "trutv", "bravo",
        "casa", "decora",
        "shoptime", "polishop"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🎵 MÚSICA
    // ═══════════════════════════════════════════════════════════════
    "musica": [
        "mtv", "mtv hits", "mtv live", "mtv rocks", "mtv classic",
        "bis", "vh1", "vh1 classic",
        "trace brazuca", "trace urban", "trace latina",
        "music box", "mezzo", "stingray",
        "clubbing tv", "deluxe music",
        "nick music", "hit tv", "bridge tv"
    ],

    // ═══════════════════════════════════════════════════════════════
    // ✝️ RELIGIOSOS
    // ═══════════════════════════════════════════════════════════════
    "religiosos": [
        // Católicos
        "rede vida", "tv aparecida", "cancao nova", "cancaonova", "canção nova",
        "tv seculo 21", "tv evangelizar", "tv nazare", "tv horizonte",
        "tv pai eterno", "tv imaculada", "tv 3 milenio",
        // Evangélicos
        "novo tempo", "rede gospel", "rede super",
        "rit tv", "rit", "rede genesis", "genesis",
        "tv plenitude", "boas novas",
        "tbn", "daystar", "ewtn",
        // Genéricos
        "religios", "gospel", "catolica", "evangelica", "igreja", "biblia"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🔞 ADULTOS
    // ═══════════════════════════════════════════════════════════════
    "adultos": [
        "playboy", "playboy tv", "sextreme", "venus", "hot",
        "brazzers", "reality kings", "naughty",
        "penthouse", "hustler", "vivid",
        "adult swim", "red light",
        "xxx", "erotic", "erotica", "sexo", "sexy",
        "dorcel", "private tv", "extasy"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🏆 TOP 10 / DESTAQUES / MAIS ASSISTIDOS
    // ═══════════════════════════════════════════════════════════════
    "top10": [
        // Genéricos
        "top 10", "top10", "top 5", "top5", "top 20", "top20",
        "mais assistidos", "mais vistos", "destaques", "em alta",
        "trending", "populares", "recomendados",
        // Top Filmes
        "top 10 filmes", "top filmes", "top movies",
        "melhores filmes", "filmes em alta",
        // Top Séries
        "top 10 series", "top series", "top séries",
        "melhores series", "séries em alta", "series em alta",
        // Top por Plataforma
        "top netflix", "top prime", "top disney",
        "top hbo", "top max", "top globoplay",
        "top amazon", "top apple",
        "netflix top", "prime top", "disney top",
        // Top por Gênero
        "top ação", "top acao", "top terror", "top comedia", "top comédia",
        "top drama", "top romance", "top animação", "top animacao",
        "top ficção", "top ficcao", "top aventura", "top suspense",
        // Lançamentos
        "lançamentos", "lancamentos", "estreias", "novidades",
        "recém adicionados", "recem adicionados", "últimos adicionados"
    ],
    // ═══════════════════════════════════════════════════════════════
    // 🎮 ANIME / GEEK / CULTURA POP
    // ═══════════════════════════════════════════════════════════════
    "animes": [
        "crunchyroll", "funimation", "anime",
        "toonami", "animax", "animebox",
        "tokio", "toei", "manga",
        "pluto tv anime", "anime onegai", "wakanim"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🍳 CULINÁRIA / GASTRONOMIA
    // ═══════════════════════════════════════════════════════════════
    "culinaria": [
        "food network", "cooking channel", "sabor e arte", "sabor",
        "masterchef", "tastemade", "bon appetit",
        "gastronomia", "culinaria", "cozinha", "receita"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇦🇷🇨🇱🇲🇽🇪🇸🇵🇹🇮🇹🇫🇷🇺🇸🇬🇧 PAÍSES (para categorias por país)
    // ═══════════════════════════════════════════════════════════════
    "argentina": [
        "telefe", "el trece", "america tv", "tv publica argentina",
        "c5n", "todo noticias", "cronica", "a24",
        "tyc sports", "deportv", "canal 9", "canal 26",
        "elnueve", "net tv ar", "america 2"
    ],
    "chile": [
        "tvn chile", "canal 13 chile", "mega chile", "chilevision",
        "cdf", "tnt sports chile", "cnn chile", "la red chile",
        "tv chile", "etc tv"
    ],
    "mexico": [
        "televisa", "tv azteca", "canal 5 mx", "azteca uno",
        "azteca 7", "canal once", "imagen tv", "tudn",
        "las estrellas", "canal de las estrellas", "fox mexico",
        "milenio tv", "foro tv", "adn 40", "nu9ve"
    ],
    "espanha": [
        "antena 3", "telecinco", "la sexta", "cuatro",
        "movistar", "dazn spain", "gol", "rtve",
        "la liga", "bein laliga", "tve", "clan tv",
        "neox", "nova", "mega spain", "energy", "divinity",
        "dkiss", "be mad", "trece tv", "atreseries"
    ],
    "portugal": [
        "rtp", "rtp 1", "rtp 2", "rtp 3", "rtp memoria",
        "sic", "sic noticias", "sic radical", "sic mulher", "sic caras",
        "tvi", "tvi reality", "tvi ficção", "tvi player",
        "sport tv portugal", "benfica tv", "porto canal",
        "cmtv", "cnn portugal"
    ],
    "italia": [
        "rai", "rai 1", "rai 2", "rai 3", "rai news", "rai sport", "rai movie", "rai premium",
        "mediaset", "canale 5", "italia 1", "rete 4",
        "la7", "sky italia", "dazn italia",
        "cielo", "tv8", "nove italia", "real time"
    ],
    "franca": [
        "tf1", "france 2", "france 3", "france 24", "france 5",
        "m6", "canal+", "canal plus", "arte", "bfm tv",
        "rmc sport", "w9", "tmc", "c8", "cstar", "gulli",
        "lci", "cnews", "rmc decouverte"
    ],
    "eua": [
        "abc", "nbc", "cbs", "fox", "pbs", "cw",
        "hbo", "showtime", "starz", "cinemax",
        "usa network", "tbs", "tnt usa",
        "amc", "fx", "freeform", "syfy",
        "lifetime", "hallmark", "bet", "own", "we tv",
        "oxygen", "pop tv", "reelz", "ion", "cozi tv"
    ],
    "uk": [
        "bbc", "bbc one", "bbc two", "bbc three", "bbc four", "bbc alba",
        "itv", "itv2", "itv3", "itv4", "itvbe",
        "channel 4", "channel 5", "e4", "more4",
        "sky one", "sky atlantic", "sky cinema", "sky arts",
        "dave", "film4", "yesterday", "drama", "quest"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇨🇴 COLÔMBIA
    // ═══════════════════════════════════════════════════════════════
    "colombia": [
        "caracol", "caracol tv", "canal rcn", "rcn",
        "canal 1 colombia", "senal colombia", "citytv",
        "canal institucional", "telepacifico", "teleantioquia",
        "telecaribe", "telecafe", "canal capital",
        "win sports", "directv sports colombia"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇵🇪 PERU
    // ═══════════════════════════════════════════════════════════════
    "peru": [
        "america television", "latina tv", "panamericana",
        "tv peru", "canal n", "rpp tv", "atv", "atv+",
        "willax", "exitosa", "sol tv"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇺🇾 URUGUAI
    // ═══════════════════════════════════════════════════════════════
    "uruguai": [
        "monte carlo tv", "canal 10 uruguay", "teledoce",
        "la tele", "vtv uruguay", "tv ciudad"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇵🇾 PARAGUAI
    // ═══════════════════════════════════════════════════════════════
    "paraguai": [
        "telefuturo", "snt", "trece paraguay", "rpc",
        "la tele py", "paravisión", "unicanal", "canal pro"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇪🇨 EQUADOR
    // ═══════════════════════════════════════════════════════════════
    "equador": [
        "ecuavisa", "teleamazonas", "tc television",
        "canal uno ec", "gamatv", "rts ecuador",
        "televicentro", "oromar tv"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇩🇪 ALEMANHA
    // ═══════════════════════════════════════════════════════════════
    "alemanha": [
        "ard", "das erste", "zdf", "rtl", "sat.1", "sat1",
        "prosieben", "pro7", "vox", "kabel eins", "rtl2",
        "n-tv", "welt", "phoenix", "3sat", "arte deutsch",
        "kika", "tagesschau", "sport1", "sky sport de",
        "dazn germany", "nitro", "sixx", "super rtl"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇷🇺 RÚSSIA
    // ═══════════════════════════════════════════════════════════════
    "russia": [
        "perviy kanal", "channel one russia", "rossiya 1", "rossiya 24",
        "ntv", "ren tv", "sts", "tnt russia", "match tv",
        "domashny", "pyatnitsa", "zvezda", "mir",
        "karusel", "friday", "tv rain", "dozhd",
        "russia today", "rt russia", "moscow 24"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇮🇳 ÍNDIA
    // ═══════════════════════════════════════════════════════════════
    "india": [
        "star plus", "star plus india", "star bharat", "star gold",
        "zee tv", "zee cinema", "zee cafe", "zee5",
        "sony tv india", "sony sab", "sony max",
        "colors tv", "colors cineplex",
        "ndtv", "ndtv india", "times now",
        "aaj tak", "india today", "republic tv",
        "dd national", "dd news", "dd sports",
        "sun tv", "maa tv", "gemini tv",
        "set max", "star sports india"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇯🇵 JAPÃO
    // ═══════════════════════════════════════════════════════════════
    "japao": [
        "nhk", "nhk world", "nhk bs",
        "fuji tv", "tv asahi", "tbs japan", "tv tokyo",
        "nippon tv", "ntv japan", "wowow",
        "animax japan", "at-x"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇰🇷 COREIA DO SUL
    // ═══════════════════════════════════════════════════════════════
    "coreia": [
        "kbs", "kbs world", "mbc korea", "sbs korea",
        "tvn korea", "jtbc", "mnet", "arirang",
        "channel a", "tv chosun", "ocn",
        "korean drama", "k-drama", "kdrama", "viki"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇸🇦🇦🇪 ÁRABE / ORIENTE MÉDIO
    // ═══════════════════════════════════════════════════════════════
    "arabe": [
        "mbc", "mbc 1", "mbc 2", "mbc 3", "mbc 4", "mbc drama", "mbc action", "mbc max",
        "al jazeera", "al arabiya", "al mayadeen",
        "rotana", "rotana cinema", "rotana khalijia",
        "abu dhabi tv", "dubai tv", "sharjah tv",
        "lbc", "mtv lebanon", "otv",
        "bein", "bein sports arab", "bein movies",
        "ssc", "ssc sport", "shahid"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇹🇷 TURQUIA
    // ═══════════════════════════════════════════════════════════════
    "turquia": [
        "trt", "trt 1", "trt world", "trt haber", "trt spor",
        "atv turk", "show tv", "star tv turk", "kanal d",
        "fox turk", "tv8 turk", "teve2", "beyaz tv",
        "trt cocuk", "trt muzik", "trt belgesel",
        "kanal 7 turk", "turkmax"
    ],

    // ═══════════════════════════════════════════════════════════════
    // 🇨🇦 CANADÁ
    // ═══════════════════════════════════════════════════════════════
    "canada": [
        "cbc", "ctv", "global tv canada", "city tv",
        "tsn", "sportsnet", "rds",
        "tvo", "tvontario", "ici tele",
        "aptn", "cpac", "much music"
    ]
};

/**
 * Limpa o nome do canal removendo sufixos de qualidade para obter a MARCA pura.
 */
function extractBrand(channelName) {
    return String(channelName)
        .toLowerCase()
        .replace(/\b(fhd|full\s*hd|hd|sd|4k|uhd|24h|h265|h\.265|hevc|vip|br|pt|lat|us|uk)\b/gi, '')
        .replace(/[\[\]\(\)\|]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * CAMADA 1 - Match por MARCA (com Multi-Word Priority)
 * Se existe uma categoria "CANAIS TOP 10" e o canal é "Top 10 Filmes", 
 * a frase "top 10" (2 palavras) ganha prioridade sobre "filmes" (1 palavra).
 */
function findBrandMatch(channelName, dbCategories, currentCategoryId) {
    const brand = extractBrand(channelName);
    if (!brand || brand.length < 2) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (const cat of dbCategories) {
        if (cat.id === currentCategoryId) continue;

        const catName = String(cat.name).toLowerCase().trim();
        // Limpar a categoria (ex: "TELECINE & HBO" -> "telecine  hbo")
        const catClean = catName.replace(/[&,\/\-]/g, ' ').replace(/\s+/g, ' ').trim();
        const catWords = catClean.split(' ').filter(w => w.length >= 2);

        // 1. Nome completo da categoria no canal? (melhor match possível)
        if (catClean.length >= 3 && brand.includes(catClean)) {
            const score = catClean.length * 3; // Bônus máximo
            if (score > bestScore) {
                bestScore = score;
                bestMatch = {
                    suggestedCategoryId: cat.id,
                    suggestedCategoryName: cat.name,
                    reason: `Categoria "${cat.name}" corresponde ao nome do canal`
                };
            }
        }

        // 2. Multi-word: testar bigrams e trigrams do nome da categoria
        // Ex: "canais top 10" -> bigrams: ["canais top", "top 10"]
        for (let len = Math.min(catWords.length, 3); len >= 2; len--) {
            for (let i = 0; i <= catWords.length - len; i++) {
                const phrase = catWords.slice(i, i + len).join(' ');
                if (phrase.length >= 3 && brand.includes(phrase)) {
                    const score = phrase.length * 2; // Bônus por multi-word
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = {
                            suggestedCategoryId: cat.id,
                            suggestedCategoryName: cat.name,
                            reason: `Categoria "${cat.name}" corresponde ao nome do canal`
                        };
                    }
                }
            }
        }

        // 3. Single word: cada palavra da categoria no canal
        for (const part of catWords) {
            if (brand.includes(part) && part.length >= 3) {
                const score = part.length; // Sem bônus
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = {
                        suggestedCategoryId: cat.id,
                        suggestedCategoryName: cat.name,
                        reason: `Categoria "${cat.name}" corresponde ao nome do canal`
                    };
                }
            }
        }
    }

    return bestMatch;
}

/**
 * CAMADA 2 - Match por GÊNERO (Banco de Conhecimento Real)
 */
function findGenreMatch(channelName, dbCategories, currentCategoryId) {
    const nameLower = String(channelName).toLowerCase();
    
    let suggestedMacroGenre = null;
    for (const [genre, channels] of Object.entries(REAL_WORLD_TV_DATABASE)) {
        if (channels.some(c => nameLower.includes(c))) {
            suggestedMacroGenre = genre;
            break;
        }
    }

    if (!suggestedMacroGenre) return null;

    for (const cat of dbCategories) {
        if (cat.id === currentCategoryId) continue;
        
        const catNameLower = String(cat.name).toLowerCase();
        let kws = [];
        try { kws = Array.isArray(cat.keywords) ? cat.keywords : JSON.parse(cat.keywords || '[]'); } catch(e){}
        
        if (catNameLower.includes(suggestedMacroGenre) || kws.some(kw => String(kw).toLowerCase().includes(suggestedMacroGenre))) {
            return {
                suggestedCategoryId: cat.id,
                suggestedCategoryName: cat.name,
                reason: `Detectado como '${suggestedMacroGenre}'`
            };
        }
    }

    return null;
}

/**
 * Função principal - Auditoria com 2 camadas de inteligência.
 * 
 * @param {string} channelName Nome do canal
 * @param {Array} dbCategories Categorias do banco do cliente
 * @param {number} currentCategoryId ID da categoria onde o canal está AGORA
 * @returns {Object|null} Sugestão de correção
 */
exports.auditChannel = (channelName, dbCategories, currentCategoryId) => {
    if (!channelName) return null;

    const brand = extractBrand(channelName);
    const nameLower = String(channelName).toLowerCase().trim();
    
    // ╔══════════════════════════════════════════════════════════╗
    // ║  REGRAS DE PRIORIDADE ABSOLUTA (checadas ANTES de tudo) ║
    // ╚══════════════════════════════════════════════════════════╝

    // REGRA 1: Canal começa com "24H" → vai para categoria 24H (não importa o resto)
    // Captura: "24H Filmes", "24h • Terror", "24H-Ação", "24 H Comédia"
    if (/^24\s*h\s*[•\-\|:]?\s*/i.test(nameLower)) {
        for (const cat of dbCategories) {
            if (cat.id === currentCategoryId) continue;
            if (String(cat.name).toLowerCase().includes('24h') || String(cat.name).toLowerCase().includes('24 h')) {
                return {
                    suggestedCategoryId: cat.id,
                    suggestedCategoryName: cat.name,
                    reason: `Canal 24H detectado`
                };
            }
        }
    }

    // REGRA 2: Canal com formato de JOGO/PARTIDA → vai para categoria Jogos do Dia
    // Captura: "Valencia x Rayo Vallecano 14h", "Flamengo x Palmeiras 21h", "Brasil vs Argentina"
    if (/\b(x|vs|versus)\b/i.test(nameLower) && (/\d{1,2}\s*h/i.test(nameLower) || /\d{1,2}:\d{2}/.test(nameLower))) {
        for (const cat of dbCategories) {
            if (cat.id === currentCategoryId) continue;
            const cn = String(cat.name).toLowerCase();
            if (cn.includes('jogo') || cn.includes('jogos') || cn.includes('partida') || cn.includes('ao vivo') || cn.includes('live match')) {
                return {
                    suggestedCategoryId: cat.id,
                    suggestedCategoryName: cat.name,
                    reason: `Jogo/Partida ao vivo detectado`
                };
            }
        }
    }
    // Também sem horário mas com "x" ou "vs" entre dois nomes (ex: "Real Madrid x Barcelona")
    if (/^[\w\sáàâãéêíóôõúçñ\.]+\s+(x|vs)\s+[\w\sáàâãéêíóôõúçñ\.]+$/i.test(nameLower.trim())) {
        for (const cat of dbCategories) {
            if (cat.id === currentCategoryId) continue;
            const cn = String(cat.name).toLowerCase();
            if (cn.includes('jogo') || cn.includes('jogos') || cn.includes('partida') || cn.includes('ao vivo') || cn.includes('live match')) {
                return {
                    suggestedCategoryId: cat.id,
                    suggestedCategoryName: cat.name,
                    reason: `Jogo/Partida detectado`
                };
            }
        }
    }
    // PROTEÇÃO: Se o canal já está numa categoria que contém o nome dele, não mover.
    const currentCat = dbCategories.find(c => c.id === currentCategoryId);
    if (currentCat) {
        const currentCatName = String(currentCat.name).toLowerCase().trim();
        const currentCatParts = currentCatName.replace(/[&,\/\-]/g, ' ').split(' ').filter(w => w.length >= 3);

        // Se o nome da categoria atual contém a marca do canal
        if (currentCatName.length >= 3 && brand.includes(currentCatName)) {
            return null;
        }
        // Se alguma parte significativa do nome da categoria está no canal
        for (const part of currentCatParts) {
            if (brand.includes(part) && part.length >= 3) {
                return null;
            }
        }
    }

    // CAMADA 1: Tem alguma OUTRA categoria com o nome do canal? 
    const brandMatch = findBrandMatch(channelName, dbCategories, currentCategoryId);
    if (brandMatch) return brandMatch;

    // CAMADA 2: Tem alguma categoria de GÊNERO que corresponde?
    const genreMatch = findGenreMatch(channelName, dbCategories, currentCategoryId);
    if (genreMatch) return genreMatch;

    return null;
};
