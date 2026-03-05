-- Adicionar dispositivo com MAC 3C:E5:B4:18:FB:1C

INSERT INTO devices (
  mac_address,
  modelo,
  android_version,
  app_version,
  ip,
  status,
  connection_status,
  ultimo_acesso
) VALUES (
  '3C:E5:B4:18:FB:1C',
  'TV Box',
  '11',
  '1.0.0',
  '192.168.1.100',
  'ativo',
  'offline',
  NOW()
)
ON CONFLICT (mac_address) 
DO UPDATE SET
  ultimo_acesso = NOW(),
  status = 'ativo';

-- Verificar se foi inserido
SELECT * FROM devices WHERE mac_address = '3C:E5:B4:18:FB:1C';
