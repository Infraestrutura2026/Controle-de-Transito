-- ============================================================================
-- CONTROLE DE SAÍDAS — Complexo Penal de Marília
-- Migração: trocar o regime "RSA" por "SA" nos registros existentes.
--
-- O sistema passa a usar "SA" em todo lugar (formulário, relatórios, CSVs,
-- dashboards, API e validação); "RSA" permanece aceito apenas como sinônimo
-- na importação de planilhas antigas.
--
-- QUANDO USAR: apenas em bancos que já existiam antes desta alteração e que
-- contenham registros com regime = 'RSA'. Bancos novos já nascem corretos
-- com o db/setup.sql.
--
-- COMO USAR (Neon): painel do Neon → SQL Editor → colar e Run.
-- O script é idempotente: pode ser executado mais de uma vez sem erro e sem
-- alterar dados já convertidos.
-- ============================================================================

UPDATE saidas SET regime = 'SA' WHERE regime = 'RSA';
