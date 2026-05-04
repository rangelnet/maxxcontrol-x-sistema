const pool = require('./config/database');

const insertPackages = async () => {
  const packages = [
      { name: 'PACOTE TESTE', credits: 1, price: 1.00, promo_price: 0.50 },
      { name: 'Pacote 10 Créditos', credits: 10, price: 100 },
      { name: 'Pacote 30 Créditos', credits: 30, price: 240 },
      { name: 'Pacote 50 Créditos', credits: 50, price: 350 },
      { name: 'Pacote 100 Créditos', credits: 100, price: 650 },
      { name: 'Pacote 500 Créditos', credits: 500, price: 3000 },
      { name: 'Pacote 1000 Créditos', credits: 1000, price: 5000 },
  ];
  
  try {
      await pool.query('DELETE FROM credit_packages');
      
      for(let pkg of packages) {
          await pool.query('INSERT INTO credit_packages (name, credit_amount, price, promo_price) VALUES ($1, $2, $3, $4)', 
          [pkg.name, pkg.credits, pkg.price, pkg.promo_price || null]);
      }
      console.log('Inserted packages successfully!');
  } catch (err) {
      console.error(err);
  } finally {
      process.exit(0);
  }
}
insertPackages();
