-- Drop existing analytics tables to recreate with new structure
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.analytics_sessions CASCADE;

-- Create analytics_sessions table
CREATE TABLE public.analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  device_type text,
  browser text,
  os text,
  screen_width integer,
  screen_height integer,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  is_bounce boolean DEFAULT true
);

-- Create analytics_page_views table
CREATE TABLE public.analytics_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  path text NOT NULL,
  title text,
  load_time_ms integer,
  time_on_page_ms integer,
  scroll_depth integer,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics_sessions
CREATE POLICY "Anyone can insert sessions"
ON public.analytics_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
ON public.analytics_sessions FOR UPDATE
USING (true);

CREATE POLICY "Admins can view sessions"
ON public.analytics_sessions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for analytics_page_views
CREATE POLICY "Anyone can insert page views"
ON public.analytics_page_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update page views"
ON public.analytics_page_views FOR UPDATE
USING (true);

CREATE POLICY "Admins can view page views"
ON public.analytics_page_views FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_sessions_visitor_id ON public.analytics_sessions(visitor_id);
CREATE INDEX idx_sessions_started_at ON public.analytics_sessions(started_at);
CREATE INDEX idx_page_views_session_id ON public.analytics_page_views(session_id);
CREATE INDEX idx_page_views_viewed_at ON public.analytics_page_views(viewed_at);