import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

const SportsManager = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sports/config');
      const data = await res.json();
      if (data.success) {
        setCards(data.data);
      }
    } catch (err) {
      console.error('Erro ao buscar configs:', err);
      showToast('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/sports/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Configurações salvas com sucesso!', 'success');
      } else {
        showToast(data.error || 'Erro ao salvar', 'error');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      showToast('Erro ao salvar configurações', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  // Upload de Imagem (usando a rota de branding)
  const handleImageClick = (index) => {
    setUploadingFor(index);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || uploadingFor === null) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Enviando imagem...', 'info');
      const res = await fetch('/api/branding/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.url) {
        handleChange(uploadingFor, 'bgUrl', data.url);
        showToast('Imagem carregada com sucesso!', 'success');
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      showToast('Erro ao enviar imagem', 'error');
    } finally {
      setUploadingFor(null);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg font-bold text-white z-50 animate-fade-in-down ${
          toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-brand-500'
        }`}>
          {toast.message}
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Cards de Esportes (6 Posições)</h2>
          <p className="text-sm text-zinc-400">Personalize os cards que aparecem na tela de esportes do App e Web Player.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-all disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div key={card.id || index} className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden shadow-lg flex flex-col">
            
            {/* Preview da Imagem */}
            <div 
              className="relative h-40 w-full bg-dark-900 group cursor-pointer border-b border-dark-600"
              onClick={() => handleImageClick(index)}
            >
              <img 
                src={card.bgUrl || 'https://via.placeholder.com/400x200?text=Sem+Imagem'} 
                alt={card.name} 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Trocar Imagem
                </span>
              </div>
            </div>

            {/* Controles */}
            <div className="p-4 flex flex-col gap-4">
              {/* Botão de Ativar/Desativar */}
              <div className="flex items-center justify-between bg-dark-900 border border-dark-600 rounded-lg p-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Status do Card</span>
                <button
                  onClick={() => handleChange(index, 'active', card.active !== false ? false : true)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    card.active !== false ? 'bg-brand-500' : 'bg-dark-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      card.active !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={card.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  placeholder="Ex: FUTEBOL"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Categoria da API (Query)
                </label>
                <input
                  type="text"
                  value={card.type}
                  onChange={(e) => handleChange(index, 'type', e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  placeholder="Ex: soccer, basketball..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={card.bgUrl}
                  onChange={(e) => handleChange(index, 'bgUrl', e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white text-xs focus:border-brand-500 focus:outline-none font-mono"
                  placeholder="/assets/sports/..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SportsManager;
