-- Seed 6 products into the products table
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
) VALUES
(
  'Unisex Jersey Short Sleeve Tee',
  '12',
  '12',
  'Bella+Canvas',
  '3001',
  'Apparel',
  'The Bella Canvas 3001 is a classic unisex jersey short sleeve tee that fits like a well-loved favourite…',
  '["https://images.printify.com/66d81b70295ea4f038065152", "https://images.printify.com/688c5bdea91db6d1610f6ca2"]'::jsonb,
  'https://images.printify.com/66d81b70295ea4f038065152',
  '{"width": 3000, "height": 4000, "xOffset": 0, "yOffset": 0}'::jsonb,
  true,
  19.99,
  29.99,
  12.00
),
(
  'Mug 15oz',
  '425',
  '425',
  'Generic brand',
  '',
  'Drinkware',
  'There''s never too much coffee! A big size (15oz) white, durable ceramic mug…',
  '["https://images.printify.com/66cc312779065670bd0b7f73", "https://images.printify.com/66cc31293b5de060570a2623"]'::jsonb,
  'https://images.printify.com/66cc312779065670bd0b7f73',
  '{"width": 2000, "height": 2000, "xOffset": 0, "yOffset": 0}'::jsonb,
  true,
  14.99,
  19.99,
  8.50
),
(
  'Unisex Heavy Blend™ Hooded Sweatshirt',
  '77',
  '77',
  'Gildan',
  '18500',
  'Apparel',
  'The Gildan Heavy Blend™ hoodie…',
  '["https://images.printify.com/66dedd239da894140e0af9e2"]'::jsonb,
  'https://images.printify.com/66dedd239da894140e0af9e2',
  '{"width": 3000, "height": 3500, "xOffset": 0, "yOffset": 0}'::jsonb,
  true,
  34.99,
  49.99,
  22.00
),
(
  'Tote Bag',
  '467',
  '467',
  'Generic brand',
  '3842-LH',
  'Accessories',
  'These long handle full-color tote bags are great for all your grab-and-go needs…',
  '["https://images.printify.com/66f5679fa45f67162d079fb3"]'::jsonb,
  'https://images.printify.com/66f5679fa45f67162d079fb3',
  '{"width": 2500, "height": 3000, "xOffset": 0, "yOffset": 0}'::jsonb,
  true,
  16.99,
  24.99,
  10.00
),
(
  'Greeting Cards',
  '962',
  '962',
  'Generic brand',
  '',
  'Stationery',
  'Greeting cards they''ll hold on to forever…',
  '["https://images.printify.com/66d1a647a4b35e6ef4081302", "https://images.printify.com/66d1a646d347cddde3098412", "https://images.printify.com/6213a504daaded371340a408"]'::jsonb,
  'https://images.printify.com/66d1a647a4b35e6ef4081302',
  '{"width": 1800, "height": 1200, "xOffset": 0, "yOffset": 0}'::jsonb,
  true,
  4.99,
  7.99,
  2.50
),
(
  'Scented Candle – Full Glass, 11oz',
  '727',
  '727',
  'Seventh Avenue Apothecary',
  '',
  'Home Decor',
  'Breathe in, breathe out — it''s me time. Premium glass jar, 11oz…',
  '["https://images.printify.com/66d6cca8861f5c50ce02dc32"]'::jsonb,
  'https://images.printify.com/66d6cca8861f5c50ce02dc32',
  '{"width": 2800, "height": 2000, "xOffset": 0, "yOffset": 0}'::jsonb,
  true,
  24.99,
  34.99,
  18.00
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

-- Verify the insertion
DO $$
DECLARE
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products WHERE printify_product_id IN ('12', '425', '77', '467', '962', '727');
  RAISE NOTICE '6 products seeded successfully. Total matching products: %', product_count;
END $$;