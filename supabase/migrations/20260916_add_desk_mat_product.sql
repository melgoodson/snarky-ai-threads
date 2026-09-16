-- Insert or update the Desk Mat product (Printify Blueprint #488)
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
  base_cost,
  variants
) VALUES (
  'Desk Mat & Gaming Mouse Pad',
  '488',
  '488',
  'Generic brand',
  'Desk Mat',
  'Accessories',
  'Made of 3mm thick neoprene material, with an anti-slip backing and hemmed edge for durability and stability. Available in three generous sizes with high-definition edge-to-edge sublimation printing.',
  '["https://images.printify.com/66dad443b15b9466730e1f92", "/images/deskmat-mockup-snarky-1.jpg", "/images/deskmat-mockup-rbf-2.jpg", "/images/deskmat-mockup-overthinking-3.jpg", "/images/desk-mat-mockup.png"]'::jsonb,
  'https://images.printify.com/66dad443b15b9466730e1f92',
  '{"width": 5610, "height": 3839, "xOffset": 0, "yOffset": 0}'::jsonb,
  true,
  21.99,
  21.99,
  11.50,
  '[
    {"id": 65240, "title": "12\" × 18\"", "is_enabled": true, "price": 21.99, "cost": 11.50},
    {"id": 65241, "title": "12\" × 22\"", "is_enabled": true, "price": 25.99, "cost": 13.50},
    {"id": 72580, "title": "16\" × 32\"", "is_enabled": true, "price": 31.99, "cost": 16.50}
  ]'::jsonb
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
  variants = EXCLUDED.variants,
  updated_at = NOW();
