-- Add new columns to products table for enhanced Printify integration
ALTER TABLE products
ADD COLUMN IF NOT EXISTS printify_blueprint_id text,
ADD COLUMN IF NOT EXISTS template_image_url text,
ADD COLUMN IF NOT EXISTS print_area_dimensions jsonb DEFAULT '{"width": 0, "height": 0, "x_offset": 0, "y_offset": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS base_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS retail_price numeric;

-- Update retail_price with existing price values
UPDATE products SET retail_price = price WHERE retail_price IS NULL;

-- Make price nullable since we now have retail_price
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;

-- Add index on blueprint_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_blueprint_id ON products(printify_blueprint_id);

-- Add comment to document the schema
COMMENT ON COLUMN products.printify_blueprint_id IS 'Printify blueprint ID for the base product type';
COMMENT ON COLUMN products.print_area_dimensions IS 'Print area constraints as JSON: {width, height, x_offset, y_offset}';
COMMENT ON COLUMN products.base_cost IS 'Base cost from Printify';
COMMENT ON COLUMN products.retail_price IS 'Retail price charged to customers';