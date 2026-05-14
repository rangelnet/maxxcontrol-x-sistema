import { useState, useEffect, useCallback, useRef } from 'react'
import { Tv, ListPlus, FolderPlus, Download, Trash2, Edit3, GripVertical, Folders, Check, Search, ArrowRightLeft, Move, RefreshCw, Wand2, Trash, X, CheckCircle2, AlertCircle, Brain } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

const EMOJI_LIST = ['📺','⚽','🎬','🌍','🎵','🏈','📰','🧒','🍿','🥊','🏍️','🎭','🔞','✝️','🎮','🥘']

const TvManager = () => {
  const [categories, setCategories] = useState([])
  const [stagingChannels, setStagingChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  
  const [importData, setImportData] = useState({ url: '', username: '', password: '' })
  
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [catForm, setCatForm] = useState({ name: '', icon: '📺', icon_type: 'emoji' })
  const [catImageFile, setCatImageFile] = useState(null)
  
  const [activeCategory, setActiveCategory] = useState(null)
  const [categoryChannels, setCategoryChannels] = useState([])
  
  // Auditoria Inteligente
  const [auditSuggestions, setAuditSuggestions] = useState([])
  const [isAuditing, setIsAuditing] = useState(false)

  // Toast Notification
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  // Confirm Modal (substitui o confirm() feio do navegador)
  const [confirmModal, setConfirmModal] = useState(null)
  const confirmResolveRef = useRef(null)
  const showConfirm = (message) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve
      setConfirmModal(message)
    })
  }
  const handleConfirmYes = () => { confirmResolveRef.current?.(true); setConfirmModal(null) }
  const handleConfirmNo = () => { confirmResolveRef.current?.(false); setConfirmModal(null) }

  const token = localStorage.getItem('token')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [catRes, stagRes] = await Promise.all([
        fetch(`${API}/api/tv-manager/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/tv-manager/staging`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      
      const cats = await catRes.json()
      const stags = await stagRes.json()
      
      setCategories(cats)
      setStagingChannels(stags)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  const loadCategoryChannels = async (catId) => {
    setActiveCategory(catId)
    try {
      const res = await fetch(`${API}/api/tv-manager/categories/${catId}/channels`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setCategoryChannels(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao carregar canais:', err)
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!importData.url || !importData.username || !importData.password) return alert('Preencha URL, Usuário e Senha')
    
    setImporting(true)
    try {
      const res = await fetch(`${API}/api/tv-manager/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(importData)
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Sucesso! ${data.importedCount} canais importados para a área de Staging.`)
        fetchData()
        setImportData({ url: '', username: '', password: '' })
      } else {
        alert(data.error || 'Erro na importação')
      }
    } catch (err) {
      alert('Falha ao conectar com o servidor para importação.')
    } finally {
      setImporting(false)
    }
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!catForm.name) return
    
    try {
      const method = editCategory ? 'PUT' : 'POST'
      const url = editCategory 
        ? `${API}/api/tv-manager/categories/${editCategory.id}` 
        : `${API}/api/tv-manager/categories`

      let bodyData;
      let headersConfig = { Authorization: `Bearer ${token}` };

      if (catImageFile) {
        bodyData = new FormData();
        bodyData.append('name', catForm.name);
        bodyData.append('image', catImageFile); // O Multer vai ler isto
        // O navegador define Content-Type: multipart/form-data automaticamente
      } else {
        bodyData = JSON.stringify(catForm);
        headersConfig['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        method,
        headers: headersConfig,
        body: bodyData
      })
      
      if (res.ok) {
        setShowCategoryModal(false)
        setEditCategory(null)
        setCatImageFile(null)
        setCatForm({ name: '', icon: '📺', icon_type: 'emoji' })
        fetchData()
      }
    } catch (err) {
      console.error('Erro ao salvar categoria:', err)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!(await showConfirm('Excluir esta categoria? Os canais nela ficarão temporariamente sem categoria.'))) return
    try {
      await fetch(`${API}/api/tv-manager/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (activeCategory === id) setActiveCategory(null)
      fetchData()
      showToast('Categoria excluída com sucesso!', 'success')
    } catch (err) {
      showToast('Erro ao excluir categoria.', 'error')
      console.error('Erro ao excluir:', err)
    }
  }

  const handleMoveChannels = async (channelIds, targetCategoryId) => {
    if (!targetCategoryId) return showToast('Selecione uma categoria de destino', 'info')
    if (channelIds.length === 0) return
    
    try {
      await fetch(`${API}/api/tv-manager/channels/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ channelIds, targetCategoryId })
      })
      
      // Atualizar as listas após mover
      fetchData()
      if (activeCategory) loadCategoryChannels(activeCategory)
    } catch (err) {
      console.error('Erro ao mover canais:', err)
    }
  }

  const handleAuditCategory = async () => {
    if (!activeCategory) return;
    setIsAuditing(true);
    setAuditSuggestions([]);
    try {
        const res = await fetch(`${API}/api/tv-manager/channels/audit-category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ categoryId: activeCategory })
        });
        const data = await res.json();
        if (res.ok) {
            setAuditSuggestions(data.suggestions || []);
            if (data.suggestions?.length === 0) showToast('Tudo em ordem! Nenhum canal perdido nesta categoria.', 'success');
        } else {
            showToast(data.error || 'Erro na auditoria.', 'error');
        }
    } catch (error) {
        console.error('Erro na auditoria', error);
    } finally {
        setIsAuditing(false);
    }
  };

  const handleApplyAuditCorrections = async () => {
    if (!(await showConfirm(`Aplicar ${auditSuggestions.length} correções sugeridas automaticamente?`))) return;
    try {
        const catMap = {};
        auditSuggestions.forEach(s => {
            if (!catMap[s.suggestedCategoryId]) catMap[s.suggestedCategoryId] = [];
            catMap[s.suggestedCategoryId].push(s.channelId);
        });

        for (const targetId of Object.keys(catMap)) {
            await fetch(`${API}/api/tv-manager/channels/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ channelIds: catMap[targetId], targetCategoryId: targetId })
            });
        }
        setAuditSuggestions([]);
        loadCategoryChannels(activeCategory);
        fetchData();
    } catch(err) {
        showToast('Erro ao aplicar correções.', 'error');
    }
  };

  // Auditoria Inteligente do STAGING (Canais Sem Categoria)
  const [stagingAuditSuggestions, setStagingAuditSuggestions] = useState([]);
  const [isStagingAuditing, setIsStagingAuditing] = useState(false);

  const handleAuditStaging = async () => {
    setIsStagingAuditing(true);
    setStagingAuditSuggestions([]);
    try {
        const res = await fetch(`${API}/api/tv-manager/channels/audit-staging`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            setStagingAuditSuggestions(data.suggestions || []);
            if (data.suggestions?.length === 0) showToast('O Cérebro não encontrou nenhum canal conhecido no Staging.', 'info');
        } else {
            showToast(data.error || 'Erro na auditoria.', 'error');
        }
    } catch (error) {
        console.error('Erro na auditoria staging', error);
    } finally {
        setIsStagingAuditing(false);
    }
  };

  const handleApplyStagingCorrections = async () => {
    if (!(await showConfirm(`Mover ${stagingAuditSuggestions.length} canais automaticamente para suas categorias?`))) return;
    try {
        const catMap = {};
        stagingAuditSuggestions.forEach(s => {
            if (!catMap[s.suggestedCategoryId]) catMap[s.suggestedCategoryId] = [];
            catMap[s.suggestedCategoryId].push(s.channelId);
        });

        for (const targetId of Object.keys(catMap)) {
            await fetch(`${API}/api/tv-manager/channels/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ channelIds: catMap[targetId], targetCategoryId: targetId })
            });
        }
        setStagingAuditSuggestions([]);
        fetchData();
    } catch(err) {
        showToast('Erro ao aplicar correções do staging.', 'error');
    }
  };

  const handleDeleteChannel = async (id, isStaging = false) => {
    if (!(await showConfirm('Excluir este canal definitivamente?'))) return
    try {
      await fetch(`${API}/api/tv-manager/channels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (isStaging) {
        setStagingChannels(prev => prev.filter(c => c.id !== id))
      } else {
        setCategoryChannels(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('Erro ao excluir canal:', err)
    }
  }

  // Drag and Drop (Reordenação de Categorias simplificada)
  const moveCategory = async (idx, direction) => {
    const newCats = [...categories]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= newCats.length) return

    const tempOrdem = newCats[idx].ordem || idx
    newCats[idx].ordem = newCats[swapIdx].ordem || swapIdx
    newCats[swapIdx].ordem = tempOrdem;
    
    [newCats[idx], newCats[swapIdx]] = [newCats[swapIdx], newCats[idx]]
    setCategories(newCats)
    
    try {
      await fetch(`${API}/api/tv-manager/categories/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: newCats.map((c, i) => ({ id: c.id, ordem: i })) })
      })
    } catch (err) {
      console.error('Erro ao reordenar:', err)
    }
  }

  const handleSync = async () => {
    if (!(await showConfirm('Forçar todas as TVs conectadas a atualizarem a lista de canais agora?'))) return;
    try {
      const res = await fetch(`${API}/api/tv-manager/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        showToast('Comando enviado! As TVs serão atualizadas.', 'success');
      } else {
        showToast('Erro ao sincronizar.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    }
  }

  const handleCleanNames = async () => {
    if (!(await showConfirm('Deseja varrer todos os canais e remover sufixos como [FHD], (HD) e 4K dos nomes?'))) return;
    try {
      const res = await fetch(`${API}/api/tv-manager/channels/clean-names`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${data.updatedCount} canais foram renomeados!`, 'success');
        fetchData();
        if (activeCategory) loadCategoryChannels(activeCategory);
      } else {
        showToast('Erro ao limpar nomes.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    }
  }

  const handleBulkDelete = async (quality) => {
    if (!(await showConfirm(`TEM CERTEZA? Isso vai apagar TODOS os canais que contenham "${quality}" no nome. Essa ação não tem volta!`))) return;
    try {
      const res = await fetch(`${API}/api/tv-manager/channels/bulk-delete`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quality })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${data.deletedCount} canais ${quality} foram deletados!`, 'success');
        fetchData();
        if (activeCategory) loadCategoryChannels(activeCategory);
      } else {
        showToast('Erro ao excluir canais em lote.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    }
  }
  // Edição de Nome do Canal
  const [editingChannel, setEditingChannel] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleUpdateChannelName = async (id, newName) => {
    if(!newName.trim()) return;
    try {
      const res = await fetch(`${API}/api/tv-manager/channels/${id}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName })
      });
      if(res.ok) {
        setEditingChannel(null);
        fetchData(); // Recarrega staging
        if(activeCategory) loadCategoryChannels(activeCategory);
      } else {
        alert('Erro ao renomear canal');
      }
    } catch(e) {
      alert('Erro de conexão');
    }
  };

  // Detecção de Duplicados (MAX 01, MAX 02, MAX 03...)
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [isDetectingDupes, setIsDetectingDupes] = useState(false);

  const handleDetectDuplicates = async () => {
    setIsDetectingDupes(true);
    setDuplicateGroups([]);
    try {
      const res = await fetch(`${API}/api/tv-manager/channels/detect-duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDuplicateGroups(data.duplicates || []);
        if (data.duplicates?.length === 0) showToast('Nenhum canal duplicado encontrado!', 'success');
        else showToast(`${data.duplicates.length} grupos de duplicados encontrados`, 'info');
      }
    } catch (err) {
      showToast('Erro ao detectar duplicados', 'error');
    } finally {
      setIsDetectingDupes(false);
    }
  };

  const handleCleanAllDuplicates = async () => {
    if (!(await showConfirm(`Manter apenas 1 canal de cada grupo e excluir ${duplicateGroups.reduce((acc, g) => acc + g.count - 1, 0)} duplicados?`))) return;
    try {
      // Para cada grupo, manter o primeiro e excluir os demais
      const idsToDelete = [];
      duplicateGroups.forEach(group => {
        group.channels.slice(1).forEach(ch => idsToDelete.push(ch.id));
      });

      if (idsToDelete.length > 0) {
        await fetch(`${API}/api/tv-manager/channels/delete-multiple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ channelIds: idsToDelete })
        });
      }
      showToast(`${idsToDelete.length} canais duplicados removidos!`, 'success');
      setDuplicateGroups([]);
      fetchData();
      if (activeCategory) loadCategoryChannels(activeCategory);
    } catch (err) {
      showToast('Erro ao limpar duplicados', 'error');
    }
  };

  // Seleção Múltipla de Canais
  const [selectedChannels, setSelectedChannels] = useState([]);

  const toggleChannelSelection = (id) => {
    setSelectedChannels(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAllStaging = () => {
    if (selectedChannels.length === stagingChannels.length) {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(stagingChannels.map(c => c.id));
    }
  };

  const handleSelectAllCategory = () => {
    if (selectedChannels.length === categoryChannels.length) {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(categoryChannels.map(c => c.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedChannels.length === 0) return;
    if (!confirm(`Tem certeza que deseja apagar ${selectedChannels.length} canais selecionados?`)) return;

    try {
      const res = await fetch(`${API}/api/tv-manager/channels/delete-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ channelIds: selectedChannels })
      });
      if (res.ok) {
        setSelectedChannels([]);
        fetchData();
        if (activeCategory) loadCategoryChannels(activeCategory);
      } else {
        alert('Erro ao excluir canais.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    }
  };

  const getQualityBadge = (name) => {
    if (!name) return null;
    const n = String(name).toUpperCase();
    if (n.includes('4K') || n.includes('UHD')) return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">4K</span>;
    if (n.includes('FHD')) return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">FHD</span>;
    if (n.includes('HD') && !n.includes('FHD')) return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">HD</span>;
    if (n.includes('SD')) return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">SD</span>;
    return null;
  };


  // Staging Channel Item com Select de Destino
  const StagingChannelItem = ({ channel }) => {
    const [selectedCat, setSelectedCat] = useState('');
    const isEditing = editingChannel === channel.id;
    
    return (
      <div className={`flex items-center gap-3 p-3 border rounded-xl transition-colors group ${selectedChannels.includes(channel.id) ? 'bg-brand-500/10 border-brand-500/50' : 'bg-dark-900 border-dark-600 hover:border-brand-500/30'}`}>
        <input 
          type="checkbox" 
          checked={selectedChannels.includes(channel.id)} 
          onChange={() => toggleChannelSelection(channel.id)} 
          className="w-4 h-4 rounded border-dark-600 text-brand-500 focus:ring-brand-500/50 cursor-pointer"
        />
        <div className="w-10 h-10 bg-dark-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
          {channel.logo_url ? <img src={channel.logo_url} alt="" className="w-full h-full object-contain" /> : <Tv className="w-5 h-5 text-zinc-600" />}
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} autoFocus onKeyDown={(e) => { if(e.key==='Enter') handleUpdateChannelName(channel.id, editingName) }} className="flex-1 bg-dark-800 border border-brand-500 rounded text-xs px-2 py-1 text-white outline-none" />
              <button onClick={() => handleUpdateChannelName(channel.id, editingName)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Check className="w-4 h-4"/></button>
              <button onClick={() => setEditingChannel(null)} className="p-1 text-zinc-500 hover:text-white rounded"><X className="w-4 h-4"/></button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white truncate">{channel.name}</p>
                {getQualityBadge(channel.name)}
              </div>
              <p className="text-[10px] text-zinc-500 truncate">Origem: {channel.source_category_name}</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button onClick={() => { setEditingChannel(channel.id); setEditingName(channel.name); }} className="p-1.5 text-zinc-500 hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <select 
            value={selectedCat} 
            onChange={(e) => {
              setSelectedCat(e.target.value)
              if (e.target.value) handleMoveChannels([channel.id], e.target.value)
            }}
            className="bg-dark-800 border border-dark-600 rounded-lg text-xs text-white px-2 py-1.5 w-32 focus:border-brand-500 outline-none"
          >
            <option value="">Mover para...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon_type === 'image' ? c.name : `${c.icon} ${c.name}`}</option>)}
          </select>
          <button onClick={() => handleDeleteChannel(channel.id, true)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification Premium */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md animate-[slideIn_0.3s_ease-out] ${
          toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' :
          toast.type === 'error' ? 'bg-red-500/15 border-red-500/40 text-red-400' :
          'bg-brand-500/15 border-brand-500/40 text-brand-400'
        }`} style={{animation: 'slideIn 0.3s ease-out'}}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> :
           toast.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> :
           <Brain className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-bold max-w-xs">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>

      {/* Confirm Modal Premium */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleConfirmNo}>
          <div className="bg-[#1a1a1a] border border-dark-600 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()} style={{animation: 'fadeIn 0.2s ease-out'}}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-brand-500" />
              </div>
              <h3 className="text-white font-bold text-sm">Confirmação</h3>
            </div>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">{confirmModal}</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={handleConfirmNo} className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-400 bg-dark-800 border border-dark-600 hover:border-zinc-500 hover:text-white transition-all">
                Cancelar
              </button>
              <button onClick={handleConfirmYes} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <Tv className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Gerenciar TV</h2>
            <p className="text-zinc-500 text-xs">Organize as categorias e canais do Web Player e App</p>
          </div>
        </div>
        <button 
          onClick={handleSync}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-brand-500/20"
        >
          <RefreshCw className="w-4 h-4" /> Sincronizar TVs (Push)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Importação e Staging */}
        <div className="space-y-6 lg:col-span-1">
          {/* Box Importação */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Importar Lista Xtream</h3>
            </div>
            
            <form onSubmit={handleImport} className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">URL (Painel)</label>
                <input type="text" value={importData.url} onChange={e => setImportData({...importData, url: e.target.value})} placeholder="http://dominio:porta" className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-500 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Usuário</label>
                  <input type="text" value={importData.username} onChange={e => setImportData({...importData, username: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-500 outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Senha</label>
                  <input type="text" value={importData.password} onChange={e => setImportData({...importData, password: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-500 outline-none" required />
                </div>
              </div>
              <button type="submit" disabled={importing} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 mt-2">
                {importing ? 'Importando Canais...' : 'Iniciar Importação'}
              </button>
            </form>
          </div>

          {/* Box Agrupamento de Qualidades */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Folders className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Qualidades & Servidores</h3>
            </div>
            <p className="text-[10px] text-zinc-500 mb-4">Detecta canais com múltiplas qualidades (SD/HD/FHD) ou servidores (01/02/03) e agrupa para troca no Player.</p>
            
            <div className="space-y-3">
              {/* Botão Escanear Qualidades */}
              <button 
                onClick={handleDetectDuplicates}
                disabled={isDetectingDupes}
                className="w-full flex items-center justify-center gap-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all border border-purple-500/20 hover:border-purple-500"
              >
                <Folders className={`w-3.5 h-3.5 ${isDetectingDupes ? 'animate-spin' : ''}`} />
                {isDetectingDupes ? 'Escaneando...' : 'Escanear Qualidades'}
              </button>

              {/* Resultados do Scan */}
              {duplicateGroups.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-bold text-[11px]">{duplicateGroups.length} grupos detectados</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 bg-dark-900 px-2 py-0.5 rounded">Auto-agrupados no Player</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                    {duplicateGroups.slice(0, 50).map((group, i) => (
                      <div key={i} className="flex items-center justify-between bg-dark-900/50 p-2 rounded-lg border border-dark-600">
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-zinc-200 font-bold block truncate">{group.baseName.toUpperCase()}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {group.channels.map((ch, j) => {
                              const label = /fhd|full.hd/i.test(ch.name) ? 'FHD' : /4k|uhd/i.test(ch.name) ? '4K' : /\bhd\b/i.test(ch.name) ? 'HD' : /\bsd\b/i.test(ch.name) ? 'SD' : ch.name.match(/\d{1,3}\s*$/)?.[0] ? `#${ch.name.match(/(\d{1,3})\s*$/)[1]}` : 'Principal';
                              return <span key={j} className="text-[8px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">{label}</span>
                            })}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded ml-2 whitespace-nowrap">{group.count} opções</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Zona de Perigo - Excluir qualidades (colapsável) */}
              <details className="group">
                <summary className="flex items-center gap-2 text-[10px] text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors py-1">
                  <Trash className="w-3 h-3" />
                  <span>Zona de Perigo (excluir canais por qualidade)</span>
                </summary>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => handleBulkDelete('SD')} className="flex items-center justify-center gap-1.5 bg-dark-900 border border-dark-600 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[10px] font-bold px-2 py-2 rounded-xl transition-all">
                    <Trash className="w-3 h-3"/> Excluir SD
                  </button>
                  <button onClick={() => handleBulkDelete('HD')} className="flex items-center justify-center gap-1.5 bg-dark-900 border border-dark-600 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[10px] font-bold px-2 py-2 rounded-xl transition-all">
                    <Trash className="w-3 h-3"/> Excluir HD
                  </button>
                </div>
              </details>
            </div>
          </div>

          {/* Box Staging (Canais não categorizados) */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 flex flex-col max-h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={stagingChannels.length > 0 && stagingChannels.every(c => selectedChannels.includes(c.id))}
                  onChange={handleSelectAllStaging}
                  className="w-4 h-4 rounded border-dark-600 text-brand-500 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-bold text-white">Canais (Sem Categoria)</h3>
                </div>
              </div>
              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-md font-bold">{stagingChannels.length}</span>
            </div>

            {/* Botão Auditoria Inteligente do Staging */}
            {stagingChannels.length > 0 && (
              <div className="mb-3">
                <button 
                  onClick={handleAuditStaging}
                  disabled={isStagingAuditing}
                  className="w-full flex items-center justify-center gap-2 bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isStagingAuditing ? 'animate-spin' : ''}`} />
                  {isStagingAuditing ? 'Analisando...' : 'Auditoria Inteligente'}
                </button>
              </div>
            )}

            {/* Painel de Sugestões da Auditoria do Staging */}
            {(stagingAuditSuggestions && stagingAuditSuggestions.length > 0) ? (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <Wand2 className="w-4 h-4" />
                    <span className="font-bold text-[11px]">{stagingAuditSuggestions.length} canais identificados!</span>
                  </div>
                  <button onClick={handleApplyStagingCorrections} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-orange-500/20">
                    Organizar Todos
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                  {stagingAuditSuggestions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-900/50 p-1.5 rounded-lg border border-dark-600">
                      <span className="text-[10px] text-zinc-300 font-bold truncate flex-1">{s.channelName}</span>
                      <span className="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap">{s.suggestedCategoryName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {stagingChannels.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">
                  <Check className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum canal pendente</p>
                </div>
              ) : (
                stagingChannels.map(channel => <StagingChannelItem key={channel.id} channel={channel} />)
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Categorias e Canais da Categoria */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bulk Actions Bar */}
          {selectedChannels.length > 0 && (
            <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-4 flex items-center justify-between sticky top-4 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3 text-brand-400 font-bold text-sm">
                <Check className="w-5 h-5"/>
                <span>{selectedChannels.length} canais selecionados</span>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleMoveChannels(selectedChannels, e.target.value);
                      setSelectedChannels([]);
                      e.target.value = '';
                    }
                  }}
                  className="bg-dark-800 border border-dark-600 rounded-xl text-xs text-white px-3 py-2.5 focus:border-brand-500 outline-none"
                >
                  <option value="">Mover selecionados para...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon_type === 'image' ? c.name : `${c.icon} ${c.name}`}</option>)}
                </select>
                <button onClick={handleDeleteSelected} className="flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                  <Trash2 className="w-4 h-4"/> Apagar
                </button>
              </div>
            </div>
          )}
          
          {/* Topo: Categorias */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Folders className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Minhas Categorias TV</h3>
              </div>
              <button 
                onClick={() => { setEditCategory(null); setCatForm({ name: '', icon: '📺', icon_type: 'emoji' }); setShowCategoryModal(true); }}
                className="text-xs bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5" /> Nova Categoria
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {categories.map((cat, idx) => (
                <div 
                  key={cat.id} 
                  onClick={() => loadCategoryChannels(cat.id)}
                  className={`group relative p-3 rounded-xl border-2 cursor-pointer transition-all ${activeCategory === cat.id ? 'border-brand-500 bg-brand-500/5' : 'border-dark-600 bg-dark-900 hover:border-dark-500'}`}
                >
                  <div className="text-2xl mb-2 flex items-center justify-start h-10 w-10">
                    {cat.icon_type === 'image' ? (
                      <img src={`${API}/uploads/tv-categories/${cat.icon}`} alt={cat.name} className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                    ) : (
                      cat.icon
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white truncate pr-6">{cat.name}</h4>
                  
                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setEditCategory(cat); setCatForm({ name: cat.name, icon: cat.icon, icon_type: cat.icon_type }); setShowCategoryModal(true); }} className="p-1 bg-dark-700 hover:bg-brand-500 text-zinc-300 hover:text-white rounded text-xs"><Edit3 className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveCategory(idx, 'up') }} disabled={idx === 0} className="p-1 bg-dark-700 hover:bg-zinc-600 text-zinc-300 rounded text-xs disabled:opacity-30">↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveCategory(idx, 'down') }} disabled={idx === categories.length-1} className="p-1 bg-dark-700 hover:bg-zinc-600 text-zinc-300 rounded text-xs disabled:opacity-30">↓</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id) }} className="p-1 bg-dark-700 hover:bg-red-500 text-zinc-300 hover:text-white rounded text-xs"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Canais da Categoria Selecionada */}
          {activeCategory && (
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 min-h-[400px]">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-700">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={categoryChannels.length > 0 && selectedChannels.length === categoryChannels.length}
                    onChange={handleSelectAllCategory}
                    className="w-4 h-4 rounded border-dark-600 text-brand-500 cursor-pointer"
                  />
                  <div className="text-2xl h-8 w-8 flex items-center justify-center">
                    {categories.find(c => c.id === activeCategory)?.icon_type === 'image' ? (
                        <img src={`${API}/uploads/tv-categories/${categories.find(c => c.id === activeCategory)?.icon}`} alt="" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        categories.find(c => c.id === activeCategory)?.icon
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{categories.find(c => c.id === activeCategory)?.name}</h3>
                    <p className="text-xs text-zinc-500">{categoryChannels.length} canais</p>
                  </div>
                </div>
                <button 
                  onClick={handleAuditCategory}
                  disabled={isAuditing}
                  className="flex items-center gap-2 bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  {isAuditing ? 'Auditando...' : 'Auditoria Inteligente'}
                </button>
              </div>

              {(auditSuggestions && auditSuggestions.length > 0) ? (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Wand2 className="w-5 h-5" />
                      <span className="font-bold text-sm">Auditoria: Encontramos {auditSuggestions.length} canais fora do lugar!</span>
                    </div>
                    <button onClick={handleApplyAuditCorrections} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-orange-500/20">
                      ✨ Corrigir Todos Automaticamente
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {auditSuggestions.map((s, i) => (
                      <div key={i} className="flex items-center justify-between bg-dark-900/50 p-2 rounded-lg border border-dark-600">
                        <span className="text-xs text-zinc-300 font-bold">{s.channelName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500">Sugerido:</span>
                          <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">{s.suggestedCategoryName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {categoryChannels.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-zinc-500">
                    <p className="text-sm">Nenhum canal nesta categoria.</p>
                    <p className="text-xs mt-1">Mova canais da lista ao lado para cá.</p>
                  </div>
                ) : (
                  categoryChannels.map(channel => {
                    const isEditing = editingChannel === channel.id;
                    return (
                      <div key={channel.id} className={`flex items-center gap-3 p-2 border rounded-lg group transition-colors ${selectedChannels.includes(channel.id) ? 'bg-brand-500/10 border-brand-500/50' : 'bg-dark-900 border-dark-600 hover:border-brand-500/30'}`}>
                        <input 
                          type="checkbox" 
                          checked={selectedChannels.includes(channel.id)} 
                          onChange={() => toggleChannelSelection(channel.id)} 
                          className="w-3.5 h-3.5 rounded border-dark-600 text-brand-500 focus:ring-brand-500/50 cursor-pointer shrink-0"
                        />
                        <div className="w-8 h-8 bg-dark-800 rounded flex items-center justify-center shrink-0">
                          {channel.logo_url ? <img src={channel.logo_url} className="w-full h-full object-contain" /> : <Tv className="w-4 h-4 text-zinc-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} autoFocus onKeyDown={(e) => { if(e.key==='Enter') handleUpdateChannelName(channel.id, editingName) }} className="flex-1 bg-dark-800 border border-brand-500 rounded text-xs px-2 py-1 text-white outline-none" />
                              <button onClick={() => handleUpdateChannelName(channel.id, editingName)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Check className="w-3 h-3"/></button>
                              <button onClick={() => setEditingChannel(null)} className="p-1 text-zinc-500 hover:text-white rounded"><X className="w-3 h-3"/></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white truncate">{channel.name}</p>
                              {getQualityBadge(channel.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          {!isEditing && (
                            <button onClick={() => { setEditingChannel(channel.id); setEditingName(channel.name); }} className="p-1.5 text-zinc-500 hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteChannel(channel.id, false)} className="p-1.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal Nova/Editar Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-black text-white mb-4">{editCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 ml-1">Nome da Categoria</label>
                <input type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none" required />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 ml-1">Ícone</label>
                <div className="grid grid-cols-8 gap-2 mb-3">
                  {EMOJI_LIST.map(emoji => (
                    <button type="button" key={emoji} onClick={() => { setCatForm({...catForm, icon: emoji, icon_type: 'emoji'}); setCatImageFile(null); }} className={`text-xl p-1.5 rounded-lg border-2 ${catForm.icon === emoji && !catImageFile ? 'border-brand-500 bg-brand-500/10' : 'border-transparent hover:bg-dark-700'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
                <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1 ml-1">Ou Upload de Imagem (PNG/JPG)</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setCatImageFile(e.target.files[0]);
                      setCatForm({...catForm, icon_type: 'image'});
                    }
                  }}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 text-sm text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-500 file:text-white hover:file:bg-brand-600 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button type="button" onClick={() => { setShowCategoryModal(false); setCatImageFile(null); }} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-dark-600 text-white font-bold text-sm hover:bg-dark-700">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default TvManager
