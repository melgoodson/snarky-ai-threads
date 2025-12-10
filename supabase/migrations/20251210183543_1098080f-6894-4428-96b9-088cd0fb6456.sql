-- Create storage bucket for design images
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-images', 'design-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Users can upload design images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'design-images');

-- Allow public read access
CREATE POLICY "Design images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'design-images');