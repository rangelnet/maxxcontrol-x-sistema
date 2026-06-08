const fs = require('fs');

const devFile = 'R:/Meu Drive/Painel Maxxcontrol-x-sistema/web/src/pages/Devices.jsx';
let content = fs.readFileSync(devFile, 'utf8');

// 1. Injetar a importação se não existir
if (!content.includes('import UploadExcelModal from')) {
    content = content.replace(
        "import TestApiModal from '../components/TestApiModal'",
        "import TestApiModal from '../components/TestApiModal'\nimport UploadExcelModal from '../components/UploadExcelModal'"
    );
}

// 2. Injetar o state do modal
if (!content.includes('const [showUploadExcelModal, setShowUploadExcelModal] = useState(false);')) {
    content = content.replace(
        "const [showManageModal, setShowManageModal] = useState(false);",
        "const [showManageModal, setShowManageModal] = useState(false);\n  const [showUploadExcelModal, setShowUploadExcelModal] = useState(false);"
    );
}

// 3. Injetar o botão (usando regex para flexibilidade com espaços em branco)
if (!content.includes('Importar Excel')) {
    const btnNovoClienteRegex = /<button onClick=\{\(\) => setShowNewClientModal\(true\)\} style=\{btnPrimary\}>\s*<Users size=\{15\} \/> \+ Novo Cliente\s*<\/button>/;
    
    const novoBotao = `<button onClick={() => setShowNewClientModal(true)} style={btnPrimary}>
            <Users size={15} /> + Novo Cliente
          </button>
          <button onClick={() => setShowUploadExcelModal(true)} style={{...btnPrimary, background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}>
            <Package size={15} /> Importar Excel
          </button>`;
          
    content = content.replace(btnNovoClienteRegex, novoBotao);
}

// 4. Injetar a renderização do modal
if (!content.includes('<UploadExcelModal')) {
    const renderModalTarget = /\{showTestApiModal && \(\s*<TestApiModal device=\{selectedDevice\} onClose=\{\(\) => setShowTestApiModal\(false\)\} onSave=\{\(\) => loadDevices\(true\)\} \/>\s*\)\}/;
    
    const novoModalStr = `{showTestApiModal && (
        <TestApiModal device={selectedDevice} onClose={() => setShowTestApiModal(false)} onSave={() => loadDevices(true)} />
      )}

      {/* MODAL IMPORT EXCEL */}
      {showUploadExcelModal && (
        <UploadExcelModal
          endpoint="/api/mac/bulk-import"
          onClose={() => setShowUploadExcelModal(false)}
          onImportSuccess={() => {
            loadClients();
            loadDevices();
          }}
          iptvServers={iptvServers}
          defaultPlans={defaultPlans}
          dynamicPlans={dynamicPlans}
        />
      )}`;
      
    content = content.replace(renderModalTarget, novoModalStr);
}

fs.writeFileSync(devFile, content, 'utf8');
console.log("Script concluído");
