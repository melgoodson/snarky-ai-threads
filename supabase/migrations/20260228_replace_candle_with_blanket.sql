-- Deactivate Scented Candle (printify_product_id = '727') and replace with Blanket
UPDATE products SET is_active = false WHERE printify_product_id = '727';

-- Insert or update the Blanket product
INSERT INTO products (
  title,
  printify_product_id,
  printify_blueprint_id,
  brand,
  model,
  category,
  description,
  images,
  template_image_url,
  print_area_dimensions,
  is_active,
  price,
  retail_price,
  base_cost
) VALUES (
  'Personalization Blanket',
  '522',
  '522',
  'Generic brand',
  'Velveteen Plush',
  'Personalized Gifts',
  'Upload your favorite photos to create a one-of-a-kind custom velveteen plush blanket. Ultra-soft, vibrant print, machine washable. The perfect personalized gift.',
  '["https://images.printify.com/65f4c68e86013b67e60f7c32"]'::jsonb,
  'https://images.printify.com/65f4c68e86013b67e60f7c32',
  '{"width": 6000, "height": 4000, "xOffset": 0, "yOffset": 0}'::jsonb,
  true,
  39.99,
  49.99,
  25.00
)
ON CONFLICT (printify_product_id) DO UPDATE SET
  title = EXCLUDED.title,
  printify_blueprint_id = EXCLUDED.printify_blueprint_id,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  template_image_url = EXCLUDED.template_image_url,
  print_area_dimensions = EXCLUDED.print_area_dimensions,
  is_active = EXCLUDED.is_active,
  price = EXCLUDED.price,
  retail_price = EXCLUDED.retail_price,
  base_cost = EXCLUDED.base_cost,
  updated_at = NOW();
