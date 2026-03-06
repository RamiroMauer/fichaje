-- Migration: Agregar campo is_active a cashiers
-- Ejecutar en Supabase SQL Editor antes de usar el panel admin

ALTER TABLE cashiers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
