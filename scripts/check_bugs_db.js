const pool = require('../config/database');

async function checkLatestBugs() {
  try {
    const res = await pool.query('SELECT * FROM bugs ORDER BY data DESC LIMIT 3');
    console.log("Últimos 3 bugs:");
    res.rows.forEach((b, i) => {
      console.log(`\n--- Bug ${i + 1} ---`);
      console.log(`ID: ${b.id}`);
      console.log(`Severity: ${b.severity}`);
      console.log(`Type: ${b.type}`);
      console.log(`Data: ${b.data}`);
      
      let ctx = b.context;
      if (typeof ctx === 'string') {
        try { ctx = JSON.parse(ctx); } catch (e) { }
      }
      
      console.log("Context keys:", ctx ? Object.keys(ctx) : null);
      if (ctx && (ctx.screenshot || ctx.screenshotBase64)) {
        console.log("✅ Possui screenshot gravado!");
        const str = ctx.screenshot || ctx.screenshotBase64;
        console.log("Tamanho do screenshot:", str.length, "bytes");
      } else {
        console.log("❌ NÃO possui screenshot gravado no banco.");
      }
      
      if (ctx && ctx.logcat) {
         console.log("✅ Possui logcat gravado!");
      } else {
         console.log("❌ NÃO possui logcat gravado no banco.");
      }
    });
  } catch (e) {
    console.error(e);
  }
}

checkLatestBugs();
