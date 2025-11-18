-- Add RLS policy to allow users to delete their own AI generated images
CREATE POLICY "Users can delete their own AI images"
ON public.ai_generated_images
FOR DELETE
USING ((auth.uid() = user_id) OR (user_id IS NULL));