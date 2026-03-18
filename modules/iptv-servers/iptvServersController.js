const pool = require('../../config/database');

/**
 * Controller para gerenciamento de servidores IPTV
 * CRUD completo de servidores com suporte a status e prioridade
 */

/**
 * GET /api/iptv/servers
 * Lista servidores IPTV ativos (público - para app)
 */
exports.listServers = async (req, res) => {
  try {
    const query = `
      SELECT id, name, url, region, priority 
      FROM servers 
      WHERE status = 'ativo'
      ORDER BY priority ASC
    `;
    
    const result = await pool.query(query);
    
    // Cache de 5 minutos
    res.set('Cache-Control', 'max-age=300');
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Erro ao listar servidores:', error);
    res.status(500).json({ error: 'Erro ao listar servidores' });
  }
};

/**
 * GET /api/iptv/servers/all
 * Lista todos os servidores IPTV (protegido - para painel)
 */
exports.listAllServers = async (req, res) => {
  try {
    const query = `
      SELECT id, name, url, region, priority, status, users, created_at
      FROM servers 
      ORDER BY priority ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Erro ao listar todos os servidores:', error);
    res.status(500).json({ error: 'Erro ao listar servidores' });
  }
};

/**
 * POST /api/iptv/servers
 * Criar novo servidor IPTV
 */
exports.createServer = async (req, res) => {
  try {
    const { name, url, region, priority } = req.body;
    
    // Validação
    if (!name || !url) {
      return res.status(400).json({ error: 'Nome e URL são obrigatórios' });
    }
    
    // Validar formato da URL
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({ error: 'URL inválida' });
    }
    
    const query = `
      INSERT INTO servers (name, url, region, priority, status)
      VALUES ($1, $2, $3, $4, 'ativo')
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, 
      url, 
      region || null, 
      priority || 100
    ]);
    
    console.log(`✅ Servidor criado: ${name}`);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro ao criar servidor:', error);
    
    // Unique violation (URL duplicada)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'URL já cadastrada' });
    }
    
    res.status(500).json({ error: 'Erro ao criar servidor' });
  }
};

/**
 * PUT /api/iptv/servers/:id
 * Atualizar servidor IPTV existente
 */
exports.updateServer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, region, priority, status } = req.body;
    
    // Validação
    if (!name || !url) {
      return res.status(400).json({ error: 'Nome e URL são obrigatórios' });
    }
    
    // Validar formato da URL
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({ error: 'URL inválida' });
    }
    
    // Validar status
    const validStatuses = ['ativo', 'manutenção', 'inativo'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Status inválido. Valores permitidos: ${validStatuses.join(', ')}` 
      });
    }
    
    const query = `
      UPDATE servers 
      SET name = $1, url = $2, region = $3, priority = $4, status = $5
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, 
      url, 
      region || null, 
      priority || 100, 
      status || 'ativo', 
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    
    console.log(`✅ Servidor atualizado: ${name} (ID: ${id})`);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar servidor:', error);
    
    // Unique violation (URL duplicada)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'URL já cadastrada em outro servidor' });
    }
    
    res.status(500).json({ error: 'Erro ao atualizar servidor' });
  }
};

/**
 * DELETE /api/iptv/servers/:id
 * Deletar servidor IPTV
 */
exports.deleteServer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se há dispositivos usando este servidor
    const devicesQuery = 'SELECT COUNT(*) as count FROM devices WHERE server LIKE $1';
    const serverQuery = 'SELECT url FROM servers WHERE id = $1';
    
    const serverResult = await pool.query(serverQuery, [id]);
    
    if (serverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    
    const serverUrl = serverResult.rows[0].url;
    const devicesResult = await pool.query(devicesQuery, [`%${serverUrl}%`]);
    const devicesCount = parseInt(devicesResult.rows[0].count);
    
    if (devicesCount > 0) {
      return res.status(400).json({ 
        error: `Não é possível deletar. ${devicesCount} dispositivo(s) estão usando este servidor` 
      });
    }
    
    // Deletar servidor
    const deleteQuery = 'DELETE FROM servers WHERE id = $1 RETURNING name';
    const deleteResult = await pool.query(deleteQuery, [id]);
    
    console.log(`✅ Servidor deletado: ${deleteResult.rows[0].name} (ID: ${id})`);
    res.json({ success: true, message: 'Servidor deletado com sucesso' });
    
  } catch (error) {
    console.error('❌ Erro ao deletar servidor:', error);
    res.status(500).json({ error: 'Erro ao deletar servidor' });
  }
};

/**
 * POST /api/iptv/servers/:id/maintenance
 * Colocar servidor em manutenção
 */
exports.setMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE servers 
      SET status = 'manutenção'
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    
    console.log(`🔧 Servidor em manutenção: ${result.rows[0].name} (ID: ${id})`);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro ao colocar servidor em manutenção:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do servidor' });
  }
};

/**
 * POST /api/iptv/servers/:id/activate
 * Ativar servidor
 */
exports.activateServer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE servers 
      SET status = 'ativo'
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    
    console.log(`✅ Servidor ativado: ${result.rows[0].name} (ID: ${id})`);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro ao ativar servidor:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do servidor' });
  }
};

/**
 * GET /api/iptv/servers/:id/users
 * Obter contagem de usuários de um servidor
 */
exports.getServerUsers = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar URL do servidor
    const serverQuery = 'SELECT url, name FROM servers WHERE id = $1';
    const serverResult = await pool.query(serverQuery, [id]);
    
    if (serverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    
    const { url, name } = serverResult.rows[0];
    
    // Contar dispositivos usando este servidor
    const countQuery = 'SELECT COUNT(*) as count FROM devices WHERE server LIKE $1';
    const countResult = await pool.query(countQuery, [`%${url}%`]);
    const count = parseInt(countResult.rows[0].count);
    
    // Atualizar contagem na tabela servers
    const updateQuery = 'UPDATE servers SET users = $1 WHERE id = $2';
    await pool.query(updateQuery, [count, id]);
    
    res.json({ 
      server_id: id,
      server_name: name,
      users: count 
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter usuários do servidor:', error);
    res.status(500).json({ error: 'Erro ao obter contagem de usuários' });
  }
};

// exports já está configurado corretamente via exports.xxx = ...
