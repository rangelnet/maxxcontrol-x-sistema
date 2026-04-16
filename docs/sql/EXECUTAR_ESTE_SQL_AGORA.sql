-- Cole e execute no Supabase SQL Editor
-- https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/editor

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
  'Android TV Box',
  '11.0',
  '1.0.0',
  '192.168.1.100',
  'ativo',
  'offline',
  CURRENT_TIMESTAMP
)
ON CONFLICT (mac_address) DO UPDATE
SET ultimo_acesso = CURRENT_TIMESTAMP;

SELECT * FROM devices;
