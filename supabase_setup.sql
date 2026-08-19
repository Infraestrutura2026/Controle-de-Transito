-- ============================================================
-- CONTROLE DE TRÂNSITO — SETUP SUPABASE
-- Execute este SQL no SQL Editor do Supabase
-- (https://supabase.com/dashboard → seu projeto → SQL Editor)
-- ============================================================

-- ============================================================
-- 1. TABELA: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome        TEXT NOT NULL,
    matricula   TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. TABELA: saidas
-- ============================================================
CREATE TABLE IF NOT EXISTS saidas (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data              DATE NOT NULL,
    hora              TIME NOT NULL,
    tipo              TEXT NOT NULL CHECK (tipo IN ('externa','interna')),
    local             TEXT NOT NULL,
    matricula         TEXT NOT NULL,
    nome              TEXT NOT NULL,
    tipo_apresentacao TEXT NOT NULL DEFAULT '',
    regime            TEXT NOT NULL CHECK (regime IN ('SA','FE','CR')),
    viatura           TEXT DEFAULT '',
    motorista         TEXT DEFAULT '',
    observacoes       TEXT DEFAULT '',
    operador          JSONB DEFAULT '{}',   -- { name, mat, isAdmin }
    edited_at         TIMESTAMPTZ,
    edited_by         JSONB,
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. TABELA: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
    operador    TEXT NOT NULL,
    acao        TEXT NOT NULL,
    target_id   UUID,
    old_values  JSONB,
    new_values  JSONB
);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
--    IMPORTANTE: O app usa anon key (sem autenticação Auth).
--    Precisamos permitir leitura/escrita via anon.
-- ============================================================

-- Habilitar RLS nas 3 tabelas
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE saidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para admins (leitura e escrita anônima)
CREATE POLICY "Admins leitura anon" ON admins
    FOR SELECT USING (true);
CREATE POLICY "Admins inserção anon" ON admins
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins atualização anon" ON admins
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins exclusão anon" ON admins
    FOR DELETE USING (true);

-- Políticas para saidas (leitura e escrita anônima)
CREATE POLICY "Saidas leitura anon" ON saidas
    FOR SELECT USING (true);
CREATE POLICY "Saidas inserção anon" ON saidas
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Saidas atualização anon" ON saidas
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Saidas exclusão anon" ON saidas
    FOR DELETE USING (true);

-- Políticas para audit_logs (leitura e escrita anônima)
CREATE POLICY "Audit leitura anon" ON audit_logs
    FOR SELECT USING (true);
CREATE POLICY "Audit inserção anon" ON audit_logs
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Audit atualização anon" ON audit_logs
    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Audit exclusão anon" ON audit_logs
    FOR DELETE USING (true);

-- ============================================================
-- 5. ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_saidas_data ON saidas (data);
CREATE INDEX IF NOT EXISTS idx_saidas_matricula ON saidas (matricula);
CREATE INDEX IF NOT EXISTS idx_saidas_operador ON saidas ((operador->>'mat'));
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_acao ON audit_logs (acao);

-- ============================================================
-- 6. SEED: inserir 2 administradores padrão
--    Substitua pelos nomes e matrículas reais do Complexo Penal
-- ============================================================
INSERT INTO admins (nome, matricula) VALUES
    ('Admin Principal', '0001'),
    ('Admin Secundário', '0002')
ON CONFLICT (matricula) DO NOTHING;

-- ============================================================
-- PRONTO! Após executar este SQL:
-- 1. Vá em Settings > API Keys no Supabase Dashboard
-- 2. Copie a "Project URL" e a "anon key" (ou "Publishable key")
-- 3. Cole esses valores na tela Configurações do app
-- ============================================================
