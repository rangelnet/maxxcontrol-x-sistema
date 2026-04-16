-- ============================================
-- DESCOBRIR OU CRIAR LOGIN E SENHA
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. VER SE JÁ TEM USUÁRIOS
SELECT 
  id,
  nome,
  email AS login,
  plano,
  status,
  criado_em
FROM users
ORDER BY criado_em DESC;

-- ============================================
-- SE APARECER ALGUM USUÁRIO ACIMA:
-- - O campo "email" é o LOGIN
-- - A senha você precisa lembrar (não dá pra ver)
-- - Se esqueceu a senha, execute o PASSO 3 abaixo
-- ============================================

-- ============================================
-- SE NÃO APARECER NENHUM USUÁRIO:
-- Execute o PASSO 2 abaixo para criar
-- ============================================


-- ============================================
-- PASSO 2: CRIAR USUÁRIO ADMIN (se não tiver)
-- ============================================

-- Criar extensão para hash de senha
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar usuário admin
INSERT INTO users (nome, email, senha_hash, plano, status)
VALUES (
  'Administrador',
  'admin@tvmaxx.com',
  crypt('admin123', gen_salt('bf', 10)),
  'premium',
  'ativo'
)
ON CONFLICT (email) DO NOTHING;

-- Ver usuário criado
SELECT 
  id,
  nome,
  email AS login,
  'admin123' AS senha,
  plano,
  status
FROM users
WHERE email = 'admin@tvmaxx.com';

-- ============================================
-- CREDENCIAIS CRIADAS:
-- Login: admin@tvmaxx.com
-- Senha: admin123
-- ============================================


-- ============================================
-- PASSO 3: RESETAR SENHA (se esqueceu)
-- ============================================

-- Trocar senha de qualquer usuário para "admin123"
-- Substitua 'admin@tvmaxx.com' pelo email do usuário

UPDATE users 
SET senha_hash = crypt('admin123', gen_salt('bf', 10))
WHERE email = 'admin@tvmaxx.com';

-- Ver resultado
SELECT 
  email AS login,
  'admin123' AS nova_senha
FROM users
WHERE email = 'admin@tvmaxx.com';

-- ============================================
-- PRONTO! Use estas credenciais:
-- https://maxxcontrol-frontend.onrender.com/login
-- ============================================
