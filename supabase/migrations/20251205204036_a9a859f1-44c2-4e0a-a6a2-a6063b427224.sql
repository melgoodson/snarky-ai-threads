-- Add design_image_url column to order_items to store the artwork for printing
ALTER TABLE public.order_items 
ADD COLUMN design_image_url text;