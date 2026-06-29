import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(252, 95, 22, 0.15) 0%, #000 70%)' }}></div>
      
      {/* NAVBAR */}
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

      {/* MAIN CONTENT */}
      <main className="flex-grow w-full max-w-4xl mx-auto mt-12 px-6 pb-24 relative z-10">
         <h1 className="text-3xl font-black text-white mb-12 tracking-tight">Termos e Condições de Uso – MAXX Control</h1>
         
         <div className="space-y-6 text-zinc-300 text-sm md:text-base leading-relaxed">
            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">1. Interpretação e Definições</h2>
               <h3 className="font-bold text-white mb-2">Interpretação</h3>
               <p>As palavras com a letra inicial maiúscula têm significados definidos conforme as condições abaixo. As definições terão o mesmo significado independentemente de aparecerem no singular ou no plural.</p>
               
               <h3 className="font-bold text-white mt-4 mb-2">Definições</h3>
               <p>Para os fins destes Termos e Condições:</p>
               <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong className="text-white">Afiliada</strong> significa qualquer entidade que controla, é controlada por ou está sob controle comum de uma parte, sendo "controle" a posse de 50% ou mais das ações, participação societária ou outros títulos com direito a voto.</li>
                  <li><strong className="text-white">País</strong> refere-se ao Brasil.</li>
                  <li><strong className="text-white">Empresa</strong> (referida como "Companhia", "Nós", "Nosso(a)" ou "MAXX Control") refere-se ao MAXX Control, plataforma responsável pelo aplicativo.</li>
                  <li><strong className="text-white">Dispositivo</strong> significa qualquer equipamento capaz de acessar o Serviço, como computador, celular ou tablet.</li>
                  <li><strong className="text-white">Serviço</strong> refere-se ao aplicativo MAXX Control e aos conteúdos nele disponibilizados.</li>
                  <li><strong className="text-white">Termos e Condições</strong> (também referidos como "Termos") significam o presente acordo legal entre Você e a Empresa, regulando o uso do Serviço.</li>
                  <li><strong className="text-white">Serviço de Mídia Social de Terceiros</strong> significa quaisquer serviços ou conteúdos fornecidos por terceiros e que possam ser exibidos ou disponibilizados pelo Serviço.</li>
                  <li><strong className="text-white">Você</strong> significa o indivíduo que acessa ou utiliza o Serviço, ou a empresa ou outra entidade jurídica em nome da qual tal indivíduo acessa.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">2. Reconhecimento</h2>
               <p>Estes Termos e Condições regem o uso do Serviço e constituem o contrato entre Você e a Empresa.</p>
               <p className="mt-2">Ao acessar ou usar o Serviço, Você concorda em cumprir estes Termos. Se não concordar, não deverá utilizar o MAXX Control.</p>
               <p className="mt-2">Você declara ter mais de 18 anos de idade. O uso do Serviço por menores de idade não é permitido.</p>
               <p className="mt-2">O uso do Serviço também está condicionado à aceitação da nossa Política de Privacidade, que explica como coletamos, usamos e tratamos seus dados pessoais.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">3. Políticas e Acordos Adicionais</h2>
               <p>Além destes Termos, aplicam-se também as seguintes políticas:</p>
               <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><Link to="/politica-de-privacidade" className="text-brand-500 hover:underline">Política de Privacidade</Link></li>
                  <li>Política de Cookies (quando aplicável)</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">4. Links para Outros Sites</h2>
               <p>Nosso Serviço pode conter links para sites ou serviços de terceiros. A Empresa não possui controle e não se responsabiliza pelo conteúdo, políticas ou práticas de terceiros.</p>
               <p className="mt-2">Recomendamos que Você leia os termos e políticas de qualquer site externo que visitar.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">5. Encerramento</h2>
               <p>Podemos suspender ou encerrar seu acesso ao Serviço a qualquer momento, sem aviso prévio, caso ocorra violação destes Termos.</p>
               <p className="mt-2">Após o encerramento, seu direito de uso do Serviço será imediatamente cessado.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">6. Limitação de Responsabilidade</h2>
               <p>Na máxima medida permitida por lei, a Empresa não será responsável por danos indiretos, incidentais ou consequenciais (incluindo perda de lucros, dados ou informações).</p>
               <p className="mt-2">A responsabilidade total da Empresa estará limitada ao valor efetivamente pago por Você pelo Serviço.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">7. Isenção de Garantias</h2>
               <p>O Serviço é fornecido "como está" e "conforme disponível", sem garantias de qualquer tipo.</p>
               <p className="mt-2">Não garantimos que:</p>
               <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>O Serviço funcionará de forma ininterrupta ou livre de erros;</li>
                  <li>O conteúdo será sempre exato ou atualizado;</li>
                  <li>O aplicativo estará livre de vírus ou componentes nocivos.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">8. Legislação Aplicável</h2>
               <p>Estes Termos serão regidos pelas leis da República Federativa do Brasil.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">9. Resolução de Conflitos</h2>
               <p>Caso haja qualquer disputa relacionada ao uso do Serviço, Você concorda em tentar resolver amigavelmente, entrando em contato com a Empresa antes de recorrer a processos judiciais.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">10. Preços e Pagamentos</h2>
               <p>Os preços dos planos e serviços do MAXX Control são exibidos em Reais (R$).</p>
               <p className="mt-2">Reservamo-nos o direito de alterar valores a qualquer momento, mediante aviso no momento da contratação.</p>
               <p className="mt-2">Pagamentos podem ser realizados por PIX, cartão de crédito/débito ou outros métodos indicados no aplicativo. Todas as transações são processadas de forma segura.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">11. Direito de Cancelamento</h2>
               <p>Você poderá solicitar cancelamento de sua assinatura dentro do prazo de 7 (sete) dias corridos a contar da contratação, conforme o Código de Defesa do Consumidor (art. 49 da Lei 8.078/90).</p>
               <p className="mt-2">O reembolso será realizado pelo mesmo método de pagamento utilizado.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">12. Privacidade e Proteção de Dados</h2>
               <p>Seus dados pessoais são tratados de acordo com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/18).</p>
               <p className="mt-2">Você tem direito de acessar, corrigir e solicitar a exclusão dos seus dados. O uso de informações falsas ou fraudulentas poderá acarretar em suspensão imediata do acesso.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">13. Propriedade Intelectual</h2>
               <p>Todo o conteúdo disponibilizado no MAXX Control (incluindo textos, imagens, logotipos, vídeos e marcas) é protegido por direitos autorais e demais leis aplicáveis.</p>
               <p className="mt-2">A reprodução total ou parcial sem autorização prévia da Empresa é proibida.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">14. Alterações dos Termos</h2>
               <p>Podemos alterar estes Termos a qualquer momento. Alterações relevantes serão comunicadas aos usuários com pelo menos 30 dias de antecedência.</p>
               <p className="mt-2">O uso contínuo do Serviço após a entrada em vigor das alterações implica na aceitação das novas condições.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">15. Contato</h2>
               <p>Se Você tiver dúvidas sobre estes Termos e Condições, entre em contato:</p>
               <p className="mt-2 font-mono text-white bg-white/5 p-3 rounded-lg inline-block">📧 E-mail: suporte@maxxcontrol.com.br</p>
            </section>
         </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#050505] border-t border-white/5 py-12 relative z-10 mt-auto">
          <div className="max-w-[1500px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-6">
                 <div className="flex items-center gap-3 group cursor-pointer">
                     <img src="/logo-maxx.svg" alt="Maxx Control" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(252, 95, 22,0.3)] transition-transform group-hover:scale-110" />
                     <span className="font-black text-zinc-300 text-lg tracking-tighter">MAXX Control</span>
                 </div>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-xs md:text-sm text-zinc-500 font-medium">
                     <Link to="/active" className="hover:text-white transition">Ativação</Link>
                     <Link to="/upload-playlist" className="hover:text-white transition">Carregar Playlist</Link>
                     <Link to="/politica-de-privacidade" className="hover:text-white transition">Política de Privacidade</Link>
                 </div>
              </div>

              <div className="text-zinc-600 text-xs">
                  © 2026 MAXX Control Premium. Todos os Direitos Reservados.
              </div>
          </div>
      </footer>
    </div>
  );
}
