-- Make variant_id nullable in order_items table
-- This allows orders without specific variants (e.g., custom designs)
ALTER TABLE public.order_items 
ALTER COLUMN variant_id DROP NOT NULL;