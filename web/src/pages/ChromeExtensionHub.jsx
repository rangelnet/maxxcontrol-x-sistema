import { useEffect, useMemo, useState } from 'react';
import {
  Puzzle,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Download,
  Copy,
  Link2,
  Server,
  Clock,
  Globe,
  ShieldCheck,
  Activity
} from 'lucide-react';
import api from '../services/api';

const cardStyle = {
  background: 'rgba(17,17,17,0.72)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(59,130,246,0.14)',
  borderRadius: 18,
  boxShadow: '0 10px 28px rgba(0,0,0,0.35)'
};

const mutedText = { fontSize: 12, color: '#71717a', lineHeight: 1.55 };

const primaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 18px',
  borderRadius: 12,
  border: '1px solid rgba(59,130,246,0.35)',
  background: 'linear-gradient(135deg, rgba(59,130,246,0.98), rgba(29,78,216,0.98))',
  color: '#fff',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 12px 30px rgba(37,99,235,0.28)'
};

const ghostButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
  color: '#d4d4d8',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer'
};

const getStatusBadge = (connected) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 12px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
  color: connected ? '#34d399' : '#f59e0b',
  background: connected ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
  border: connected ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(245,158,11,0.25)'
});

const formatLastSeen = (value) => {
  if (!value) return 'Aguardando primeiro sinal';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Aguardando primeiro sinal';
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
};

const guessMimeType = (filename) => {
  if (filename.endsWith('.json')) return 'application/json';
  return 'text/javascript';
};

export default function ChromeExtensionHub() {
  const [statusData, setStatusData] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3200);
  };

  const loadStatus = async (silent = false) => {
    try {
      if (!silent) setLoadingStatus(true);
      const { data } = await api.get('/api/iptv-plugin/extension-status');
      setStatusData(data);
    } catch (error) {
      showFeedback(error.response?.data?.error || 'Não foi possível carregar o status da extensão.', 'error');
    } finally {
      if (!silent) setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(() => loadStatus(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const queue = useMemo(() => {
    const base = statusData?.queue || {};
    return {
      pending: Number(base.pending) || 0,
      processing: Number(base.processing) || 0,
      done: Number(base.done) || 0,
      error: Number(base.error) || 0
    };
  }, [statusData]);

  const fetchPackage = async () => {
    const { data } = await api.get('/api/iptv-plugin/extension-package');
    return data;
  };

  const writeTextFile = async (directoryHandle, filename, content) => {
    const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  };

  const triggerDownload = (filename, content) => {
    const blob = new Blob([content], { type: guessMimeType(filename) });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrepareFolder = async () => {
    setInstalling(true);
    try {
      const pluginPackage = await fetchPackage();
      const files = pluginPackage.files || {};
      const entries = Object.entries(files);

      if (!entries.length) {
        throw new Error('O painel não retornou os arquivos da extensão.');
      }

      if ('showDirectoryPicker' in window) {
        const directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        for (const [filename, content] of entries) {
          await writeTextFile(directoryHandle, filename, content);
        }
        showFeedback('Pasta da extensão preparada. Agora é só carregar essa pasta em chrome://extensions.');
      } else {
        entries.forEach(([filename, content]) => triggerDownload(filename, content));
        showFeedback('Seu navegador não permitiu criar a pasta automaticamente. Baixei os arquivos separadamente para você.', 'info');
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        showFeedback('Preparação da pasta cancelada.', 'info');
      } else {
        showFeedback(error.message || 'Não foi possível preparar a pasta da extensão.', 'error');
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleDownloadFiles = async () => {
    setDownloading(true);
    try {
      const pluginPackage = await fetchPackage();
      Object.entries(pluginPackage.files || {}).forEach(([filename, content]) => triggerDownload(filename, content));
      showFeedback('Arquivos da extensão baixados com sucesso.');
    } catch (error) {
      showFeedback(error.response?.data?.error || 'Falha ao baixar os arquivos da extensão.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyApiBase = async () => {
    const value = statusData?.recommended_api_base;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      showFeedback('URL do relay copiada.');
    } catch (error) {
      showFeedback('Não consegui copiar a URL automaticamente.', 'error');
    }
  };

  const isConnected = !!statusData?.connected;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {feedback && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 250,
            padding: '12px 18px',
            borderRadius: 12,
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            background:
              feedback.type === 'error'
                ? 'rgba(239,68,68,0.96)'
                : feedback.type === 'info'
                  ? 'rgba(59,130,246,0.96)'
                  : 'rgba(16,185,129,0.96)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {feedback.text}
        </div>
      )}

      <div
        style={{
          ...cardStyle,
          padding: 24,
          border: '1px solid rgba(59,130,246,0.2)',
          background:
            'radial-gradient(circle at top center, rgba(37,99,235,0.14), transparent 42%), rgba(17,17,17,0.76)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(59,130,246,0.14)',
                  border: '1px solid rgba(59,130,246,0.3)'
                }}
              >
                <Puzzle size={22} color="#60a5fa" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#fff' }}>Central da Extensão Chrome</h2>
                <p style={{ margin: '4px 0 0 0', ...mutedText }}>
                  Instale e acompanhe o plugin que conecta este painel aos qPanels/Sigma pelo relay remoto.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={getStatusBadge(isConnected)}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: isConnected ? '#34d399' : '#f59e0b' }} />
                {isConnected ? 'Extensão online' : 'Aguardando conexão'}
              </span>
              <span style={{ ...mutedText, color: '#a1a1aa' }}>
                O painel prepara os arquivos da extensão já apontando para o relay correto desta instalação.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handlePrepareFolder} disabled={installing} style={{ ...primaryButton, opacity: installing ? 0.7 : 1 }}>
              {installing ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FolderOpen size={16} />}
              {installing ? 'Preparando...' : 'Preparar pasta da extensão'}
            </button>
            <button onClick={handleDownloadFiles} disabled={downloading} style={{ ...ghostButton, opacity: downloading ? 0.7 : 1 }}>
              {downloading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
              Baixar arquivos
            </button>
            <button onClick={() => loadStatus()} style={ghostButton}>
              <RefreshCw size={16} />
              Atualizar status
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: 18 }}>
        <div style={{ ...cardStyle, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <ShieldCheck size={18} color="#60a5fa" />
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#fff' }}>Instalação guiada</h3>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {[
              {
                title: '1. Preparar a pasta',
                text: 'Clique em “Preparar pasta da extensão”. O painel cria os arquivos já configurados com a URL correta deste backend.'
              },
              {
                title: '2. Abrir as extensões do navegador',
                text: 'No Chrome ou Edge, abra chrome://extensions e ative o Modo do desenvolvedor.'
              },
              {
                title: '3. Carregar sem compactação',
                text: 'Escolha a pasta criada pelo painel. A extensão começa a fazer polling e a mandar heartbeat automaticamente.'
              },
              {
                title: '4. Usar com qPanel/Sigma',
                text: 'Com a extensão carregada e o painel aberto, as ações de relay e a sincronização com outros painéis passam a responder aqui.'
              }
            ].map((item, index) => (
              <div
                key={item.title}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '42px 1fr',
                  gap: 14,
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#60a5fa',
                    background: 'rgba(59,130,246,0.14)',
                    border: '1px solid rgba(59,130,246,0.26)'
                  }}
                >
                  0{index + 1}
                </div>
                <div>
                  <p style={{ margin: 0, color: '#fff', fontSize: 14, fontWeight: 800 }}>{item.title}</p>
                  <p style={{ margin: '5px 0 0 0', ...mutedText }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Activity size={17} color="#34d399" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>Status ao vivo</h3>
            </div>

            {loadingStatus ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#71717a', fontSize: 13 }}>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                Carregando status da extensão...
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Último sinal</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7' }}>{formatLastSeen(statusData?.status?.last_seen)}</span>
                </div>

                <div style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Versão</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7' }}>{statusData?.status?.version || '1.1.0'}</span>
                </div>

                <div style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Destino do relay</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#93c5fd', wordBreak: 'break-all' }}>
                      {statusData?.recommended_api_base || '—'}
                    </span>
                    <button onClick={handleCopyApiBase} style={{ ...ghostButton, padding: '8px 10px', minWidth: 0 }}>
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Server size={17} color="#60a5fa" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>Fila do relay</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { label: 'Pendentes', value: queue.pending, color: '#f59e0b' },
                { label: 'Processando', value: queue.processing, color: '#60a5fa' },
                { label: 'Concluídos', value: queue.done, color: '#34d399' },
                { label: 'Erros', value: queue.error, color: '#f87171' }
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {item.label}
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: 22, fontWeight: 900, color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Globe size={17} color="#a78bfa" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>Como ela está funcionando agora</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            {
              icon: Link2,
              title: 'Pacote gerado pelo painel',
              text: 'Os arquivos da extensão saem do próprio painel já configurados para a URL correta do relay.'
            },
            {
              icon: Clock,
              title: 'Heartbeat automático',
              text: 'A extensão avisa ao painel quando está ativa, então você consegue saber se ela está online ou parada.'
            },
            {
              icon: Server,
              title: 'Relay para qPanels',
              text: 'As ações remotas continuam usando a fila de comandos existente, só que agora com instalação guiada dentro do painel.'
            }
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.24)'
                }}
              >
                <item.icon size={16} color="#a78bfa" />
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#fff' }}>{item.title}</p>
              <p style={{ margin: '6px 0 0 0', ...mutedText }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
