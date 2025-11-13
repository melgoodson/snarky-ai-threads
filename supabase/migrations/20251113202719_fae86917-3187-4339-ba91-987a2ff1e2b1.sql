-- Fix foreign key constraint on ai_generated_images table
-- Remove the foreign key reference to auth.users
ALTER TABLE public.ai_generated_images 
  DROP CONSTRAINT IF EXISTS ai_generated_images_user_id_fkey;

-- The user_id column remains but without foreign key constraint
-- This allows proper data management without referencing the auth schema