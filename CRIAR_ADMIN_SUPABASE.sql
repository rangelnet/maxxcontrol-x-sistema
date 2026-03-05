-- ============================================
-- CRIAR USUÁRIO ADMIN - EXECUTE NO SUPABASE
-- ============================================
-- https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/editor

-- IMPORTANTE: Execute este SQL primeiro para criar a extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar usuário admin com senha hasheada usando crypt()
INSERT INTO users (nome, email, senha_hash, plano, status)
VALUES (
  'Administrador',
  'admin@maxxcontrol.com',
  crypt('Admin@123', gen_salt('bf', 10)),
  'premium',
  'ativo'
)
ON CONFLICT (email) DO NOTHING;

-- Verificar usuário criado
SELECT id, nome, email, plano, status, criado_em 
FROM users 
WHERE email = 'admin@maxxcontrol.com';

-- Testar se a senha está correta
SELECT 
  email, 
  senha_hash = crypt('Admin@123', senha_hash) as senha_correta 
FROM users 
WHERE email = 'admin@maxxcontrol.com';

-- ============================================
-- CREDENCIAIS DE LOGIN:
-- Email: admin@maxxcontrol.com
-- Senha: Admin@123
-- ============================================

-- ============================================
-- PRONTO! Agora faça login:
-- https://maxxcontrol-x-sistema.onrender.com
-- Email: admin@maxxcontrol.com
-- Senha: Admin@123
-- ============================================
