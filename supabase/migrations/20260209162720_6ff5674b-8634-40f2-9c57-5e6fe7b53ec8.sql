-- Add country column to analytics_sessions for geo attribution
-- ISO 3166-1 alpha-2 code, defaults to 'XX' if unknown
ALTER TABLE public.analytics_sessions 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'XX';