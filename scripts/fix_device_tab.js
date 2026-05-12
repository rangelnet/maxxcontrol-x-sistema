import fs from 'fs';

const filePath = 'R:\\Users\\Usuario\\Meu Drive\\Painel Maxxcontrol-x-sistema\\web\\src\\pages\\Devices.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = "{manageTab === 'device' && selectedDevice && (";
const endMarker = ")}";

const lines = content.split('\n');
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startMarker)) {
        startIndex = i;
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() === endMarker) {
                endIndex = j;
                break;
            }
        }
        if (startIndex !== -1 && endIndex !== -1) break;
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    const newBlockLines = [
        `              {manageTab === 'device' && selectedDevice && (`,
        `                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>`,
        `                  <DeviceInfo device={selectedDevice} />`,
        `                  `,
        `                  {/* CENTRAL DE TESTE GRÃTIS */}`,
        `                  <div style={{ background:'rgba(5,5,5,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:16 }}>`,
        `                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>`,
        `                       <Zap size={18} color="#FFA500" />`,
        `                       <h3 style={{ margin:0, fontSize:14, color:'#fff', fontWeight:700 }}>ConfiguraÃ§Ã£o de Teste GrÃ¡tis</h3>`,
        `                    </div>`,
        `                    `,
        `                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>`,
        `                      <FormField label="Links de Teste GrÃ¡tis (MÃºltiplos / Um por linha)">`,
        `                        <textarea `,
        `                          style={{ ...inputStyle, minHeight:100, resize:'vertical', fontFamily:'monospace', fontSize:11, background:'rgba(0,0,0,0.3)' }} `,
        `                          value={selectedDevice.test_api_urls || ''} `,
        `                          onChange={e => setSelectedDevice({...selectedDevice, test_api_urls: e.target.value})}`,
        `                          placeholder="http://servidor1.com:8080&#10;http://servidor2.com:8080"`,
        `                        />`,
        `                      </FormField>`,
        `                      `,
        `                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>`,
        `                        <FormField label="Tempo de Teste (Horas)">`,
        `                          <input `,
        `                            type="number" `,
        `                            style={inputStyle} `,
        `                            value={selectedDevice.test_duration || 2} `,
        `                            onChange={e => setSelectedDevice({...selectedDevice, test_duration: e.target.value})}`,
        `                            placeholder="Ex: 2"`,
        `                          />`,
        `                        </FormField>`,
        `                        <FormField label="Bloquear Testes">`,
        `                          <select `,
        `                            style={selectStyle} `,
        `                            value={selectedDevice.test_blocked || '0'} `,
        `                            onChange={e => setSelectedDevice({...selectedDevice, test_blocked: e.target.value})}`,
        `                          >`,
        `                            <option value="0" style={{background:'#111',color:'#fff'}}>Liberado</option>`,
        `                            <option value="1" style={{background:'#111',color:'#fff'}}>Bloqueado</option>`,
        `                          </select>`,
        `                        </FormField>`,
        `                      </div>`,
        `                      `,
        `                      <div style={{ marginTop:10 }}>`,
        `                        <button `,
        `                          onClick={() => {`,
        `                            api.post(\`/api/devices/\${selectedDevice.id}/test-config\`, {`,
        `                              test_api_urls: selectedDevice.test_api_urls,`,
        `                              test_duration: selectedDevice.test_duration,`,
        `                              test_blocked: selectedDevice.test_blocked`,
        `                            }).then(() => {`,
        `                              setDevices(prev => prev.map(d => d.id === selectedDevice.id ? { ...d, ...selectedDevice } : d));`,
        `                              showToast('ConfiguraÃ§Ã£o de teste atualizada!');`,
        `                            }).catch(err => {`,
        `                              showToast('Erro ao atualizar: ' + (err.response?.data?.error || err.message), 'error');`,
        `                            });`,
        `                          }} `,
        `                          style={{ ...btnPrimary, width:'100%', justifyContent:'center' }}`,
        `                        >`,
        `                          <Save size={15}/> Atualizar ConfiguraÃ§Ã£o de Teste`,
        `                        </button>`,
        `                      </div>`,
        `                    </div>`,
        `                  </div>`,
        ``,
        `                  {/* IPTV EMBUTIDO (XTREAM) */}`,
        `                  <div style={{ background:'rgba(5,5,5,0.3)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, padding:14 }}>`,
        `                    <p style={{ fontSize:11, color:'#71717a', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}><Server size={14} color="#FC5F16" /> ConfiguraÃ§Ã£o IPTV Fixa</p>`,
        `                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>`,
        `                      <FormField label="URL do Servidor">`,
        `                        <input style={inputStyle} value={iptvConfig.xtream_url} onChange={e => setIptvConfig({...iptvConfig,xtream_url:e.target.value})} placeholder="http://servidor.com:8080" />`,
        `                      </FormField>`,
        `                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>`,
        `                        <FormField label="UsuÃ¡rio"><input style={inputStyle} value={iptvConfig.xtream_username} onChange={e => setIptvConfig({...iptvConfig,xtream_username:e.target.value})} placeholder="usuario" /></FormField>`,
        `                        <FormField label="Senha"><input style={inputStyle} value={iptvConfig.xtream_password} onChange={e => setIptvConfig({...iptvConfig,xtream_password:e.target.value})} placeholder="senha" /></FormField>`,
        `                      </div>`,
        `                      <div style={{ display:'flex', gap:8, marginTop:4 }}>`,
        `                        <button onClick={saveIptvConfig} disabled={saving} style={{ ...btnPrimary, flex:1, justifyContent:'center', opacity:saving?0.7:1 }}><Save size={15}/> {saving ? 'Salvando...' : 'Salvar IPTV Fixo'}</button>`,
        `                        {iptvConfig.xtream_url && (<button onClick={deleteIptvConfig} style={{ ...btnGhost, color:'#f87171', borderColor:'rgba(239,68,68,0.25)' }}><Trash2 size={15}/></button>)}`,
        `                      </div>`,
        `                    </div>`,
        `                  </div>`,
        `                </div>`,
        `              )`
    ];

    lines.splice(startIndex, endIndex - startIndex + 1, ...newBlockLines);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('âœ… Arquivo corrigido e aprimorado com sucesso!');
} else {
    console.log('â Œ Bloco nÃ£o encontrado.');
}
