const pool = require('./config/database');

const insertPackages = async () => {
  const packages = [
      { name: 'Pacote 10 Créditos', credits: 10, price: 100 },
      { name: 'Pacote 30 Créditos', credits: 30, price: 240 },
      { name: 'Pacote 50 Créditos', credits: 50, price: 350 },
      { name: 'Pacote 100 Créditos', credits: 100, price: 650 },
      { name: 'Pacote 500 Créditos', credits: 500, price: 3000 },
      { name: 'Pacote 1000 Créditos', credits: 1000, price: 5000 },
  ];
  
  try {
      const { rows } = await pool.query('SELECT COUNT(*) FROM credit_packages');
      if (parseInt(rows[0].count) === 0) {
          for(let pkg of packages) {
              await pool.query('INSERT INTO credit_packages (name, credit_amount, price) VALUES ($1, $2, $3)', [pkg.name, pkg.credits, pkg.price]);
          }
          console.log('Inserted packages successfully!');
      } else {
          console.log('Packages already exist.');
      }
  } catch (err) {
      console.error(err);
  } finally {
      process.exit(0);
  }
}
insertPackages();
