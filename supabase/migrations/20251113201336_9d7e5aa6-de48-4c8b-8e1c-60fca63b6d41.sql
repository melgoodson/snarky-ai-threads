-- Create table for AI-generated images
CREATE TABLE public.ai_generated_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_text text NOT NULL,
  image_url text NOT NULL,
  selected boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_generated_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI-generated images
CREATE POLICY "Users can view their own AI images"
  ON public.ai_generated_images
  FOR SELECT
  USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Anyone can create AI images"
  ON public.ai_generated_images
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own AI images"
  ON public.ai_generated_images
  FOR UPDATE
  USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- Enhance orders table with artwork and fulfillment tracking
ALTER TABLE public.orders
  ADD COLUMN artwork_url text,
  ADD COLUMN mockup_url text,
  ADD COLUMN teeinblue_order_id text,
  ADD COLUMN fulfillment_status text DEFAULT 'pending';

-- Add index for faster fulfillment status queries
CREATE INDEX idx_orders_fulfillment_status ON public.orders(fulfillment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Add index for AI images lookup
CREATE INDEX idx_ai_images_user_id ON public.ai_generated_images(user_id);
CREATE INDEX idx_ai_images_selected ON public.ai_generated_images(selected) WHERE selected = true;