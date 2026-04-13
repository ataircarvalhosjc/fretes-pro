-- ================================================================
-- FretesPro — Schema Inicial
-- Execute no SQL Editor do Supabase Dashboard
-- ================================================================

-- Tabela de motoristas
CREATE TABLE IF NOT EXISTS motoristas (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                TEXT        NOT NULL,
  cpf                 TEXT,
  data_nascimento     DATE,
  whatsapp            TEXT        NOT NULL,         -- formato: 5511999999999
  email               TEXT,
  cidade              TEXT,
  estado              TEXT,
  foto_url            TEXT,
  numero_cnh          TEXT,
  categoria_cnh       TEXT,                         -- B, C, D ou E
  validade_cnh        DATE,
  rntrc               TEXT,                         -- ANTT (obrigatório por lei)
  tipo_veiculo        TEXT        NOT NULL,
  placa               TEXT,
  ano_veiculo         INTEGER,
  tipo_carroceria     TEXT,                         -- Baú, Sider, Aberto, etc.
  capacidade_kg       INTEGER,
  regioes_atuacao     TEXT[],
  aceita_fracionado   BOOLEAN     DEFAULT FALSE,
  aceita_refrigerado  BOOLEAN     DEFAULT FALSE,
  disponibilidade     TEXT        DEFAULT 'ativo',  -- ativo, inativo, ferias
  ativo               BOOLEAN     DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nome              TEXT          NOT NULL,
  cliente_whatsapp          TEXT          NOT NULL,
  origem                    TEXT          NOT NULL,
  destino                   TEXT          NOT NULL,
  descricao                 TEXT,
  tipo_veiculo_necessario   TEXT,
  peso_kg                   INTEGER,
  valor_estimado            DECIMAL(10,2),
  status                    TEXT          DEFAULT 'pendente',  -- pendente, enviado, em_negociacao, concluido, cancelado
  motoristas_notificados    INTEGER       DEFAULT 0,
  observacoes               TEXT,
  data_frete                DATE,
  created_at                TIMESTAMPTZ   DEFAULT NOW(),
  enviado_em                TIMESTAMPTZ
);

-- Tabela de log de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id    UUID        REFERENCES orcamentos(id) ON DELETE CASCADE,
  motorista_id    UUID        REFERENCES motoristas(id) ON DELETE CASCADE,
  mensagem        TEXT,
  status          TEXT        DEFAULT 'enviado',   -- enviado, falha
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_motoristas_disponibilidade ON motoristas(disponibilidade) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_motoristas_tipo_veiculo    ON motoristas(tipo_veiculo);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status          ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_created_at      ON orcamentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_orcamento     ON notificacoes(orcamento_id);

-- ================================================================
-- Row Level Security (RLS) — opcional para o painel admin
-- Descomente se quiser adicionar autenticação futuramente
-- ================================================================

-- ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- Dados de exemplo (remova em produção)
-- ================================================================

INSERT INTO motoristas (nome, whatsapp, tipo_veiculo, placa, cidade, estado, categoria_cnh, disponibilidade, aceita_fracionado, aceita_refrigerado)
VALUES
  ('João Silva', '5511999990001', 'van', 'ABC1234', 'São Paulo', 'SP', 'B', 'ativo', TRUE, FALSE),
  ('Pedro Souza', '5511999990002', 'toco', 'DEF5678', 'São Paulo', 'SP', 'C', 'ativo', FALSE, FALSE),
  ('Maria Santos', '5511999990003', 'moto', 'GHI9012', 'São Paulo', 'SP', 'B', 'ativo', TRUE, FALSE),
  ('Carlos Lima', '5521999990004', 'truck', 'JKL3456', 'Rio de Janeiro', 'RJ', 'E', 'inativo', FALSE, TRUE)
ON CONFLICT DO NOTHING;
