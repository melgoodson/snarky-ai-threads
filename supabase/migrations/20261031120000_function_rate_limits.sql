-- Per-caller rate limiting for public edge functions that call paid APIs
-- (Gemini image generation, Printify product creation).
-- Only the service role (used inside edge functions) can touch this.

CREATE TABLE IF NOT EXISTS public.function_rate_limits (
  bucket        TEXT        NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  request_count INTEGER     NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);

ALTER TABLE public.function_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.function_rate_limits FROM anon, authenticated;

-- Counts one request against p_bucket in the current fixed window and
-- returns true while the caller is still within p_limit.
CREATE OR REPLACE FUNCTION public.hit_rate_limit(p_bucket TEXT, p_limit INTEGER, p_window_seconds INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window TIMESTAMPTZ := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  v_count  INTEGER;
BEGIN
  INSERT INTO public.function_rate_limits AS r (bucket, window_start, request_count)
  VALUES (p_bucket, v_window, 1)
  ON CONFLICT (bucket, window_start) DO UPDATE SET request_count = r.request_count + 1
  RETURNING request_count INTO v_count;

  -- Occasional cleanup of old windows
  IF random() < 0.01 THEN
    DELETE FROM public.function_rate_limits WHERE window_start < now() - INTERVAL '1 day';
  END IF;

  RETURN v_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.hit_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
