const pool = require('../config/database');

async function seed() {
  try {
    console.log('🐘 Conectando ao banco para inserir planos...');
    
    // Limpa pacotes antigos
    await pool.query('DELETE FROM app_activation_packages');
    
    // Insere os novos planos baseados na imagem
    const plans = [
      { name: 'Pacote de ativação por 1 ano', price: 27.90, duration: 365 },
      { name: 'Pacote de ativação para a vida toda', price: 70.00, duration: 99999 }
    ];

    for (const plan of plans) {
      await pool.query(
        'INSERT INTO app_activation_packages (name, price, duration_days, is_active) VALUES ($1, $2, $3, $4)',
        [plan.name, plan.price, plan.duration, true]
      );
      console.log(`✅ Plano inserido: ${plan.name}`);
    }

    console.log('🚀 Todos os planos foram configurados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inserir planos:', error);
    process.exit(1);
  }
}

seed();
