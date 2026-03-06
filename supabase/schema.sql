-- Supabase Schema for CasinoClock MVP

-- Extensiones útiles para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------
-- 1. Tablas y Configuración
--------------------------------------------------------

-- Stations
CREATE TABLE stations (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL
);

-- Cashiers
CREATE TABLE cashiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name TEXT NOT NULL
);

-- Station Assignments (Mapping M to N: Station <-> Cashiers)
CREATE TABLE station_assignments (
    station_id TEXT REFERENCES stations(id) ON DELETE CASCADE,
    cashier_id UUID REFERENCES cashiers(id) ON DELETE CASCADE,
    PRIMARY KEY (station_id, cashier_id)
);

-- Cashier PINs
-- Solo el servidor puede leer esta tabla para validar hashes
CREATE TABLE cashier_pins (
    cashier_id UUID PRIMARY KEY REFERENCES cashiers(id) ON DELETE CASCADE,
    pin_hash TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Rate-limiting table (Attempts)
CREATE TABLE pin_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id TEXT REFERENCES stations(id) ON DELETE CASCADE,
    cashier_id UUID REFERENCES cashiers(id) ON DELETE CASCADE,
    failed_count INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (station_id, cashier_id)
);

-- Punch Logs (Fichajes reales)
CREATE TABLE punch_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id TEXT REFERENCES stations(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES cashiers(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- Ej: 'PUNCH'
    device_info TEXT, -- User-Agent u otros metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------
-- 2. Índices para performance
--------------------------------------------------------
CREATE INDEX idx_punch_logs_station_id ON punch_logs (station_id);
CREATE INDEX idx_punch_logs_cashier_id ON punch_logs (cashier_id);
CREATE INDEX idx_punch_logs_created_at ON punch_logs (created_at);

--------------------------------------------------------
-- 3. Row Level Security (RLS)
--------------------------------------------------------
-- Habilitamos RLS en todas las tablas
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashier_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_logs ENABLE ROW LEVEL SECURITY;

-- Politicas de solo lectura para anon/authenticated (para cargar UI desde cliente public si se necesita)
CREATE POLICY "Enable read access for all users on stations" ON stations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on cashiers" ON cashiers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on station_assignments" ON station_assignments FOR SELECT USING (true);

-- Las tablas sensibles `cashier_pins`, `pin_attempts` y `punch_logs` solo podrán ser
-- leídas o escritas por Server Actions utilizando el SERVICE_ROLE_KEY.
-- No definimos políticas públicas para estas.
