-- ============================================
-- VERIFICAR USUÁRIO NO SUPABASE
-- ============================================
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/editor

-- 1. Verificar se o usuário existe
SELECT 
  id, 
  nome, 
  email, 
  plano, 
  status, 
  criado_em,
  LENGTH(senha_hash) as tamanho_hash
FROM users 
WHERE email = 'admin@tvmaxx.com';

-- 2. Testar se a senha está correta
SELECT 
  email,
  senha_hash = crypt('admin123', senha_hash) as senha_correta
FROM users 
WHERE email = 'admin@tvmaxx.com';

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Consulta 1: Deve retornar 1 linha com os dados do usuário
-- Consulta 2: Deve retornar senha_correta = true

-- ============================================
-- SE NÃO RETORNAR NADA:
-- ============================================
-- Execute este SQL para criar o usuário:

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (nome, email, senha_hash, plano, status)
VALUES (
  'Administrador',
  'admin@tvmaxx.com',
  crypt('admin123', gen_salt('bf', 10)),
  'premium',
  'ativo'
)
ON CONFLICT (email) DO UPDATE 
SET senha_hash = crypt('admin123', gen_salt('bf', 10));

-- Verificar novamente
SELECT id, nome, email, plano, status FROM users WHERE email = 'admin@tvmaxx.com';
