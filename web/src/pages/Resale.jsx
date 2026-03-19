import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';

const Resale = () => {
  const [revendedores, setRevendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editandoRevendedor, setEditandoRevendedor] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    limite_dispositivos: 10,
    ativo: true
  });

  useEffect(() => {
    carregarRevendedores();
  }, []);

  const carregarRevendedores = async () => {
    try {
      const response = await api.get('/api/resale/resellers');
      setRevendedores(response.data);
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
      if (editandoRevendedor) {
        await api.put(/api/resale/resellers/Count{editandoRevendedor.id}, formData);
        alert('Revendedor atualizado com sucesso!');
      } else {
        await api.post('/api/resale/resellers', formData);
        alert('Revendedor criado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      carregarRevendedores();
    } catch (error) {
      console.error('Erro ao salvar revendedor:', error);
      alert('Erro ao salvar revendedor');
    }
  };

  const handleEdit = (revendedor) => {
    setEditandoRevendedor(revendedor);
    setFormData({
      nome: revendedor.nome,
      email: revendedor.email,
      telefone: revendedor.telefone || '',
      empresa: revendedor.empresa || '',
      limite_dispositivos: revendedor.limite_dispositivos,
      ativo: revendedor.ativo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este revendedor?')) return;
    
    try {
      await api.delete(/api/resale/resellers/Count{id});
      alert('Revendedor excluído com sucesso!');
      carregarRevendedores();
    } catch (error) {
      console.error('Erro ao excluir revendedor:', error);
      alert('Erro ao excluir revendedor');
    }
  };

  const handleToggleStatus = async (id, ativo) => {
    try {
      await api.patch(/api/resale/resellers/Count{id}/toggle-status, { ativo: !ativo });
      carregarRevendedores();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      limite_dispositivos: 10,
      ativo: true
    });
    setEditandoRevendedor(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Sistema de Revenda
          </h1>
          <p className="text-gray-600 mt-1">Gerencie seus revendedores e distribuidores</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Revendedor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revendedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dispositivos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {revendedores.map((revendedor) => (
              <tr key={revendedor.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{revendedor.nome}</div>
                  {revendedor.empresa && (
                    <div className="text-sm text-gray-500">{revendedor.empresa}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{revendedor.email}</div>
                  {revendedor.telefone && (
                    <div className="text-sm text-gray-500">{revendedor.telefone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {revendedor.dispositivos_ativos || 0} / {revendedor.limite_dispositivos}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(revendedor.id, revendedor.ativo)}
                    className={px-2 inline-flex text-xs leading-5 font-semibold rounded-full Count{
                      revendedor.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }}
                  >
                    {revendedor.ativo ? (
                      <span className="flex items-center gap-1">
                        <Power className="w-3 h-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <PowerOff className="w-3 h-3" />
                        Inativo
                      </span>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(revendedor)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(revendedor.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {revendedores.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum revendedor</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando um novo revendedor.
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editandoRevendedor ? 'Editar Revendedor' : 'Novo Revendedor'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite de Dispositivos *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.limite_dispositivos}
                  onChange={(e) => setFormData({ ...formData, limite_dispositivos: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Ativo</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editandoRevendedor ? 'Atualizar' : 'Criar'}
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
