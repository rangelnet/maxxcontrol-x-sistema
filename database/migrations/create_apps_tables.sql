-- Tabela para armazenar apps instalados em cada dispositivo
CREATE TABLE IF NOT EXISTS device_apps (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  package_name VARCHAR(255) NOT NULL,
  app_name VARCHAR(255) NOT NULL,
  version_code INTEGER,
  version_name VARCHAR(50),
  is_system BOOLEAN DEFAULT false,
  installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(device_id, package_name)
);

-- Tabela para armazenar comandos a executar nos dispositivos
CREATE TABLE IF NOT EXISTS device_commands (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  command_type VARCHAR(50) NOT NULL, -- 'install_app', 'uninstall_app', 'reboot', etc
  command_data JSONB,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'executing', 'completed', 'failed'
  result TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX idx_device_status (device_id, status)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_device_apps_device_id ON device_apps(device_id);
CREATE INDEX IF NOT EXISTS idx_device_apps_package ON device_apps(package_name);
CREATE INDEX IF NOT EXISTS idx_device_commands_device_id ON device_commands(device_id);
CREATE INDEX IF NOT EXISTS idx_device_commands_status ON device_commands(status);
