import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function LegalDocs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState({ title: '', body: [] });

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    const path = location.pathname;
    
    if (path.includes('terms')) {
      setContent({
        title: 'Termos e Condições de Uso',
        body: termsContent
      });
    } else if (path.includes('privacy') || path.includes('politica-de-privacidade')) {
      setContent({
        title: 'Política de Privacidade',
        body: privacyContent
      });
    } else if (path.includes('cookies')) {
      setContent({
        title: 'Política de Cookies',
        body: cookiesContent
      });
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans flex flex-col relative">
      {/* Navbar Minimalista */}
      <nav className="relative z-10 w-full bg-black/30 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-[1500px] mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-maxx.svg" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(252,95,22,0.5)]" />
            <span className="text-xl font-black tracking-tight text-white hidden sm:block">
              MAXX<span className="text-brand-500">Control</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/5">
              <ChevronLeft size={16} /> Voltar ao Site
            </Link>
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl md:text-4xl font-black text-white mb-10 pb-6 border-b border-white/10">{content.title}</h1>
        
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          {content.body.map((block, index) => {
            if (block.type === 'h2') {
              return <h2 key={index} className="text-xl font-bold text-white mt-10 mb-4">{block.text}</h2>;
            }
            if (block.type === 'h3') {
              return <h3 key={index} className="text-lg font-bold text-brand-500 mt-6 mb-3">{block.text}</h3>;
            }
            if (block.type === 'ul') {
              return (
                <ul key={index} className="list-disc pl-6 space-y-2 mb-6">
                  {block.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              );
            }
            return <p key={index} className="mb-4">{block.text}</p>;
          })}
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-[#020202] py-8 border-t border-white/5 text-center text-zinc-600 text-xs mt-auto">
        <div className="max-w-4xl mx-auto px-6">
          <p>© 2026 MAXX Control Premium. Todos os Direitos Reservados.</p>
        </div>
      </footer>
    </div>
  );
}

// -------------------------------------------------------------
// TEXTOS (Extraídos, com substituição para MAXX PLAYER)
// -------------------------------------------------------------

const termsContent = [
  { type: 'h2', text: '1. Interpretação e Definições' },
  { type: 'h3', text: 'Interpretação' },
  { type: 'p', text: 'As palavras com a letra inicial maiúscula têm significados definidos conforme as condições abaixo. As definições terão o mesmo significado independentemente de aparecerem no singular ou no plural.' },
  { type: 'h3', text: 'Definições' },
  { type: 'p', text: 'Para os fins destes Termos e Condições:' },
  { type: 'ul', items: [
    'Afiliada significa qualquer entidade que controla, é controlada por ou está sob controle comum de uma parte.',
    'País refere-se ao Brasil.',
    'Empresa (referida como "Companhia", "Nós", "Nosso(a)" ou "MAXX PLAYER") refere-se ao MAXX PLAYER, aplicativo e plataforma.',
    'Dispositivo significa qualquer equipamento capaz de acessar o Serviço, como computador, celular, tablet ou Smart TV.',
    'Serviço refere-se ao aplicativo MAXX PLAYER e aos recursos nele disponibilizados.',
    'Termos e Condições (também referidos como "Termos") significam o presente acordo legal entre Você e a Empresa, regulando o uso do Serviço.',
    'Você significa o indivíduo que acessa ou utiliza o Serviço.'
  ]},
  { type: 'h2', text: '2. Reconhecimento' },
  { type: 'p', text: 'Estes Termos e Condições regem o uso do Serviço e constituem o contrato entre Você e a Empresa.' },
  { type: 'p', text: 'Ao acessar ou usar o Serviço, Você concorda em cumprir estes Termos. Se não concordar, não deverá utilizar o MAXX PLAYER.' },
  { type: 'p', text: 'Você declara ter mais de 18 anos de idade. O uso do Serviço por menores de idade não é permitido.' },
  { type: 'p', text: 'O uso do Serviço também está condicionado à aceitação da nossa Política de Privacidade, que explica como coletamos, usamos e tratamos seus dados pessoais.' },
  { type: 'h2', text: '3. Políticas e Acordos Adicionais' },
  { type: 'p', text: 'Além destes Termos, aplicam-se também as seguintes políticas:' },
  { type: 'ul', items: ['Política de Privacidade', 'Política de Cookies (quando aplicável)'] },
  { type: 'h2', text: '4. Isenção de Responsabilidade sobre Conteúdo (ATENÇÃO)' },
  { type: 'p', text: 'O MAXX PLAYER NÃO VENDE NEM FORNECE CONTEÚDO DE PLAYLIST.' },
  { type: 'p', text: 'O MAXX PLAYER é exclusivamente um aplicativo (player de mídia). O funcionamento do aplicativo depende de listas de reprodução (playlists) inseridas e fornecidas pelo próprio usuário.' },
  { type: 'p', text: 'A Empresa repudia qualquer violação de direitos autorais. O usuário é o único responsável pelos conteúdos inseridos no aplicativo.' },
  { type: 'h2', text: '5. Encerramento' },
  { type: 'p', text: 'Podemos suspender ou encerrar seu acesso ao Serviço a qualquer momento, sem aviso prévio, caso ocorra violação destes Termos.' },
  { type: 'h2', text: '6. Limitação de Responsabilidade' },
  { type: 'p', text: 'Na máxima medida permitida por lei, a Empresa não será responsável por danos indiretos, incidentais ou consequenciais. A responsabilidade total da Empresa estará limitada ao valor efetivamente pago por Você pela licença/ativação do aplicativo.' },
  { type: 'h2', text: '7. Isenção de Garantias' },
  { type: 'p', text: 'O Serviço é fornecido "como está" e "conforme disponível". Não garantimos que o Serviço funcionará de forma ininterrupta, pois ele depende do dispositivo do usuário, de sua conexão com a internet e do servidor do conteúdo inserido.' },
  { type: 'h2', text: '8. Legislação Aplicável e Resolução de Conflitos' },
  { type: 'p', text: 'Estes Termos serão regidos pelas leis da República Federativa do Brasil. Você concorda em tentar resolver amigavelmente, entrando em contato com a Empresa antes de recorrer a processos judiciais.' },
  { type: 'h2', text: '9. Preços e Pagamentos' },
  { type: 'p', text: 'Os preços de ativação do MAXX PLAYER são exibidos em Reais (R$). Reservamo-nos o direito de alterar valores a qualquer momento, mediante aviso no momento da contratação. Todas as transações são processadas de forma segura.' },
  { type: 'h2', text: '10. Contato' },
  { type: 'p', text: 'Se Você tiver dúvidas sobre estes Termos e Condições, entre em contato através de nossos canais oficiais de suporte no site.' }
];

const privacyContent = [
  { type: 'h2', text: '1. Introdução' },
  { type: 'p', text: 'Olá! Bem-vindo à Política de Privacidade do MAXX PLAYER.' },
  { type: 'p', text: 'Aqui explicamos de forma clara como coletamos, utilizamos, armazenamos e protegemos os dados pessoais fornecidos por você, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).' },
  { type: 'h2', text: '2. O que são dados pessoais?' },
  { type: 'p', text: 'São informações que permitem identificar uma pessoa. O MAXX PLAYER coleta o mínimo de informações possíveis, focando estritamente na ativação e funcionamento do aplicativo (como o MAC Address do seu dispositivo).' },
  { type: 'h2', text: '3. Dados Pessoais Sensíveis' },
  { type: 'p', text: 'O MAXX PLAYER não coleta dados pessoais sensíveis (como origem racial, opiniões políticas, dados de saúde, etc).' },
  { type: 'h2', text: '4. Quais dados coletamos?' },
  { type: 'p', text: 'Ao ativar nosso serviço, podemos coletar:' },
  { type: 'ul', items: [
    'Endereço MAC (MAC Address) do dispositivo para liberação do uso.',
    'E-mail (quando fornecido para suporte ou envio de comprovantes).',
    'Dados técnicos (como endereço de IP, tipo de dispositivo) para funcionamento e segurança da aplicação.'
  ]},
  { type: 'h2', text: '5. Finalidade do uso dos dados' },
  { type: 'ul', items: [
    'Ativar e licenciar o uso do aplicativo no seu dispositivo específico.',
    'Garantir a segurança e prevenção a fraudes.',
    'Cumprir obrigações legais e regulatórias.'
  ]},
  { type: 'h2', text: '6. Compartilhamento de dados' },
  { type: 'p', text: 'Seus dados NÃO SÃO VENDIDOS.' },
  { type: 'p', text: 'Podem ser compartilhados apenas com parceiros estritamente necessários para o funcionamento (ex: gateway de pagamento) ou por determinação judicial.' },
  { type: 'h2', text: '7. Tempo de armazenamento e Direitos' },
  { type: 'p', text: 'Armazenamos os dados pelo tempo necessário para manter sua licença ativa. Você tem o direito de solicitar a exclusão de seus dados, porém isso acarretará na perda da ativação do aplicativo, visto que o MAC Address é a chave de licença.' },
  { type: 'h2', text: '8. Contato' },
  { type: 'p', text: 'Para solicitações sobre privacidade e dados, entre em contato conosco através do suporte oficial do site.' }
];

const cookiesContent = [
  { type: 'h2', text: 'O que são cookies?' },
  { type: 'p', text: 'Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita nosso site. Eles nos ajudam a melhorar sua experiência, lembrando suas preferências e fornecendo funcionalidades personalizadas, como o seu consentimento de termos.' },
  { type: 'h2', text: 'Como usamos cookies?' },
  { type: 'ul', items: [
    'Manter o seu dispositivo conectado e ativado.',
    'Lembrar que você já leu e concordou com nossos Termos de Uso (ex: cookie de consentimento).',
    'Lembrar preferências de idioma e layout.'
  ]},
  { type: 'h2', text: 'Gerenciamento de cookies' },
  { type: 'p', text: 'Você pode controlar ou excluir cookies através das configurações do seu navegador. Contudo, ao desativar cookies essenciais, partes do nosso site podem não funcionar adequadamente.' }
];
