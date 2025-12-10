-- Fix analytics_page_views RLS policies to be PERMISSIVE
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.analytics_page_views;
DROP POLICY IF EXISTS "Anyone can update page views" ON public.analytics_page_views;

CREATE POLICY "Anyone can insert page views"
ON public.analytics_page_views
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update page views"
ON public.analytics_page_views
FOR UPDATE
TO public
USING (true);