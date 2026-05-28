const pool = require('./config/database');
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
  .then(r => console.log(r.rows.map(c => c.column_name).join(', ')))
  .catch(console.error)
  .finally(() => pool.end());
