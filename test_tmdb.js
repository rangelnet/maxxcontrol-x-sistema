const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.mmfbirjrhrhobbnzfffe:Maxx%40146390@aws-1-us-east-1.pooler.supabase.com:5432/postgres' });
pool.query("SELECT id, titulo, poster_path, backdrop_path FROM conteudos LIMIT 10")
  .then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
