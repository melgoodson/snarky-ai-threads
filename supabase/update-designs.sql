-- Deactivate all existing designs
UPDATE designs SET is_active = false;

-- Insert 11 new designs with transparent-edited images
INSERT INTO designs (title, description, image_url, is_active) VALUES
  ('Kindly F Off', 'Chattering teeth with dripping red lettering — for when politeness has a bite.', '/images/designs/1.png', true),
  ('How Bold of You to Ass-U-Me I Care', 'A cheeky donkey delivering the ultimate snarky comeback.', '/images/designs/2.png', true),
  ('Running on Caffeine and Spite', 'Angry guy fueled by spite and a steaming mug of attitude.', '/images/designs/3.png', true),
  ('I Rolled My Eyes So Hard', 'Eyes literally flying out — go catch them, she can''t see.', '/images/designs/4.png', true),
  ('It Is What It Is', 'Ransom-note collage style lettering for the ultimate shrug.', '/images/designs/5.png', true),
  ('Respectfully, No!', 'Retro pin-up lady with a firm hand up — boundaries, darling.', '/images/designs/6.png', true),
  ('I''m Not for Everyone (Mystic)', 'Mystical tarot witch with crystals and a black cat.', '/images/designs/7.png', true),
  ('I''m Not for Everyone (Flying Leap)', 'Wingsuit skydiver taking a literal flying leap off a cliff.', '/images/designs/8.png', true),
  ('Snarky Humans™', 'The iconic Snarky Humans brand logo in dripping red balloon letters.', '/images/designs/9.png', true),
  ('Kindly F Off - Snarky Humans™', 'Dripping horror-font mashup of the signature design with the brand name.', '/images/designs/10.png', true),
  ('Sounds Like a You Problem!', 'Pointing fist with bold olive and gold typography — not my circus.', '/images/designs/11.png', true);
