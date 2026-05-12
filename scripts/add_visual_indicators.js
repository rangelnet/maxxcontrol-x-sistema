import fs from 'fs';

const filePath = 'R:\\Users\\Usuario\\Meu Drive\\Painel Maxxcontrol-x-sistema\\web\\src\\pages\\Devices.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. MOBILE INDICATORS
const mobileTarget = "{/* BotÃµes Aí§Ã£o Mobile */}";
const mobileReplacement = `                      {/* Indicadores de Teste */}
                      {(dev?.test_api_urls || dev?.test_blocked === '1') && (
                        <div style={{ display:'flex', gap:6, marginBottom:12, padding:'6px 10px', background:'rgba(255,255,255,0.03)', borderRadius:8, border:'1px solid rgba(255,255,255,0.05)' }}>
                          {dev?.test_blocked === '1' && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:'#f87171', fontWeight:800 }}><Ban size={10}/> TESTE BLOQUEADO</span>}
                          {dev?.test_api_urls && <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:'#fbbf24', fontWeight:800 }}><Zap size={10}/> TESTE ATIVO ({dev.test_duration}h)</span>}
                        </div>
                      )}

                      {/* Botões Ação Mobile */}`;

if (content.includes(mobileTarget)) {
    content = content.replace(mobileTarget, mobileReplacement);
}

// 2. DESKTOP INDICATORS
const desktopTarget = "{!acc && dev && <StatusBadge status={dev.status} />}";
const desktopReplacement = `{!acc && dev && <StatusBadge status={dev.status} />}
                               
                               {/* Indicadores de Teste GrÃ¡tis */}
                               {dev && (dev.test_api_urls || dev.test_blocked === '1') && (
                                 <div style={{ display:'flex', gap:4, marginTop:2 }}>
                                   {dev.test_blocked === '1' && (
                                     <div title="Teste Bloqueado" style={{ background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:4, padding:'2px 4px', display:'flex', alignItems:'center' }}>
                                       <Ban size={10} color="#f87171" />
                                     </div>
                                   )}
                                   {dev.test_api_urls && (
                                     <div title={\`Teste Ativo: \${dev.test_duration}h\`} style={{ background:'rgba(251,191,36,0.2)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:4, padding:'2px 4px', display:'flex', alignItems:'center', gap:3 }}>
                                       <Zap size={10} color="#fbbf24" />
                                       <span style={{ fontSize:8, color:'#fbbf24', fontWeight:800 }}>{dev.test_duration}h</span>
                                     </div>
                                   )}
                                 </div>
                               )}`;

if (content.includes(desktopTarget)) {
    content = content.replace(desktopTarget, desktopReplacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('âœ… Indicadores visuais adicionados com sucesso!');
