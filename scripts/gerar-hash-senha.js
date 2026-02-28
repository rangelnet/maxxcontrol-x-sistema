const bcrypt = require('bcrypt');

const senha = process.argv[2] || 'admin123';

bcrypt.hash(senha, 10).then(hash => {
  console.log('\n✅ HASH GERADO COM SUCESSO!\n');
  console.log('Senha:', senha);
  console.log('Hash:', hash);
  console.log('\nCopie o hash acima e use no SQL do Supabase.\n');
}).catch(err => {
  console.error('Erro ao gerar hash:', err);
});
