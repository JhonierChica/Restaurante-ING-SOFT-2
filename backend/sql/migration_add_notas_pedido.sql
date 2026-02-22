-- Migración: Agregar columna 'notas' a la tabla 'pedido'
-- Ejecutar con: psql -U postgres -d mr_panzo_db -f backend/sql/migration_add_notas_pedido.sql

ALTER TABLE public.pedido ADD COLUMN IF NOT EXISTS notas text;

COMMENT ON COLUMN public.pedido.notas IS 'Notas adicionales del pedido ingresadas por el mesero';
