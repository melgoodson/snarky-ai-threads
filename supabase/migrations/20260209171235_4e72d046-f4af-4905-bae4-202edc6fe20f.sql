
-- Add traffic_source_type and entry_page_path to analytics_sessions (additive, nullable)
ALTER TABLE public.analytics_sessions
  ADD COLUMN IF NOT EXISTS traffic_source_type text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS entry_page_path text DEFAULT NULL;

-- Add indexes for grouping queries
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_country ON public.analytics_sessions (started_at, country);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_device ON public.analytics_sessions (started_at, device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_os ON public.analytics_sessions (started_at, os);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_browser ON public.analytics_sessions (started_at, browser);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_source ON public.analytics_sessions (started_at, traffic_source_type);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_path ON public.analytics_page_views (viewed_at, path);
