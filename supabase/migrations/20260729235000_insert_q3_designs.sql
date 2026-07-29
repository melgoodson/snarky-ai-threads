-- Migration: Insert Q3 2026 Featured Designs into designs table and featured_schedules table

INSERT INTO public.designs (title, description, image_url, is_active) VALUES
  -- 🛠️ LABOR DAY DESIGNS (9 images)
  ('Labor Day: Back to Work Tomorrow', 'Cool woman in denim with sunglasses and coffee cup — Labor Day: Relax today because let''s be real... You''ll be back to work tomorrow.', '/images/designs/labor-day.png', true),
  ('Labor Day: World Takes All the Credit', 'Rebellious guy in denim jacket with crossed arms — Labor Day: Celebrating the people who do all the work while the world takes all the credit.', '/images/designs/labor-day-2.png', true),
  ('Labor Day: Pretend to Love Workers', 'Rosie the Riveter style woman in red bandana — Labor Day: The only day we pretend to love workers. Now back to exploiting you.', '/images/designs/labor-day-3.png', true),
  ('Labor Day: Fueled by Caffeine & Deadlines', 'Hand clutching coffee cup with crown emblem — Shoutout to everyone who works like it''s not every single day. We see you. Fueled by caffeine & deadlines.', '/images/designs/labor-day-4.png', true),
  ('Labor Day: One Day They Thank Us', 'Worker in blue jumpsuit with work gloves — Labor Day AKA: The one day they thank us before asking for more tomorrow.', '/images/designs/labor-day-5.png', true),
  ('Labor Day: Deserves More Than a Holiday', 'Flexing Rosie the Riveter in red headband — Labor Day: A reminder that hard work deserves more than a holiday.', '/images/designs/labor-day-6.png', true),
  ('Labor Day: Well-Deserved Nap', 'Guy relaxing on chair in sunglasses — Labor Day: No parades. No speeches. Just a well-deserved NAP! Earned it.', '/images/designs/labor-day-7.png', true),
  ('Labor Day: Adulting Is Hard', 'Wrench badge typography design — Labor Day: Because adulting is hard. Thanks for not quitting.', '/images/designs/labor-day-8.png', true),
  ('Labor Day: Stronger Than My Paycheck', 'Snarky woman with denim and coffee mug — Labor Day: Relax today. Stronger than my paycheck.', '/images/designs/labor-day-9.png', true),

  -- 👵 GRANDPARENTS DAY DESIGNS (4 images)
  ('Happy Grandparents Day — Bench Warmth', 'Heartwarming illustration of grandmother and grandfather sitting on a wooden bench with their grandchildren.', '/images/designs/happy-grandparents-day.png', true),
  ('Grandparents Day: Awesome in Aging', 'Cool grandpa and grandma in pink and dark sunglasses — Happy Grandparents Day: We put the awesome in aging.', '/images/designs/happy-grandparents-day-2.png', true),
  ('Grandparents Day: Professional Spoilers', 'Crown icon badge font graphic — Happy Grandparents Day: Not retired. Professional spoilers.', '/images/designs/happy-grandparents-day-3.png', true),
  ('Grandparents Day: Older, Wiser, Zero Filter', 'Glamorous grandma in leopard print jacket giving peace sign — Happy Grandparents Day: Older. Wiser. Still zero filter.', '/images/designs/happy-grandparents-day-4.png', true),

  -- 🇺🇸 9/11 PATRIOT DAY DESIGNS (2 images)
  ('9/11 Patriot Day — United We Stand', 'Patriot Day 9-11-01 tribute featuring American flag, Twin Towers skyline silhouette, flying eagle, and United We Stand message.', '/images/designs/9-11.png', true),
  ('9/11 We Will Never Forget', 'Bold Patriot Day 9-11-01 typography badge with Twin Towers sunset and American flag graphics.', '/images/designs/9-11-2.png', true),

  -- 💃 NATIONAL HISPANIC HERITAGE MONTH DESIGNS (4 images)
  ('Hispanic Heritage Month — Festive Floral', 'National Hispanic Heritage Month Begins — Colorful festive block font with floral decor and banner.', '/images/designs/national-hispanic-heritage-month-begins.png', true),
  ('Hispanic Heritage Month — Historia, Cultura, Orgullo', 'National Hispanic Heritage Month Begins — Gold leaf branch decoration with text: Nuestra Historia. Nuestra Cultura. Nuestro Orgullo.', '/images/designs/national-hispanic-heritage-month-begins-2.png', true),
  ('Hispanic Heritage Month — Culture & Pride', 'Happy National Hispanic Heritage Month Begins — Let''s celebrate our culture, roots & pride font with heart accent.', '/images/designs/national-hispanic-heritage-month-begins-3.png', true),
  ('Hispanic Heritage Month — Celebrate, Honor, Inspire', 'National Hispanic Heritage Month Begins — Sun icon script with text: Celebrate. Honor. Inspire.', '/images/designs/national-hispanic-heritage-month-begins-4.png', true)
ON CONFLICT DO NOTHING;

-- Upsert Month 6 (July), Month 7 (August), Month 8 (September) in featured_schedules
INSERT INTO public.featured_schedules (month, headline, subheadline, themes, is_active)
VALUES 
(
  6,
  'Q3 HOLIDAYS & ATTITUDE',
  'Labor Day, Grandparents Day, 9/11 Patriot Remembrance, & Hispanic Heritage Month — snarky apparel for every Q3 event.',
  '[
    {"label": "🛠️ Labor Day Snark", "keywords": "labor day shirt, funny labor day tee, work humor, adulting is hard"},
    {"label": "👵 Grandparents Day", "keywords": "happy grandparents day shirt, funny grandparents gift, professional spoilers, awesome in aging"},
    {"label": "🇺🇸 9/11 Patriot Day", "keywords": "patriot day shirt, 9-11 remembrance tee, september 11 tribute, we will never forget"},
    {"label": "💃 Hispanic Heritage Month", "keywords": "hispanic heritage month shirt, nuestra cultura, nuestra historia, orgullo, viva la vida"}
  ]'::jsonb,
  true
),
(
  7,
  'Q3 HOLIDAYS & ATTITUDE',
  'Labor Day, Grandparents Day, 9/11 Patriot Remembrance, & Hispanic Heritage Month — snarky apparel for every Q3 event.',
  '[
    {"label": "🛠️ Labor Day Snark", "keywords": "labor day shirt, funny labor day tee, work humor, adulting is hard"},
    {"label": "👵 Grandparents Day", "keywords": "happy grandparents day shirt, funny grandparents gift, professional spoilers, awesome in aging"},
    {"label": "🇺🇸 9/11 Patriot Day", "keywords": "patriot day shirt, 9-11 remembrance tee, september 11 tribute, we will never forget"},
    {"label": "💃 Hispanic Heritage Month", "keywords": "hispanic heritage month shirt, nuestra cultura, nuestra historia, orgullo, viva la vida"}
  ]'::jsonb,
  true
),
(
  8,
  'Q3 HOLIDAYS & ATTITUDE',
  'Labor Day, Grandparents Day, 9/11 Patriot Remembrance, & Hispanic Heritage Month — snarky apparel for every Q3 event.',
  '[
    {"label": "🛠️ Labor Day Snark", "keywords": "labor day shirt, funny labor day tee, work humor, adulting is hard"},
    {"label": "👵 Grandparents Day", "keywords": "happy grandparents day shirt, funny grandparents gift, professional spoilers, awesome in aging"},
    {"label": "🇺🇸 9/11 Patriot Day", "keywords": "patriot day shirt, 9-11 remembrance tee, september 11 tribute, we will never forget"},
    {"label": "💃 Hispanic Heritage Month", "keywords": "hispanic heritage month shirt, nuestra cultura, nuestra historia, orgullo, viva la vida"}
  ]'::jsonb,
  true
)
ON CONFLICT (month) DO UPDATE SET
  headline = EXCLUDED.headline,
  subheadline = EXCLUDED.subheadline,
  themes = EXCLUDED.themes,
  is_active = true,
  updated_at = NOW();
