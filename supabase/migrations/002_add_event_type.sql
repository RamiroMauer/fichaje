-- Migration 002: Agregar event_type a punch_logs
-- Compatible con datos existentes: histórico PUNCH queda intacto.
-- Nuevos registros deben ser 'ENTRY' o 'EXIT'.

ALTER TABLE punch_logs
  ADD COLUMN IF NOT EXISTS event_type TEXT
    NOT NULL
    DEFAULT 'PUNCH'
    CHECK (event_type IN ('ENTRY', 'EXIT', 'PUNCH'));

-- Los registros anteriores quedan con event_type = 'PUNCH' (legado).
-- Para revertir: ALTER TABLE punch_logs DROP COLUMN event_type;
