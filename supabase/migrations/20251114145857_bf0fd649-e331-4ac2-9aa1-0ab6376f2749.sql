-- Add brand and model columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT;

COMMENT ON COLUMN products.brand IS 'Product brand name (e.g., Bella+Canvas, Gildan)';
COMMENT ON COLUMN products.model IS 'Product model number (e.g., 3001, 18500)';