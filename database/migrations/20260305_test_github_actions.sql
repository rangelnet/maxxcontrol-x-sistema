-- Migração de teste para GitHub Actions
-- Esta migração será aplicada automaticamente quando você fizer push

-- Criar uma tabela de teste (se não existir)
CREATE TABLE IF NOT EXISTS github_actions_test (
    id SERIAL PRIMARY KEY,
    test_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir um registro de teste
INSERT INTO github_actions_test (test_message) 
VALUES ('GitHub Actions funcionando! Deploy automático ativado em ' || NOW());

-- Comentário: Esta migração confirma que o GitHub Actions está aplicando migrações automaticamente
