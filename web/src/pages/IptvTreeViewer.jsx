import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { Tv, Film, Clapperboard, RefreshCw, Search, Copy, ChevronRight, ChevronDown, X, Loader, List, CheckCircle, ClipboardList } from 'lucide-react';

const IptvTreeViewer = () => {
  const [configSource, setConfigSource] = useState('global');
  const [devices, setDevices] = useState([]);
  const [credentials, setCredentials] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedStream, setSelectedStream] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('live');
  const [showTestLists, setShowTestLists] = useState(false);
  const [testingList, setTestingList] = useState(null);
  const [manualConfig, setManualConfig] = useState({
    url: '',
    username: '',
    password: ''
  });
  const [loadingManual, setLoadingManual] = useState(false);
  const [expandingAll, setExpandingAll] = useState(false);

  // Listas IPTV públicas de teste (Xtream Codes)
  const testLists = [
    {
      id: 1,
      name: 'Servidor Teste 1',
      url: 'http://xtream.swiftiptv.com:8080',
      username: 'test',
      password: 'test',
      description: 'Servidor público de teste com canais internacionais'
    },
    {
      id: 2,
      name: 'Servidor Teste 2',
      url: 'http://pro.xviptv.com:25443',
      username: 'test',
      password: 'test',
      description: 'Servidor de demonstração com múltiplas categorias'
    },
    {
      id: 3,
      name: 'Servidor Teste 3',
      url: 'http://iptv.allkaicerteam.com:8080',
      username: 'test',
      password: 'test',
      description: 'Servidor teste com VOD e séries'
    }
  ];

  // Carregar configuração e dispositivos
  useEffect(() => {
    loadConfig();
  }, []);

  // Carregar categorias quando fonte ou tab mudar
  useEffect(() => {
    if (credentials) {
      loadCategories(activeTab);
    }
  }, [configSource, activeTab, credentials]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      // Buscar configuração global
      const configRes = await api.get('/api/iptv-server/config');
      setCredentials(configRes.data);
      
      // Buscar dispositivos
      const devicesRes = await api.get('/api/device/list-all');
      const devicesList = Array.isArray(devicesRes.data) ? devicesRes.data : [];
      setDevices(devicesList);
      
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar configuração:', err);
      setError('Erro ao carregar configuração. Configure o servidor IPTV primeiro.');
      setDevices([]);
      setCredentials(null);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/iptv-tree/categories/${type}`, {
        params: { source: configSource }
      });
      
      if (response.data.success) {
        const categories = response.data.data || [];
        
        // Construir hierarquia
        const tree = buildHierarchy(categories, type);
        setTreeData(tree);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      
      if (err.response?.status === 401) {
        setError('Credenciais inválidas. Verifique a configuração do servidor IPTV.');
      } else if (err.response?.status === 400) {
        setError('Configure o servidor IPTV primeiro na página de configurações.');
      } else if (err.response?.status === 504) {
        setError('Timeout na conexão. Verifique o servidor IPTV.');
      } else {
        setError('Erro ao carregar categorias. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (categories, contentType) => {
    const map = new Map();
    const roots = [];
    
    // Criar mapa de categorias
    categories.forEach(cat => {
      const name = cat.category_name || cat.name || cat.title || cat.category_id || 'Sem nome'
      const node = {
        id: `${contentType}-category-${cat.category_id}`,
        type: 'category',
        contentType: contentType,
        name: String(name),
        parent_id: cat.parent_id,
        category_id: cat.category_id,
        children: [],
        loaded: false,
        metadata: cat
      };
      map.set(cat.category_id, node);
    });
    
    // Construir hierarquia
    map.forEach(node => {
      if (node.parent_id === 0 || node.parent_id === '0') {
        roots.push(node);
      } else {
        const parent = map.get(node.parent_id) || map.get(String(node.parent_id));
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });
    
    return roots;
  };

  const loadStreams = async (node) => {
    try {
      const type = node.contentType;
      const categoryId = node.category_id;

      // Séries usam endpoint próprio
      const endpoint = type === 'series'
        ? `/api/iptv-tree/series/${categoryId}`
        : `/api/iptv-tree/streams/${type}/${categoryId}`;

      const response = await api.get(endpoint, {
        params: { source: configSource }
      });
      
      if (response.data.success) {
        const streams = response.data.data || [];
        
        // Criar nós de stream
        const streamNodes = streams.map(stream => ({
          id: `${type}-stream-${stream.stream_id || stream.series_id}`,
          type: type === 'series' ? 'stream' : 'stream',
          contentType: type,
          name: stream.name || stream.title || stream.stream_display_name || String(stream.stream_id || stream.series_id),
          parent_id: node.id,
          // Séries têm filhos (temporadas), live/vod não
          children: type === 'series' ? [] : null,
          loaded: type !== 'series',
          metadata: stream
        }));
        
        // Atualizar árvore
        updateNodeChildren(node.id, streamNodes);
      }
    } catch (err) {
      console.error('Erro ao carregar streams:', err);
      setError('Erro ao carregar conteúdo da categoria.');
    }
  };

  const loadSeriesInfo = async (node) => {
    try {
      const seriesId = node.metadata.series_id;
      
      const response = await api.get(`/api/iptv-tree/series-info/${seriesId}`, {
        params: { source: configSource }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        const seasons = data.seasons || [];
        
        // Criar nós de temporadas e episódios
        const seasonNodes = seasons.map(season => {
          const episodes = (season.episodes || []).map(ep => ({
            id: `series-episode-${ep.id}`,
            type: 'episode',
            contentType: 'series',
            name: `${ep.episode_num}. ${ep.title}`,
            parent_id: `series-season-${season.season_number}`,
            children: null,
            loaded: true,
            metadata: ep
          }));
          
          return {
            id: `series-season-${season.season_number}`,
            type: 'season',
            contentType: 'series',
            name: season.name || `Temporada ${season.season_number}`,
            parent_id: node.id,
            children: episodes,
            loaded: true,
            metadata: season
          };
        });
        
        updateNodeChildren(node.id, seasonNodes);
      }
    } catch (err) {
      console.error('Erro ao carregar informações da série:', err);
      setError('Erro ao carregar episódios da série.');
    }
  };

  const updateNodeChildren = (nodeId, children) => {
    const updateTree = (nodes) => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, children, loaded: true };
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    
    setTreeData(prev => updateTree(prev));
  };

  const handleToggle = async (node) => {
    const newExpanded = new Set(expandedNodes);
    
    if (newExpanded.has(node.id)) {
      newExpanded.delete(node.id);
    } else {
      newExpanded.add(node.id);
      
      // Lazy loading
      if (!node.loaded && node.type === 'category') {
        if (node.contentType === 'series') {
          await loadStreams(node);
        } else {
          await loadStreams(node);
        }
      } else if (!node.loaded && node.type === 'stream' && node.contentType === 'series') {
        await loadSeriesInfo(node);
      }

      // Scroll para mostrar o conteúdo expandido (de baixo para cima)
      setTimeout(() => {
        const el = document.querySelector(`[data-node-id="${node.id}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    
    setExpandedNodes(newExpanded);
  };

  const handleConfigChange = (newSource) => {
    setConfigSource(newSource);
    setTreeData([]);
    setExpandedNodes(new Set());
    setSelectedStream(null);
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    try {
      await api.post('/api/iptv-tree/clear-cache', { source: configSource });
      setTreeData([]);
      setExpandedNodes(new Set());
      await loadCategories(activeTab);
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      setError('Erro ao atualizar cache.');
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert('URL copiado para área de transferência!');
  };

  // Expande todas as categorias sem travar — carrega em background com concorrência limitada
  const handleExpandAll = async () => {
    setExpandingAll(true);
    try {
      // 1. Expande tudo imediatamente (o que já está carregado aparece na hora)
      const newExpanded = new Set(expandedNodes);
      const toLoad = [];

      const collectCategories = (nodes) => {
        nodes.forEach(node => {
          newExpanded.add(node.id);
          if (!node.loaded && node.type === 'category') {
            toLoad.push(node);
          }
          if (node.children && node.children.length > 0) {
            collectCategories(node.children);
          }
        });
      };

      collectCategories(treeData);
      setExpandedNodes(new Set(newExpanded));

      if (toLoad.length === 0) return;

      // 2. Carrega streams em background com no máximo 3 requisições simultâneas
      const CONCURRENCY = 3;
      let index = 0;

      const runNext = async () => {
        if (index >= toLoad.length) return;
        const node = toLoad[index++];
        await loadStreams(node);
        await runNext();
      };

      const workers = Array.from({ length: Math.min(CONCURRENCY, toLoad.length) }, runNext);
      await Promise.all(workers);
    } finally {
      setExpandingAll(false);
    }
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Coleta todos os nomes + IDs visíveis na árvore (expandidos)
  const collectAllNames = (nodes, expanded, result = []) => {
    nodes.forEach(node => {
      const id = node.metadata?.stream_id || node.metadata?.series_id || node.metadata?.id || null;
      const label = id ? `${node.name || '(sem nome)'} | ID: ${id}` : (node.name || '(sem nome)');
      result.push(label);
      if (expanded.has(node.id) && node.children && node.children.length > 0) {
        collectAllNames(node.children, expanded, result);
      }
    });
    return result;
  };

  const handleCopyAll = () => {
    const names = collectAllNames(filteredTree, expandedNodes);
    if (names.length === 0) {
      alert('Nenhum item para copiar.');
      return;
    }
    navigator.clipboard.writeText(names.join('\n'));
    alert(`✅ ${names.length} itens copiados para a área de transferência!`);
  };

  const handleLoadManualList = async () => {
    setLoadingManual(true);
    
    try {
      // Testar conexão primeiro
      const testResponse = await api.post('/api/iptv-server/test', {
        xtream_url: manualConfig.url,
        xtream_username: manualConfig.username,
        xtream_password: manualConfig.password
      });
      
      if (testResponse.data.success) {
        // Salvar como configuração global
        await api.post('/api/iptv-server/config', {
          xtream_url: manualConfig.url,
          xtream_username: manualConfig.username,
          xtream_password: manualConfig.password
        });
        
        // Recarregar configuração
        await loadConfig();
        
        // Carregar categorias automaticamente
        await loadCategories(activeTab);
        
        alert('✅ Lista IPTV configurada! Árvore carregada com sucesso.');
        
        // Limpar campos
        setManualConfig({ url: '', username: '', password: '' });
      } else {
        alert(`❌ Falha ao conectar: ${testResponse.data.message}`);
      }
    } catch (err) {
      console.error('Erro ao carregar lista:', err);
      const errorMsg = err.response?.data?.message || 'Erro ao testar conexão com a lista';
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoadingManual(false);
    }
  };

  const handleTestList = async (testList) => {
    setTestingList(testList.id);
    setShowTestLists(false);
    
    try {
      // Testar conexão primeiro
      const testResponse = await api.post('/api/iptv-server/test', {
        xtream_url: testList.url,
        xtream_username: testList.username,
        xtream_password: testList.password
      });
      
      if (testResponse.data.success) {
        // Salvar como configuração global
        await api.post('/api/iptv-server/config', {
          xtream_url: testList.url,
          xtream_username: testList.username,
          xtream_password: testList.password
        });
        
        // Recarregar configuração
        await loadConfig();
        
        // Carregar categorias automaticamente
        await loadCategories(activeTab);
        
        alert(`✅ Lista "${testList.name}" configurada! Árvore carregada.`);
      } else {
        alert(`❌ Falha ao conectar: ${testResponse.data.message}`);
      }
    } catch (err) {
      console.error('Erro ao testar lista:', err);
      alert('❌ Erro ao testar conexão com a lista');
    } finally {
      setTestingList(null);
    }
  };

  const formatStreamUrl = (stream, credentials) => {
    if (!credentials) return '';
    
    const { xtream_url, xtream_username, xtream_password } = credentials;
    
    if (stream.contentType === 'live') {
      return `${xtream_url}/${xtream_username}/${xtream_password}/${stream.metadata.stream_id}`;
    } else if (stream.contentType === 'vod') {
      const ext = stream.metadata.container_extension || 'mp4';
      return `${xtream_url}/movie/${xtream_username}/${xtream_password}/${stream.metadata.stream_id}.${ext}`;
    } else if (stream.type === 'episode') {
      const ext = stream.metadata.container_extension || 'mkv';
      return `${xtream_url}/series/${xtream_username}/${xtream_password}/${stream.metadata.id}.${ext}`;
    }
    
    return '';
  };

  const filterTree = (nodes, query) => {
    if (!query) return nodes;
    
    const lowerQuery = query.toLowerCase();
    
    const filter = (node) => {
      const nameMatch = (node.name || '').toLowerCase().includes(lowerQuery);
      
      if (node.children && node.children.length > 0) {
        const filteredChildren = node.children.map(filter).filter(Boolean);
        
        if (filteredChildren.length > 0) {
          // Expandir automaticamente se tem filhos correspondentes
          expandedNodes.add(node.id);
          return { ...node, children: filteredChildren };
        }
      }
      
      return nameMatch ? node : null;
    };
    
    return nodes.map(filter).filter(Boolean);
  };

  const getIcon = (node) => {
    if (node.type === 'category') return <span className="text-blue-500 text-base">📁</span>;
    if (node.contentType === 'live') return <Tv className="w-4 h-4 text-green-600" />;
    if (node.contentType === 'vod') return <Film className="w-4 h-4 text-purple-600" />;
    if (node.contentType === 'series') return <Clapperboard className="w-4 h-4 text-orange-600" />;
    return <Tv className="w-4 h-4" />;
  };

  const TreeNode = ({ node, level }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const canExpand = node.type === 'category' || (node.type === 'stream' && node.contentType === 'series') || node.type === 'season';
    const displayName = node.name || node.metadata?.category_name || node.metadata?.name || '(sem nome)';
    
    return (
      <div>
        <div
          className={'flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 cursor-pointer ' + (selectedStream?.id === node.id ? 'bg-blue-50' : '')}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          data-node-id={node.id}
          onClick={() => {
            if (canExpand) {
              handleToggle(node);
            } else if (node.type === 'stream' || node.type === 'episode') {
              setSelectedStream(node);
            }
          }}
        >
          <span className="flex-shrink-0 w-4">
            {canExpand ? (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : null}
          </span>
          
          <span className="flex-shrink-0">
            {getIcon(node)}
          </span>
          
          <span className="flex-1 text-sm text-gray-800 truncate">
            {searchQuery && displayName.toLowerCase().includes(searchQuery.toLowerCase()) ? (
              <span dangerouslySetInnerHTML={{
                __html: displayName.replace(
                  new RegExp('(' + searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'),
                  '<mark class="bg-yellow-200">$1</mark>'
                )
              }} />
            ) : (
              displayName
            )}
          </span>
          
          {node.type === 'category' && hasChildren && (
            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full flex-shrink-0">
              {node.children.length}
            </span>
          )}
          
          {node.type === 'stream' && node.metadata?.num && (
            <span className="text-xs text-gray-500 flex-shrink-0">#{node.metadata.num}</span>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
        
        {isExpanded && !hasChildren && node.loaded && (
          <div className="text-gray-500 italic text-sm py-1" style={{ paddingLeft: `${(level + 1) * 20 + 12}px` }}>
            Nenhum conteúdo disponível
          </div>
        )}
      </div>
    );
  };

  const filteredTree = filterTree(treeData, searchQuery);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Visualizar Árvore IPTV</h1>
        <p className="text-gray-600">Explore a estrutura de categorias e conteúdo do servidor Xtream Codes</p>
      </div>

      {/* Adicionar Lista Manualmente */}
      <div className="mb-4 bg-white rounded-lg shadow p-4 border-2 border-blue-500">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Adicionar Lista IPTV</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="URL do servidor (ex: http://exemplo.com:8080)"
            value={manualConfig.url}
            onChange={(e) => setManualConfig({ ...manualConfig, url: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Usuário"
            value={manualConfig.username}
            onChange={(e) => setManualConfig({ ...manualConfig, username: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Senha"
            value={manualConfig.password}
            onChange={(e) => setManualConfig({ ...manualConfig, password: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={handleLoadManualList}
            disabled={loadingManual || !manualConfig.url || !manualConfig.username || !manualConfig.password}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loadingManual ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Carregar
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Digite as credenciais da sua lista IPTV e clique em "Carregar" para visualizar a árvore automaticamente
        </p>
      </div>

      {/* Controles */}
      <div className="mb-4 flex gap-4 items-center">
        {/* Config Selector */}
        <select
          value={configSource}
          onChange={(e) => handleConfigChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
        >
          <option value="global">Configuração Global</option>
          {Array.isArray(devices) && devices.map(device => (
            <option key={device.id} value={device.id}>
              {device.modelo || device.mac_address}
            </option>
          ))}
        </select>

        {/* Botão Listas de Teste */}
        <button
          onClick={() => setShowTestLists(!showTestLists)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          Listas de Teste
        </button>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>

        {/* Expandir Tudo */}
        <button
          onClick={handleExpandAll}
          disabled={expandingAll}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Expande todas as pastas"
        >
          {expandingAll ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Expandindo...
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Expandir Tudo
            </>
          )}
        </button>

        {/* Recolher Tudo */}
        <button
          onClick={handleCollapseAll}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
          title="Recolhe todas as pastas"
        >
          <ChevronRight className="w-4 h-4" />
          Recolher
        </button>

        {/* Copiar Tudo */}
        <button
          onClick={handleCopyAll}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
          title="Copia todos os nomes visíveis na árvore"
        >
          <ClipboardList className="w-4 h-4" />
          Copiar Tudo
        </button>
      </div>

      {/* Modal Listas de Teste */}
      {showTestLists && (
        <div className="mb-4 bg-white rounded-lg shadow-lg p-4 border-2 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Listas IPTV de Teste Públicas</h3>
            <button onClick={() => setShowTestLists(false)}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            ⚠️ Estas são listas públicas de teste. Podem estar offline ou lentas.
          </p>
          
          <div className="space-y-3">
            {testLists.map(list => (
              <div key={list.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{list.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <div><span className="font-semibold">URL:</span> {list.url}</div>
                      <div><span className="font-semibold">Usuário:</span> {list.username}</div>
                      <div><span className="font-semibold">Senha:</span> {list.password}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTestList(list)}
                    disabled={testingList === list.id}
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {testingList === list.id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Usar Esta Lista
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Clique em "Usar Esta Lista" para testar e configurar automaticamente. 
              A lista será salva como configuração global.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-4 py-2 ${activeTab === 'live' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          <Tv className="w-4 h-4 inline mr-2" />
          TV ao Vivo
        </button>
        <button
          onClick={() => setActiveTab('vod')}
          className={`px-4 py-2 ${activeTab === 'vod' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          <Film className="w-4 h-4 inline mr-2" />
          Filmes
        </button>
        <button
          onClick={() => setActiveTab('series')}
          className={`px-4 py-2 ${activeTab === 'series' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          <Clapperboard className="w-4 h-4 inline mr-2" />
          Séries
        </button>
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {/* Tree View */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-auto" style={{ maxHeight: '600px' }}>
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">Carregando...</span>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded m-4">
              <p>{error}</p>
              <button
                onClick={() => loadCategories(activeTab)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                Tentar Novamente
              </button>
            </div>
          )}
          
          {!loading && !error && filteredTree.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhuma categoria disponível'}
            </div>
          )}
          
          {!loading && !error && filteredTree.map(node => (
            <TreeNode key={node.id} node={node} level={0} />
          ))}
        </div>

        {/* Detail Panel */}
        {selectedStream && (
          <div className="w-96 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">Detalhes</h3>
              <button onClick={() => setSelectedStream(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-600">Nome:</label>
                <p className="text-sm">{selectedStream.name}</p>
              </div>
              
              {selectedStream.metadata.stream_id && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Stream ID:</label>
                  <p className="text-sm">{selectedStream.metadata.stream_id}</p>
                </div>
              )}
              
              {selectedStream.metadata.num && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Número do Canal:</label>
                  <p className="text-sm">{selectedStream.metadata.num}</p>
                </div>
              )}
              
              {selectedStream.metadata.epg_channel_id && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">EPG Channel ID:</label>
                  <p className="text-sm">{selectedStream.metadata.epg_channel_id}</p>
                </div>
              )}
              
              {selectedStream.metadata.container_extension && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Formato:</label>
                  <p className="text-sm">{selectedStream.metadata.container_extension}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-semibold text-gray-600">URL do Stream:</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={formatStreamUrl(selectedStream, credentials)}
                    readOnly
                    className="flex-1 px-2 py-1 border rounded text-xs bg-gray-50 text-gray-900"
                  />
                  <button
                    onClick={() => handleCopyUrl(formatStreamUrl(selectedStream, credentials))}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IptvTreeViewer;
