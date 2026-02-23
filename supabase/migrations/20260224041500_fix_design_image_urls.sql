-- Fix design image URLs: /src/assets/ paths don't work in production
-- because Vite hashes asset filenames during build. Move to /images/designs/ (public static)
UPDATE public.designs SET image_url = '/images/designs/free-hugs.png' WHERE image_url = '/src/assets/free-hugs.png';
UPDATE public.designs SET image_url = '/images/designs/abduct-me.png' WHERE image_url = '/src/assets/abduct-me.png';
UPDATE public.designs SET image_url = '/images/designs/dark.png' WHERE image_url = '/src/assets/dark.png';
UPDATE public.designs SET image_url = '/images/designs/fathers.png' WHERE image_url = '/src/assets/fathers.png';
UPDATE public.designs SET image_url = '/images/designs/rbf-champion.png' WHERE image_url = '/src/assets/rbf-champion.png';
UPDATE public.designs SET image_url = '/images/designs/sasquatches.png' WHERE image_url = '/src/assets/sasquatches.png';
UPDATE public.designs SET image_url = '/images/designs/snarky-humans.png' WHERE image_url = '/src/assets/snarky-humans.png';
UPDATE public.designs SET image_url = '/images/designs/white-idol-morning.png' WHERE image_url = '/src/assets/white-idol-morning.png';
