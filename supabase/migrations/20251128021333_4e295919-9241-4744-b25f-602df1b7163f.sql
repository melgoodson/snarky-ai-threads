-- Create designs table to store artwork
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Everyone can view active designs
CREATE POLICY "Designs are viewable by everyone"
  ON public.designs
  FOR SELECT
  USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_designs_updated_at
  BEFORE UPDATE ON public.designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the 8 existing designs
INSERT INTO public.designs (title, description, image_url) VALUES
  ('Free Hugs', 'Show your friendly side with this welcoming design', '/src/assets/free-hugs.png'),
  ('Abduct Me', 'For those who believe in the extraordinary', '/src/assets/abduct-me.png'),
  ('Dark', 'Embrace the mysterious and bold', '/src/assets/dark.png'),
  ('Fathers', 'Celebrate the father figures in your life', '/src/assets/fathers.png'),
  ('RBF Champion', 'Own your resting face with pride', '/src/assets/rbf-champion.png'),
  ('Sasquatches', 'For believers in the legendary creature', '/src/assets/sasquatches.png'),
  ('Snarky Humans', 'A humorous take on human nature', '/src/assets/snarky-humans.png'),
  ('White Idol Morning', 'Start your day with style', '/src/assets/white-idol-morning.png');