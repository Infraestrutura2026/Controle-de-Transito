-- ============================================================================
-- CONTROLE DE SAÍDAS — Complexo Penal de Marília
-- Script de criação do banco de dados para o Supabase
--
-- COMO USAR:
-- 1. Crie o projeto no Supabase (supabase.com → New project);
-- 2. No painel, abra: SQL Editor → New query;
-- 3. Cole todo o conteúdo deste arquivo e clique em Run;
-- 4. Pronto: as tabelas estarão criadas e o app pode conectar.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tabela mantida apenas para preservar a integridade referencial do histórico
-- de saídas. O sistema não cria nem gerencia contas de usuários — o cadastro
-- é feito apenas com Nome + RS (matrícula) na tela inicial.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id         SERIAL PRIMARY KEY,
  nome       TEXT NOT NULL,
  usuario    TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  perfil     TEXT NOT NULL DEFAULT 'operador', -- admin | operador
  ativo      BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em  TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Sessões simplificadas: cada (nome, rs) gera um token httpOnly com 7 dias de
-- validade, sem necessidade de criar conta. O login é só informar nome + RS.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessoes (
  id         SERIAL PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  nome       TEXT NOT NULL,
  rs         TEXT NOT NULL,
  expira_em  TIMESTAMP NOT NULL,
  criado_em  TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Registro de saídas: data, hora, local, matrícula, nome, motivo, regime e
-- o par (criado_por_nome, criado_por_rs) que identifica quem fez o cadastro.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saidas (
  id             SERIAL PRIMARY KEY,
  data           TEXT NOT NULL,           -- YYYY-MM-DD
  hora           TEXT NOT NULL,           -- HH:mm
  local          TEXT NOT NULL,           -- hospital / unidade de destino
  matricula      TEXT NOT NULL,           -- matrícula do servidor que vai sair
  nome           TEXT NOT NULL,
  motivo         TEXT NOT NULL DEFAULT '',-- procedimento / motivo
  regime         TEXT NOT NULL DEFAULT 'FE', -- SA | FE | CR
  veiculo        TEXT NOT NULL DEFAULT '', -- veículo do serviço (admin)
  motorista      TEXT NOT NULL DEFAULT '', -- motorista do serviço (admin)
  nao_realizada  BOOLEAN NOT NULL DEFAULT FALSE,
  justificativa  TEXT NOT NULL DEFAULT '', -- motivo da não realização (máx. 50)
  criado_por_nome TEXT NOT NULL DEFAULT 'Sistema',
  criado_por_rs  TEXT NOT NULL DEFAULT '',
  criado_por_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em      TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Índices para as consultas mais usadas pelo app
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_saidas_data       ON saidas (data);
CREATE INDEX IF NOT EXISTS idx_saidas_criado_por ON saidas (criado_por_nome, criado_por_rs);

-- ---------------------------------------------------------------------------
-- NOTA: o app conecta diretamente usando a senha do banco (usuário "postgres"
-- do Supabase), portanto Row Level Security não é necessária aqui — as regras
-- de acesso são aplicadas pelo próprio sistema (admin vê tudo, operador vê só
-- as próprias saídas).
-- ---------------------------------------------------------------------------
