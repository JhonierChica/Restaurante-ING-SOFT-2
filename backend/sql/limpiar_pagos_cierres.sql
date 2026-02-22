-- =====================================================
-- Script para limpiar datos de pagos y cierres de caja
-- Restaurante Mr. Panzo
-- =====================================================

-- 1. Eliminar todos los cierres de caja
DELETE FROM cash_register_closes;

-- 2. Eliminar todos los pagos
DELETE FROM pago;

-- 3. Resetear las secuencias (auto-increment) para que IDs comiencen desde 1
ALTER SEQUENCE IF EXISTS cash_register_closes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pago_id_pago_seq RESTART WITH 1;

-- Verificar que se eliminaron
SELECT 'Pagos restantes:' AS info, COUNT(*) AS total FROM pago;
SELECT 'Cierres de caja restantes:' AS info, COUNT(*) AS total FROM cash_register_closes;
