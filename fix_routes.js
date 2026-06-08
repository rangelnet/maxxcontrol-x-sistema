const fs = require('fs');

// 1. Update macController.js
const macFile = 'R:/Meu Drive/Painel Maxxcontrol-x-sistema/modules/mac/macController.js';
let macContent = fs.readFileSync(macFile, 'utf8');

const controllerFunction = `

// Bulk Import para Dispositivos
exports.bulkImport = async (req, res) => {
  try {
    const { clients } = req.body;
    if (!clients || clients.length === 0) return res.status(400).json({ error: 'Nenhum dispositivo' });
    const pool = require('../../config/database');
    const client = await pool.connect();
    const userId = req.user.id;
    try {
      await client.query('BEGIN');
      for (const c of clients) {
        if (!c.mac) continue;
        const existing = await client.query('SELECT id FROM devices WHERE mac_address = $1', [c.mac]);
        if (existing.rows.length === 0) {
          await client.query(
            'INSERT INTO devices (user_id, mac_address, app_version, status, connection_status, server, username, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [userId, c.mac, c.app_version || '', 'ativo', 'offline', c.server || '', c.username || '', c.password || '']
          );
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.json({ success: true, imported: clients.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
`;

if (!macContent.includes('exports.bulkImport')) {
    fs.appendFileSync(macFile, controllerFunction, 'utf8');
}

// 2. Update macRoutes.js
const routeFile = 'R:/Meu Drive/Painel Maxxcontrol-x-sistema/modules/mac/macRoutes.js';
let routeContent = fs.readFileSync(routeFile, 'utf8');

const routeStr = `
// Rota para Bulk Import de Devices
router.post('/bulk-import', authMiddleware, macController.bulkImport);

module.exports = router;`;

if (!routeContent.includes('/bulk-import')) {
    routeContent = routeContent.replace('module.exports = router;', routeStr);
    fs.writeFileSync(routeFile, routeContent, 'utf8');
}

console.log("Routes fixed!");
