import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5">
              <ChevronLeft size={16} /> Voltar ao Site
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow w-full max-w-4xl mx-auto mt-12 px-6 pb-24 relative z-10">
         <h1 className="text-4xl font-black text-white mb-12 tracking-tight">Política de Privacidade – MAXX Control</h1>
         
         <div className="space-y-8 text-zinc-300 text-sm md:text-base leading-relaxed">
            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">1. Introdução</h2>
               <p>Olá! Bem-vindo à Política de Privacidade do MAXX Control.</p>
               <p className="mt-2">Aqui explicamos de forma clara como coletamos, utilizamos, armazenamos e protegemos os dados pessoais fornecidos por você, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).</p>
               <p className="mt-2">Também apresentamos seus direitos como titular de dados e como exercê-los, caso considere que foram violados.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">2. O que são dados pessoais?</h2>
               <p>São informações que permitem identificar uma pessoa. Exemplos: nome, CPF, data de nascimento, endereço, telefone, e-mail, entre outros.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">3. O que são dados pessoais sensíveis?</h2>
               <p>São dados que, se expostos, podem gerar discriminação, como: origem racial ou étnica, convicções religiosas, opiniões políticas, dados sobre saúde, vida sexual, biometria ou genética.</p>
               <p className="mt-4 font-semibold text-white bg-white/5 p-4 border-l-2 border-brand-500">➡️ O MAXX Control não coleta dados pessoais sensíveis.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">4. Quais dados coletamos?</h2>
               <p>Ao se cadastrar ou utilizar nossos serviços, podemos coletar:</p>
               
               <h3 className="font-bold text-white mt-4 mb-2">Pessoa Física</h3>
               <ul className="list-disc pl-6 space-y-1">
                  <li>Nome completo</li>
                  <li>CPF</li>
                  <li>Data de nascimento</li>
                  <li>Endereço residencial completo</li>
                  <li>Número de telefone com DDD</li>
                  <li>E-mail</li>
               </ul>

               <h3 className="font-bold text-white mt-4 mb-2">Pessoa Jurídica</h3>
               <ul className="list-disc pl-6 space-y-1">
                  <li>Razão social e nome fantasia</li>
                  <li>CNPJ</li>
                  <li>Data de constituição</li>
                  <li>Endereço comercial completo</li>
                  <li>Número de telefone com DDD</li>
                  <li>Nome dos sócios (com CPF ou CNPJ)</li>
               </ul>

               <h3 className="font-bold text-white mt-4 mb-2">Coleta automática (via tecnologia)</h3>
               <ul className="list-disc pl-6 space-y-1">
                  <li>Endereço de IP</li>
                  <li>Tipo e versão do navegador</li>
                  <li>Sistema operacional</li>
                  <li>Dados técnicos necessários para o funcionamento do aplicativo</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">5. Finalidade do uso dos dados</h2>
               <p>Os dados coletados podem ser utilizados para:</p>
               <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Enviar informações sobre serviços, atualizações e comunicados do MAXX Control;</li>
                  <li>Melhorar a experiência do usuário através de análises estatísticas;</li>
                  <li>Cumprir obrigações legais e regulatórias;</li>
                  <li>Garantir a segurança, prevenção a fraudes e verificações de autenticidade.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">6. Consentimento</h2>
               <p>Ao se cadastrar no MAXX Control, você autoriza que seus dados sejam:</p>
               <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Coletados, armazenados e tratados;</li>
                  <li>Utilizados para comunicações relacionadas ao aplicativo;</li>
                  <li>Cruzados com bases públicas e de empresas especializadas, para verificar autenticidade.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">7. Compartilhamento de dados</h2>
               <p className="font-bold text-white mb-2">Seus dados não são vendidos.</p>
               <p>Podem ser compartilhados apenas em casos específicos:</p>
               <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Com parceiros ou prestadores de serviço necessários para funcionamento da plataforma;</li>
                  <li>Por determinação legal ou ordem judicial;</li>
                  <li>Sempre de forma limitada ao necessário.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">8. Tempo de armazenamento</h2>
               <p>Os dados permanecem armazenados apenas pelo tempo necessário para cumprir sua finalidade.</p>
               <p className="mt-2">Após a revogação do consentimento, eles podem ser mantidos exclusivamente para cumprimento de obrigações legais.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">9. Direitos do titular (LGPD – art. 18)</h2>
               <p>Você pode solicitar, a qualquer momento:</p>
               <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong className="text-white">Acesso:</strong> saber quais dados temos sobre você;</li>
                  <li><strong className="text-white">Correção:</strong> alterar dados incorretos ou desatualizados;</li>
                  <li><strong className="text-white">Exclusão:</strong> solicitar a remoção de dados desnecessários ou tratados ilegalmente;</li>
                  <li><strong className="text-white">Portabilidade:</strong> transferir seus dados a outro fornecedor de serviços;</li>
                  <li><strong className="text-white">Informação:</strong> saber com quem seus dados são compartilhados;</li>
                  <li><strong className="text-white">Revogação:</strong> retirar seu consentimento para o tratamento de dados.</li>
               </ul>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">10. Alterações na política</h2>
               <p>Esta Política poderá ser alterada a qualquer momento.</p>
               <p className="mt-2">Sempre exibiremos a versão atualizada no aplicativo/website.</p>
               <p className="mt-2">Se autorizado, poderemos enviar aviso por e-mail em caso de mudanças relevantes.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">11. Foro e legislação aplicável</h2>
               <p>Esta Política será regida pelas leis da República Federativa do Brasil, sendo competente o foro do domicílio do usuário para dirimir eventuais conflitos.</p>
            </section>

            <section>
               <h2 className="text-xl font-bold text-white mb-4 text-brand-500">12. Contato</h2>
               <p>Se tiver dúvidas ou solicitações sobre seus dados pessoais, entre em contato:</p>
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
                     <Link to="/termos-de-uso" className="hover:text-white transition">Termos de Uso</Link>
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
