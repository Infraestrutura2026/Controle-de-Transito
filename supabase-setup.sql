-- ============================================================
-- SUPABASE SETUP — CONTROLE DE TRÂNSITO
-- Execute isto no SQL Editor do Supabase (nova query)
-- ============================================================

-- 1. Tabela de saídas
CREATE TABLE IF NOT EXISTS saidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL,
    hora TEXT,
    tipo TEXT CHECK (tipo IN ('externa', 'interna')),
    local TEXT,
    matricula TEXT,
    nome TEXT,
    tipo_apresentacao TEXT,
    regime TEXT,
    viatura TEXT DEFAULT '',
    motorista TEXT DEFAULT '',
    observacoes TEXT DEFAULT '',
    operador JSONB DEFAULT '{}',
    edited_at TIMESTAMPTZ,
    edited_by JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_saidas_data ON saidas(data);
CREATE INDEX IF NOT EXISTS idx_saidas_tipo ON saidas(tipo);
CREATE INDEX IF NOT EXISTS idx_saidas_regime ON saidas(regime);

-- 2. Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    operador TEXT,
    acao TEXT CHECK (acao IN ('CREATE', 'EDIT', 'DELETE')),
    target_id TEXT,
    old_values JSONB,
    new_values JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_acao ON audit_logs(acao);

-- 3. Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    matricula TEXT NOT NULL UNIQUE
);

-- 4. Row Level Security (RLS) — permite leitura/escrita pública simples
--    Se quiser restringir no futuro, ajuste as políticas.
ALTER TABLE saidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Política: qualquer um pode ler/criar/atualizar/deletar (modo aberto)
-- Isso é suficiente porque o controle de acesso é feito no frontend (App.canManageSaida).
-- Se quiser segurança real por usuário logado, troque para usando auth.users().
CREATE POLICY "allow_all_saidas" ON saidas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_audit" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_admins" ON admins FOR ALL USING (true) WITH CHECK (true);

-- 5. Insere admins iniciais (substitua pelos dados reais)
-- DELETE FROM admins; -- descomente se quiser limpar antes
INSERT INTO admins (nome, matricula) VALUES
    ('Administrador 1', '2026'),
    ('Administrador 2', '2026')
ON CONFLICT (matricula) DO NOTHING;
