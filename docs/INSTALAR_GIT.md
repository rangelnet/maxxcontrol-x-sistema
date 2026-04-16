# 📦 Instalar Git no Windows

## Opção 1: Download Direto (RECOMENDADO)

1. Acesse: https://git-scm.com/download/win
2. Download automático começará
3. Execute o instalador
4. Clique "Next" em tudo (configuração padrão)
5. Reinicie o terminal

## Opção 2: Via Winget (Windows 11)

```powershell
winget install --id Git.Git -e --source winget
```

## Opção 3: Via Chocolatey

```powershell
choco install git
```

---

## ✅ Verificar Instalação

Após instalar, abra um NOVO terminal e execute:

```bash
git --version
```

Deve mostrar algo como: `git version 2.43.0`

---

## 🚀 Depois de Instalar

Siga o arquivo `PUSH_GITHUB.md` para fazer o push!
