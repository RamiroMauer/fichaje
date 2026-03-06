-- Seed Data for CasinoClock MVP
-- ESTE SCRIPT INCLUYE PIN HASH PARA PROBAR SIN FRONTEND DE CREACIÓN.
-- El hash corresponde al PIN '1234' hasheado con bcrypt (10 rounds): $2b$10$gO0Ww00qO8a77nTk7UoWvefN5VdY/1VFYyQ/21/eE6kUqI.R7Z80m

--------------------------------------------------------
-- 1. Insert Stations
--------------------------------------------------------
INSERT INTO stations (id, label) VALUES
    ('1', 'CAJA 1'),
    ('2', 'CAJA 2'),
    ('3', 'CAJA 3'),
    ('4', 'CAJA 4'),
    ('5', 'CAJA 5'),
    ('6', 'CAJA 6');

--------------------------------------------------------
-- 2. Insert Cashiers
--------------------------------------------------------
-- Vamos a crear cajeros predefinidos y asociar 4 a la Estación 1.
-- Usaremos la función uuid_generate_v4() interna, pero los definimos a mano para el test con IDs estáticos.

-- Creando 4 cajeros para la Estación 1:
INSERT INTO cashiers (id, display_name) VALUES
    ('11111111-1111-4111-a111-111111111111', 'Ana Martínez'),
    ('22222222-2222-4222-a222-222222222222', 'Carlos Gómez'),
    ('33333333-3333-4333-a333-333333333333', 'María Torres'),
    ('44444444-4444-4444-a444-444444444444', 'Juan Silva');

--------------------------------------------------------
-- 3. Asignar Cajeros a Estación 1
--------------------------------------------------------
INSERT INTO station_assignments (station_id, cashier_id) VALUES
    ('1', '11111111-1111-4111-a111-111111111111'),
    ('1', '22222222-2222-4222-a222-222222222222'),
    ('1', '33333333-3333-4333-a333-333333333333'),
    ('1', '44444444-4444-4444-a444-444444444444');

--------------------------------------------------------
-- 4. Asignar PINs Hasheados (Todos tendrán '1234')
--------------------------------------------------------
-- Hash de 1234: $2b$10$gO0Ww00qO8a77nTk7UoWvefN5VdY/1VFYyQ/21/eE6kUqI.R7Z80m
-- (Para testing rápido).
INSERT INTO cashier_pins (cashier_id, pin_hash) VALUES
    ('11111111-1111-4111-a111-111111111111', '$2b$10$gO0Ww00qO8a77nTk7UoWvefN5VdY/1VFYyQ/21/eE6kUqI.R7Z80m'),
    ('22222222-2222-4222-a222-222222222222', '$2b$10$gO0Ww00qO8a77nTk7UoWvefN5VdY/1VFYyQ/21/eE6kUqI.R7Z80m'),
    ('33333333-3333-4333-a333-333333333333', '$2b$10$gO0Ww00qO8a77nTk7UoWvefN5VdY/1VFYyQ/21/eE6kUqI.R7Z80m'),
    ('44444444-4444-4444-a444-444444444444', '$2b$10$gO0Ww00qO8a77nTk7UoWvefN5VdY/1VFYyQ/21/eE6kUqI.R7Z80m');

-- Nota: Para las otras cajas no se agregan datos por ahora porque el test principal es el /s/1 con estos 4 cajeros.
