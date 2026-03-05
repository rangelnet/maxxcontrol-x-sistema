const https = require('https');
const sodium = require('tweetnacl');
const { decodeBase64, encodeBase64 } = require('tweetnacl-util');

// Configurações
const GITHUB_OWNER = 'rangelnet';
const GITHUB_REPO = 'maxxcontrol-x-sistema';
const SUPABASE_ACCESS_TOKEN = 'sbp_8cbfe9e7c93bc9f9bfdd7d3de06147732eddaef0';
const SUPABASE_PROJECT_REF = 'mmfbirjrhrhobbnzfffe';

// Você precisa fornecer um GitHub Personal Access Token
// Crie em: https://github.com/settings/tokens/new
// Permissões necessárias: repo (full control)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.argv[2];

if (!GITHUB_TOKEN) {
  console.error('❌ Erro: GitHub Token não fornecido!\n');
  console.log('📝 Como usar:');
  console.log('   node configure-github-secrets.js SEU_GITHUB_TOKEN\n');
  console.log('🔑 Ou defina a variável de ambiente:');
  console.log('   set GITHUB_TOKEN=seu_token');
  console.log('   node configure-github-secrets.js\n');
  console.log('📚 Crie um token em: https://github.com/settings/tokens/new');
  console.log('   Permissões necessárias: repo (full control)\n');
  process.exit(1);
}

// Função para fazer requisições HTTPS
function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body ? JSON.parse(body) : {});
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Função para obter a chave pública do repositório
async function getPublicKey() {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/secrets/public-key`,
    method: 'GET',
    headers: {
      'User-Agent': 'Node.js',
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  };
  
  return await httpsRequest(options);
}

// Função para criptografar o secret usando libsodium
function encryptSecret(publicKey, secretValue) {
  // Converter a chave pública de base64 para Uint8Array
  const publicKeyBytes = decodeBase64(publicKey);
  
  // Converter o valor do secret para Uint8Array
  const secretBytes = Buffer.from(secretValue);
  
  // Criptografar usando sealed box (libsodium)
  const encryptedBytes = sodium.box.seal(secretBytes, publicKeyBytes);
  
  // Retornar em base64
  return encodeBase64(encryptedBytes);
}

// Função para criar ou atualizar um secret
async function createOrUpdateSecret(secretName, secretValue, publicKey) {
  const encryptedValue = encryptSecret(publicKey.key, secretValue);
  
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/secrets/${secretName}`,
    method: 'PUT',
    headers: {
      'User-Agent': 'Node.js',
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  };
  
  const data = {
    encrypted_value: encryptedValue,
    key_id: publicKey.key_id
  };
  
  return await httpsRequest(options, data);
}

// Função principal
async function main() {
  console.log('🚀 Configurando secrets do GitHub Actions...\n');
  
  try {
    // 1. Obter chave pública
    console.log('🔑 Obtendo chave pública do repositório...');
    const publicKey = await getPublicKey();
    console.log('   ✅ Chave pública obtida\n');
    
    // 2. Criar secrets
    console.log('📝 Criando secrets...\n');
    
    // Secret 1: SUPABASE_ACCESS_TOKEN
    console.log('   Criando SUPABASE_ACCESS_TOKEN...');
    try {
      await createOrUpdateSecret('SUPABASE_ACCESS_TOKEN', SUPABASE_ACCESS_TOKEN, publicKey);
      console.log('   ✅ SUPABASE_ACCESS_TOKEN criado\n');
    } catch (err) {
      console.error(`   ❌ Erro: ${err.message}\n`);
    }
    
    // Secret 2: SUPABASE_PROJECT_REF
    console.log('   Criando SUPABASE_PROJECT_REF...');
    try {
      await createOrUpdateSecret('SUPABASE_PROJECT_REF', SUPABASE_PROJECT_REF, publicKey);
      console.log('   ✅ SUPABASE_PROJECT_REF criado\n');
    } catch (err) {
      console.error(`   ❌ Erro: ${err.message}\n`);
    }
    
    console.log('🎉 Configuração concluída!\n');
    console.log('📊 Verifique em: https://github.com/rangelnet/maxxcontrol-x-sistema/settings/secrets/actions\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n💡 Dicas:');
    console.error('   - Verifique se o token do GitHub está correto');
    console.error('   - Verifique se o token tem permissão "repo"');
    console.error('   - Verifique se você tem acesso ao repositório\n');
  }
}

// Executar
main();
