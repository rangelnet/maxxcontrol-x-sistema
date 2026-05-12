import fs from 'fs';

const filePath = 'R:\\Users\\Usuario\\Meu Drive\\Painel Maxxcontrol-x-sistema\\web\\src\\pages\\Devices.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Buscamos o inÃ­cio do bloco da aba 'device'
const startMarker = "{manageTab === 'device' && selectedDevice && (";
const endMarker = ")}";

const lines = content.split('\n');
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startMarker)) {
        startIndex = i;
        // Procuramos o prÃ³ximo ')}' que fecha o bloco
        for (let j = i + 1; j < lines.length; j++) {
            // Verificamos se a linha contÃ©m apenas ')}' ou '             )}'
            if (lines[j].trim() === endMarker) {
                endIndex = j;
                break;
            }
        }
        if (startIndex !== -1 && endIndex !== -1) break;
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    console.log(`âœ… Bloco encontrado entre as linhas ${startIndex + 1} e ${endIndex + 1}`);
    
    const newBlockLines = [
        `             {manageTab === 'device' && selectedDevice && (`,
        `               <div style={{ display:'flex', flexDirection:'column', gap:14 }}>`,
        `                 <DeviceInfo device={selectedDevice} />`,
        `                 `,
        `                 <div style={{ background:'rgba(5,5,5,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:16 }}>`,
        `                   <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>`,
        `                      <Zap size={18} color="#FFA500" />`,
        `                      <h3 style={{ margin:0, fontSize:14, color:'#fff', fontWeight:700 }}>ConfiguraÃ§Ã£o de Teste GrÃ¡tis</h3>`,
        `                   </div>`,
        `                   `,
        `                   <div style={{ display:'flex', flexDirection:'column', gap:12 }}>`,
        `                     <FormField label="Links de Teste GrÃ¡tis (MÃºltiplos / Um por linha)">`,
        `                       <textarea `,
        `                         style={{ ...inputStyle, minHeight:100, resize:'vertical', fontFamily:'monospace', fontSize:11, background:'rgba(0,0,0,0.3)' }} `,
        `                         value={selectedDevice.test_api_urls || ''} `,
        `                         onChange={e => setSelectedDevice({...selectedDevice, test_api_urls: e.target.value})}`,
        `                         placeholder="http://servidor1.com:8080&#10;http://servidor2.com:8080"`,
        `                       />`,
        `                     </FormField>`,
        `                     `,
        `                     <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>`,
        `                       <FormField label="Tempo de Teste (Horas)">`,
        `                         <input `,
        `                           type="number" `,
        `                           style={inputStyle} `,
        `                           value={selectedDevice.test_duration || 2} `,
        `                           onChange={e => setSelectedDevice({...selectedDevice, test_duration: e.target.value})}`,
        `                           placeholder="Ex: 2"`,
        `                         />`,
        `                       </FormField>`,
        `                       <FormField label="Bloquear Testes">`,
        `                         <select `,
        `                           style={selectStyle} `,
        `                           value={selectedDevice.test_blocked || '0'} `,
        `                           onChange={e => setSelectedDevice({...selectedDevice, test_blocked: e.target.value})}`,
        `                         >`,
        `                           <option value="0" style={{background:'#111',color:'#fff'}}>Liberado</option>`,
        `                           <option value="1" style={{background:'#111',color:'#fff'}}>Bloqueado</option>`,
        `                         </select>`,
        `                       </FormField>`,
        `                     </div>`,
        `                     `,
        `                     <div style={{ marginTop:10 }}>`,
        `                       <button `,
        `                         onClick={() => {`,
        `                           api.post(\`/api/devices/\${selectedDevice.id}/test-config\`, {`,
        `                             test_api_urls: selectedDevice.test_api_urls,`,
        `                             test_duration: selectedDevice.test_duration,`,
        `                             test_blocked: selectedDevice.test_blocked`,
        `                           }).then(() => {`,
        `                             toast.success('ConfiguraÃ§Ã£o de teste atualizada!');`,
        `                           });`,
        `                         }} `,
        `                         style={{ ...btnPrimary, width:'100%', justifyContent:'center' }}`,
        `                       >`,
        `                         <Save size={15}/> Atualizar ConfiguraÃ§Ã£o de Teste`,
        `                       </button>`,
        `                     </div>`,
        `                   </div>`,
        `                 </div>`,
        `               </div>`,
        `             )`
    ];

    lines.splice(startIndex, endIndex - startIndex + 1, ...newBlockLines);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('âœ… Arquivo atualizado com sucesso!');
} else {
    console.log('â Œ NÃ£o foi possÃ­vel encontrar o bloco de cÃ³digo.');
}
