const fs = require('fs');

// 1. Update macController.js
const macFile = 'R:/Meu Drive/Painel Maxxcontrol-x-sistema/modules/mac/macController.js';
let macContent = fs.readFileSync(macFile, 'utf8');

const route = `

// Bulk Import para Dispositivos
router.post('/bulk-import', authMiddleware, async (req, res) => {
  try {
    const { clients } = req.body;
    if (!clients || clients.length === 0) return res.status(400).json({ error: 'Nenhum dispositivo' });
    const client = await pool.connect();
    const userId = req.user.id;
    try {
      await client.query('BEGIN');
      for (const c of clients) {
        if (!c.mac) continue;
        const existing = await client.query('SELECT id FROM devices WHERE mac_address = $1', [c.mac]);
        if (existing.rows.length === 0) {
          await client.query(
            'INSERT INTO devices (user_id, mac_address, app_version, status, connection_status, server, username, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [userId, c.mac, c.app_version || '', 'ativo', 'offline', c.server || '', c.username || '', c.password || '']
          );
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.json({ success: true, imported: clients.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`;

if (!macContent.includes('/bulk-import')) {
    macContent = macContent.replace('module.exports = router;', route);
    fs.writeFileSync(macFile, macContent, 'utf8');
}

// 2. Update Devices.jsx
const devFile = 'R:/Meu Drive/Painel Maxxcontrol-x-sistema/web/src/pages/Devices.jsx';
let devContent = fs.readFileSync(devFile, 'utf8');

const targetStr = `<UploadExcelModal
          onClose={() => setShowUploadExcelModal(false)}
          onImportSuccess={() => {
            loadClients();
            loadDevices();
          }}`;
          
const replacementStr = `<UploadExcelModal
          endpoint="/api/mac/bulk-import"
          onClose={() => setShowUploadExcelModal(false)}
          onImportSuccess={() => {
            loadClients();
            loadDevices();
          }}`;

if (devContent.includes(targetStr)) {
    devContent = devContent.replace(targetStr, replacementStr);
    fs.writeFileSync(devFile, devContent, 'utf8');
}

// 3. Ensure UploadExcelModal.jsx encoding is perfectly pristine by re-writing it from scratch
const uploadModalCode = `import React, { useState } from 'react';
import { Package, X, CheckCircle, AlertCircle, Save, Database, UploadCloud } from 'lucide-react';
import api from '../services/api';

export default function UploadExcelModal({ onClose, onImportSuccess, endpoint = "/api/iptv-plugin/bulk-import" }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [xlsxLoaded, setXlsxLoaded] = useState(false);

  React.useEffect(() => {
    // Carregamento dinâmico do XLSX via CDN (Sem NPM)
    if (window.XLSX) {
      setXlsxLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.async = true;
    script.onload = () => setXlsxLoaded(true);
    script.onerror = () => setError('Falha ao carregar biblioteca do Excel. Tente novamente.');
    document.body.appendChild(script);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo Excel.');
      return;
    }
    if (!window.XLSX) {
      setError('Aguarde o carregamento do módulo Excel...');
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          throw new Error('A planilha está vazia.');
        }

        // Mapeamento dinâmico das colunas
        const clients = jsonData.map((row, index) => {
           return {
              username: row['Usuario'] || row['Usuário'] || row['username'] || row['Nome'] || \`User\${index}\`,
              password: row['Senha'] || row['password'] || '123456',
              mac: row['MAC'] || row['mac'] || row['Mac'] || '',
              expire_date: row['Vencimento'] || row['expire_date'] || row['Vencimento'] || '',
              nome: row['Nome'] || row['nome'] || '',
              telefone: row['Telefone'] || row['telefone'] || row['WhatsApp'] || '',
              email: row['Email'] || row['email'] || '',
              notas: row['Notas'] || row['notas'] || row['Observacao'] || '',
              app_version: row['App'] || row['app_version'] || row['Versao'] || ''
           }
        });

        const response = await api.post(endpoint, {
          clients,
          import_type: 'local'
        });

        if (response.data) {
          setSuccess(true);
          setTimeout(() => {
            if (onImportSuccess) onImportSuccess();
            onClose();
          }, 2000);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Erro ao processar o arquivo.');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Falha na leitura do arquivo local.');
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#18181b', width: '100%', maxWidth: 450, borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, #18181b, #27272a)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(252,95,22,0.1)', padding: 6, borderRadius: 8 }}>
              <UploadCloud size={18} color="#FC5F16" />
            </div>
            <h2 style={{ margin: 0, fontSize: 16, color: '#fff', fontWeight: 600 }}>Importação em Lote via Excel</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <CheckCircle size={48} color="#10b981" style={{ marginBottom: 16 }} />
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Importação Concluída!</h3>
              <p style={{ color: '#a1a1aa', fontSize: 14 }}>Os clientes foram processados com sucesso.</p>
            </div>
          ) : (
            <>
              <div style={{ background: 'rgba(252,95,22,0.05)', border: '1px dashed rgba(252,95,22,0.3)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>
                  Faça o upload de uma planilha (.xlsx ou .csv) contendo as seguintes colunas (mesmo que vazias):
                  <br/><br/>
                  <strong style={{ color: '#FC5F16' }}>Usuario, Senha, MAC, Vencimento, Nome, Telefone, Email, Notas</strong>
                </p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{ 
                  border: '2px dashed #3f3f46', borderRadius: 8, padding: '30px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: file ? 'rgba(252,95,22,0.05)' : '#18181b', borderColor: file ? '#FC5F16' : '#3f3f46'
                }}
                onClick={() => document.getElementById('excel-upload-input').click()}
              >
                <Database size={32} color={file ? "#FC5F16" : "#71717a"} style={{ marginBottom: 12 }} />
                <h4 style={{ margin: 0, color: file ? '#FC5F16' : '#fff', fontSize: 14, marginBottom: 4 }}>
                  {file ? file.name : 'Clique ou arraste a planilha aqui'}
                </h4>
                <p style={{ margin: 0, fontSize: 12, color: '#71717a' }}>
                  {file ? \`\${(file.size / 1024).toFixed(1)} KB\` : 'Suporta arquivos Excel padrão'}
                </p>
                <input 
                  id="excel-upload-input"
                  type="file" 
                  accept=".xlsx,.xls,.csv" 
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button 
                  onClick={onClose}
                  style={{ flex: 1, padding: 12, borderRadius: 8, background: '#27272a', border: '1px solid #3f3f46', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleImport}
                  disabled={loading || !file || !xlsxLoaded}
                  style={{ flex: 1, padding: 12, borderRadius: 8, background: '#FC5F16', border: 'none', color: '#fff', fontWeight: 600, cursor: (loading || !file || !xlsxLoaded) ? 'not-allowed' : 'pointer', opacity: (loading || !file || !xlsxLoaded) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading ? (
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <><Save size={16} /> {xlsxLoaded ? 'Importar Dados' : 'Carregando...'}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{\`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      \`}</style>
    </div>
  );
}
`;

fs.writeFileSync('R:/Meu Drive/Painel Maxxcontrol-x-sistema/web/src/components/UploadExcelModal.jsx', uploadModalCode, 'utf8');

console.log("All fixed and applied correctly!");
