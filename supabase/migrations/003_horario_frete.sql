-- Add horario_frete column to orcamentos
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS horario_frete TEXT;
