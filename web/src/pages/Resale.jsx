import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, Edit2, Trash2, Key, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';

const Resale = () => {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    limite_dispositivos: 10,
    comissao_percentual: 10,
    status: 'ativo'
  });

  useEffect(() => {
    loadResellers();
  }, []);

  const loadResellers = async () => {
    try {
      const response = await api.get('/api/resale/resellers');
      setResellers(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar revendedores:', error);
      alert('Erro ao carregar revendedores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingReseller) {
        await api.put(/api/resale/resellers/, formData);
        alert('Revendedor atualizado com sucesso!');
      } else {
        await api.post('/api/resale/resellers', formData);
        alert('Revendedor criado com sucesso!');
      }
      
      setShowModal(false);
      setEditingReseller(null);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        limite_dispositivos: 10,
        comissao_percentual: 10,
        status: 'ativo'
      });
      loadResellers();
    } catch (error) {
      console.error('Erro ao salvar revendedor:', error);
      alert(error.response?.data?.error || 'Erro ao salvar revendedor');
    }
  };

  const handleEdit = (reseller) => {
    setEditingReseller(reseller);
    setFormData({
      nome: reseller.nome,
      email: reseller.email,
      senha: '',
      limite_dispositivos: reseller.limite_dispositivos,
      comissao_percentual: reseller.comissao_percentual,
      status: reseller.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este revendedor?')) return;
    
    try {
      await api.delete(/api/resale/resellers/);
      alert('Revendedor excluído com sucesso!');
      loadResellers();
    } catch (error) {
      console.error('Erro ao excluir revendedor:', error);
      alert('Erro ao excluir revendedor');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    
    try {
      await api.put(/api/resale/resellers/, { status: newStatus });
      loadResellers();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status');
    }
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center h-screen\">
        <div className=\"text-xl\">Carregando...</div>
      </div>
    );
  }

  return (
    <div className=\"p-6\">
      <div className=\"flex justify-between items-center mb-6\">
        <div>
          <h1 className=\"text-3xl font-bold flex items-center gap-2\">
            <Users className=\"w-8 h-8\" />
            Sistema de Revenda
          </h1>
          <p className=\"text-gray-600 mt-1\">Gerencie revendedores e suas permissões</p>
        </div>
        <button
          onClick={() => {
            setEditingReseller(null);
            setFormData({
              nome: '',
              email: '',
              senha: '',
              limite_dispositivos: 10,
              comissao_percentual: 10,
              status: 'ativo'
            });
            setShowModal(true);
          }}
          className=\"bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700\"
        >
          <Plus className=\"w-5 h-5\" />
          Novo Revendedor
        </button>
      </div>

      <div className=\"grid gap-4\">
        {resellers.map(reseller => (
          <div key={reseller.id} className=\"bg-white rounded-lg shadow p-6\">
            <div className=\"flex justify-between items-start\">
              <div className=\"flex-1\">
                <div className=\"flex items-center gap-3 mb-2\">
                  <h3 className=\"text-xl font-bold\">{reseller.nome}</h3>
                  {reseller.status === 'ativo' ? (
                    <span className=\"bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1\">
                      <CheckCircle className=\"w-4 h-4\" />
                      Ativo
                    </span>
                  ) : (
                    <span className=\"bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-1\">
                      <XCircle className=\"w-4 h-4\" />
                      Inativo
                    </span>
                  )}
                </div>
                
                <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mt-4\">
                  <div>
                    <p className=\"text-sm text-gray-600\">Email</p>
                    <p className=\"font-medium\">{reseller.email}</p>
                  </div>
                  <div>
                    <p className=\"text-sm text-gray-600 flex items-center gap-1\">
                      <Key className=\"w-4 h-4\" />
                      Limite de Dispositivos
                    </p>
                    <p className=\"font-medium\">{reseller.limite_dispositivos}</p>
                  </div>
                  <div>
                    <p className=\"text-sm text-gray-600 flex items-center gap-1\">
                      <DollarSign className=\"w-4 h-4\" />
                      Comissão
                    </p>
                    <p className=\"font-medium\">{reseller.comissao_percentual}%</p>
                  </div>
                  <div>
                    <p className=\"text-sm text-gray-600 flex items-center gap-1\">
                      <Calendar className=\"w-4 h-4\" />
                      Criado em
                    </p>
                    <p className=\"font-medium\">
                      {new Date(reseller.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className=\"flex gap-2\">
                <button
                  onClick={() => handleToggleStatus(reseller.id, reseller.status)}
                  className={p-2 rounded-lg }
                  title={reseller.status === 'ativo' ? 'Desativar' : 'Ativar'}
                >
                  {reseller.status === 'ativo' ? (
                    <XCircle className=\"w-5 h-5\" />
                  ) : (
                    <CheckCircle className=\"w-5 h-5\" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(reseller)}
                  className=\"bg-blue-100 text-blue-800 p-2 rounded-lg hover:bg-blue-200\"
                  title=\"Editar\"
                >
                  <Edit2 className=\"w-5 h-5\" />
                </button>
                <button
                  onClick={() => handleDelete(reseller.id)}
                  className=\"bg-red-100 text-red-800 p-2 rounded-lg hover:bg-red-200\"
                  title=\"Excluir\"
                >
                  <Trash2 className=\"w-5 h-5\" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {resellers.length === 0 && (
          <div className=\"text-center py-12 bg-white rounded-lg shadow\">
            <Users className=\"w-16 h-16 mx-auto text-gray-400 mb-4\" />
            <p className=\"text-gray-600 text-lg\">Nenhum revendedor cadastrado</p>
            <p className=\"text-gray-500 mt-2\">Clique em \"Novo Revendedor\" para começar</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50\">
          <div className=\"bg-white rounded-lg p-6 w-full max-w-md\">
            <h2 className=\"text-2xl font-bold mb-4\">
              {editingReseller ? 'Editar Revendedor' : 'Novo Revendedor'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className=\"space-y-4\">
                <div>
                  <label className=\"block text-sm font-medium mb-1\">Nome</label>
                  <input
                    type=\"text\"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className=\"w-full border rounded-lg px-3 py-2\"
                    required
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium mb-1\">Email</label>
                  <input
                    type=\"email\"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className=\"w-full border rounded-lg px-3 py-2\"
                    required
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium mb-1\">
                    Senha {editingReseller && '(deixe em branco para manter)'}
                  </label>
                  <input
                    type=\"password\"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className=\"w-full border rounded-lg px-3 py-2\"
                    required={!editingReseller}
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium mb-1\">Limite de Dispositivos</label>
                  <input
                    type=\"number\"
                    value={formData.limite_dispositivos}
                    onChange={(e) => setFormData({ ...formData, limite_dispositivos: parseInt(e.target.value) })}
                    className=\"w-full border rounded-lg px-3 py-2\"
                    min=\"1\"
                    required
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium mb-1\">Comissão (%)</label>
                  <input
                    type=\"number\"
                    value={formData.comissao_percentual}
                    onChange={(e) => setFormData({ ...formData, comissao_percentual: parseFloat(e.target.value) })}
                    className=\"w-full border rounded-lg px-3 py-2\"
                    min=\"0\"
                    max=\"100\"
                    step=\"0.1\"
                    required
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium mb-1\">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className=\"w-full border rounded-lg px-3 py-2\"
                  >
                    <option value=\"ativo\">Ativo</option>
                    <option value=\"inativo\">Inativo</option>
                  </select>
                </div>
              </div>

              <div className=\"flex gap-2 mt-6\">
                <button
                  type=\"button\"
                  onClick={() => {
                    setShowModal(false);
                    setEditingReseller(null);
                  }}
                  className=\"flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300\"
                >
                  Cancelar
                </button>
                <button
                  type=\"submit\"
                  className=\"flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700\"
                >
                  {editingReseller ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resale;
