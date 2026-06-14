const pool = require('./config/database');
(async () => {
  try {
    await pool.query('ALTER TABLE bugs ALTER COLUMN user_id DROP NOT NULL');
    console.log('✅ bugs user_id altered');
  } catch (e) {
    console.log('bugs user_id not altered:', e.message);
  }
  try {
    await pool.query('ALTER TABLE logs ALTER COLUMN user_id DROP NOT NULL');
    console.log('✅ logs user_id altered');
  } catch (e) {
    console.log('logs user_id not altered:', e.message);
  }
  process.exit(0);
})();
