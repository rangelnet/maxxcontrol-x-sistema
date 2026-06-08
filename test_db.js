const pool = require('./config/database');
pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='qpanel_accounts'`)
  .then(r => { 
    console.log(r.rows.map(c=>c.column_name)); 
    process.exit(0); 
  })
  .catch(e => { 
    console.error(e); 
    process.exit(1); 
  });
