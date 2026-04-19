-- ================================================================
-- Migração 002 — Suporte a Push Notifications (FCM)
-- Execute no SQL Editor do Supabase Dashboard
-- ================================================================

-- Adiciona token FCM na tabela de motoristas
ALTER TABLE motoristas
  ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Adiciona token FCM na tabela de orçamentos
ALTER TABLE orcamentos
  ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Adiciona campos de resposta do motorista na tabela de notificações
ALTER TABLE notificacoes
  ADD COLUMN IF NOT EXISTS resposta      TEXT,        -- 'aceitar' ou 'recusar'
  ADD COLUMN IF NOT EXISTS respondido_em TIMESTAMPTZ;

-- Índice para buscar motoristas com token FCM ativo
CREATE INDEX IF NOT EXISTS idx_motoristas_fcm_token ON motoristas(fcm_token) WHERE fcm_token IS NOT NULL AND ativo = TRUE;
