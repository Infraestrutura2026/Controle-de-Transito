-- ============================================================================
-- CONTROLE DE SAÍDAS — Complexo Penal de Marília
-- Migração: renomear "horário previsto para saída" para "HORÁRIO DE EMBARQUE"
--
-- QUANDO USAR: apenas se o banco já existia antes desta alteração (a coluna
-- ainda se chama horario_previsto). Bancos novos já nascem corretos com o
-- db/setup.sql e não precisam rodar este script.
--
-- COMO USAR (Neon): painel do Neon → SQL Editor → colar e Run.
-- O script é idempotente: pode ser executado mais de uma vez sem erro e sem
-- perder dados (RENAME COLUMN preserva os valores já cadastrados).
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'saidas' AND column_name = 'horario_previsto'
  ) THEN
    ALTER TABLE saidas RENAME COLUMN horario_previsto TO horario_embarque;
  END IF;
END $$;
