# Controle de Saídas

Sistema de registro e controle de saídas para o **Complexo Penal de Marília** — Núcleo de Infraestrutura e Logística.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** (estilização)
- **Drizzle ORM** + **PostgreSQL** (Neon)
- **Vercel** (hospedagem serverless)
- **XLSX** para importação/exportação de planilhas
- **Sessões httpOnly** (7 dias) sem necessidade de cadastro de senhas

---

## 🚀 Deploy em 7 passos (Vercel + Neon)

### 1. Criar conta/banco no Neon
1. Acesse <https://console.neon.tech/> e crie uma conta (gratuita).
2. Clique em **"New Project"**:
   - Nome: `controle-saidas`
   - Região: **São Paulo** (sa-east-1) — menor latência com a Vercel em GRU.
   - Postgres versão: 16+
3. Ao finalizar, copie a **Connection string** (uma URL que começa com `postgresql://neon.tech/...`).

### 2. Criar as tabelas no banco
1. No painel do Neon, menu lateral → **SQL Editor**.
2. Abra o arquivo [`db/setup.sql`](./db/setup.sql) deste repositório, **copie todo o conteúdo**, cole no SQL Editor e clique em **Run**.
3. Você deve ver as 3 tabelas criadas: `usuarios`, `sessoes`, `saidas`.

### 3. Fazer deploy na Vercel
1. Acesse <https://vercel.com/new> (se não tiver conta, cadastre-se — é gratuita para projetos pessoais).
2. **Import** o repositório do GitHub (push este código para seu repositório GitHub primeiro).
3. Na tela **Configure Project**, expanda **Environment Variables** e adicione:
   | Chave | Valor | Ambiente(s) |
   |---|---|---|
   | `DATABASE_URL` | a Connection string completa copiada do Neon (passo 1) | Production, Preview, Development |
   | `DATABASE_SSL` | `true` | Production, Preview |
4. Clique em **Deploy**.

> A Vercel detecta automaticamente o Next.js (`vercel.json` já está configurado). O build roda em ~1 minuto.

### 4. Testar
Acesse a URL fornecida pela Vercel (algo como `controle-saidas.vercel.app`). Você verá a tela de login.

- **Operadores**: informam **Nome + RS (matrícula)** → tem acesso apenas às saídas que eles mesmos cadastraram.
- **Administradores**: entram com usuário `admin1` ou `admin2` e senha **`2026`** (definidas em `src/lib/sessao.ts`). Veem todas as saídas e podem gerenciar veículo/motorista.

### 5. Alterar a senha dos administradores (recomendado!)
Edite o arquivo [`src/lib/sessao.ts`](./src/lib/sessao.ts) e altere os valores de `ADMIN_INICIAL_1` e `ADMIN_INICIAL_2`. Faça commit e push — a Vercel redeploya automaticamente.

### 6. Alterar nome da unidade (se necessário)
Edite [`src/lib/unidade.ts`](./src/lib/unidade.ts) e ajuste `NOME_UNIDADE` e `SETOR_RESPONSAVEL`.

### 7. Configurar domínio personalizado (opcional)
No painel do projeto na Vercel: **Settings → Domains** e siga as instruções.

---

## 🧪 Rodando localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar .env a partir do exemplo
cp .env.example .env
# Edite o .env com uma URL de Postgres local ou do Neon

# 3. Rodar servidor de desenvolvimento
npm run dev
# Acesse http://localhost:3000
```

Scripts disponíveis:
- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — servir build de produção
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript (sem emitir arquivos)
- `npx drizzle-kit push` — sincronizar schema com o banco (cuidado!)

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── api/            # Rotas serverless (auth, saidas, health)
│   │   ├── auth/       # entrar, eu, sair
│   │   └── saidas/     # CRUD + importar planilha
│   ├── login/          # Tela de login
│   ├── globals.css     # Tailwind + tema
│   ├── layout.tsx      # Root layout (fontes, metadados)
│   └── page.tsx        # Home (redireciona p/ login ou dashboard)
├── components/         # Componentes React
│   ├── Dashboard.tsx
│   ├── SaidaModal.tsx
│   ├── Sidebar.tsx
│   ├── LoginForm.tsx
│   ├── ImportarPlanilha.tsx
│   ├── RelatorioDiario.tsx
│   └── ...
├── db/
│   ├── index.ts        # Pool + cliente Drizzle (com SSL automático p/ Neon)
│   └── schema.ts       # Tabelas (usuarios, sessoes, saidas)
└── lib/
    ├── sessao.ts       # Autenticação (cookies httpOnly, admin/operador)
    ├── apiAuth.ts      # Helper de autenticação das rotas
    ├── constantes.ts   # Validações + tipos/locais/motivos pré-definidos
    ├── format.ts       # Formatação de datas/horas
    ├── planilha.ts     # Importação/exportação XLSX
    └── unidade.ts      # Nome da unidade/setor (edite aqui!)
db/
└── setup.sql           # Script SQL para criar tabelas no Neon
public/
└── brasao.png          # Brasão da Polícia Penal do Estado de SP
```

---

## 🔐 Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | **(obrigatória)** String de conexão Postgres | `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `DATABASE_SSL` | Força SSL (`true`/`false`). Se não informado, detecta automaticamente (Neon, Supabase, etc.) | `true` |

---

## 📝 Notas importantes

- **Login de operadores**: sem senha — apenas nome + RS. Cada operador só vê/exclui as saídas cadastradas por ele mesmo (identificadas pelo par `nome + rs` da sessão).
- **Administradores**: 2 contas hardcoded (`admin1`/`admin2`) — altere as senhas antes do uso em produção.
- **Sessões**: duram 7 dias. Token aleatório de 32 bytes, armazenado como hash SHA-256 no banco.
- **Brasão**: `/public/brasao.png` é o brasão da Polícia Penal/SP usado como marca d'água e ícone.
- **SSL Neon**: detectado automaticamente; não precisa configurar certificados.

---

## 🆘 Problemas comuns

| Problema | Solução |
|---|---|
| "`DATABASE_URL is required`" na Vercel | Adicione a env var `DATABASE_URL` no painel da Vercel (Settings → Environment Variables). |
| "`connect ECONNREFUSED`" ou "`no pg_hba.conf entry`" | Falta SSL. Adicione `DATABASE_SSL=true` ou certifique-se de usar a URL *com* `sslmode=require` do Neon. |
| Build demora ou falha em fontes | O `next/font/google` baixa fontes no build; em ambientes sem internet o build falha. Na Vercel isso funciona normalmente. |
| Login admin não funciona | Verifique `src/lib/sessao.ts` — o login padrão é `admin1`/`2026` e `admin2`/`2026`. |
