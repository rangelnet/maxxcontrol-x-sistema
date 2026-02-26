# 🔐 Credenciais de Acesso - MaxxControl X

## Usuário Administrador

```
📧 Email: admin@maxxcontrol.com
🔑 Senha: Admin@123
```

## Como usar:

1. Certifique-se de que o banco de dados PostgreSQL está rodando
2. Configure o arquivo `.env` com as credenciais do banco
3. Execute o schema do banco:
   ```bash
   psql -U postgres -d maxxcontrol_x -f database/schema.sql
   ```
4. Crie o usuário de teste:
   ```bash
   node database/seed.js
   ```
5. Inicie o servidor backend:
   ```bash
   npm start
   ```
6. Acesse o painel web em: `http://localhost:5173`
7. Faça login com as credenciais acima

## Alterar Senha

Para alterar a senha, você pode:
- Editar o arquivo `database/seed.js` e executar novamente
- Ou criar um novo usuário via API POST `/api/auth/register`

## Segurança

⚠️ **IMPORTANTE:** Estas são credenciais de desenvolvimento. 
Em produção, use senhas fortes e únicas!
