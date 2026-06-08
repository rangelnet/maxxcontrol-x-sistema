const fs = require('fs');

const devFile = 'R:/Meu Drive/Painel Maxxcontrol-x-sistema/web/src/pages/Devices.jsx';
let devContent = fs.readFileSync(devFile, 'utf8');

// 1. Add import
if (!devContent.includes('import UploadExcelModal from')) {
    devContent = devContent.replace(
        "import TestApiModal from '../components/TestApiModal'",
        "import TestApiModal from '../components/TestApiModal'\nimport UploadExcelModal from '../components/UploadExcelModal'"
    );
}

// 2. Add state
if (!devContent.includes('const [showUploadExcelModal, setShowUploadExcelModal] = useState(false);')) {
    devContent = devContent.replace(
        "const [showManageModal, setShowManageModal] = useState(false);",
        "const [showManageModal, setShowManageModal] = useState(false);\n  const [showUploadExcelModal, setShowUploadExcelModal] = useState(false);"
    );
}

// 3. Add button
if (!devContent.includes('Importar Excel')) {
    devContent = devContent.replace(
        "<Users size={15} /> + Novo Cliente\n            </button>",
        "<Users size={15} /> + Novo Cliente\n            </button>\n            <button onClick={() => setShowUploadExcelModal(true)} style={{...btnPrimary, background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}>\n              <Package size={15} /> Importar Excel\n            </button>"
    );
}

// 4. Add modal component
if (!devContent.includes('<UploadExcelModal')) {
    devContent = devContent.replace(
        "</div>\n    </>\n  )\n}",
        `  {/* MODAL IMPORT EXCEL */}\n      {showUploadExcelModal && (\n        <UploadExcelModal\n          endpoint="/api/mac/bulk-import"\n          onClose={() => setShowUploadExcelModal(false)}\n          onImportSuccess={() => {\n            loadClients();\n            loadDevices();\n          }}\n          iptvServers={iptvServers}\n          defaultPlans={defaultPlans}\n          dynamicPlans={dynamicPlans}\n        />\n      )}\n\n    </div>\n    </>\n  )\n}`
    );
}

fs.writeFileSync(devFile, devContent, 'utf8');
console.log("Restored UploadExcelModal to Devices.jsx!");
