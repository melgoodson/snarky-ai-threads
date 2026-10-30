import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Per-IP rate limit for public functions that call paid APIs, backed by
// public.hit_rate_limit (see migration 20261031120000_function_rate_limits).
// IPs are stored only as truncated SHA-256 hashes. Fails open: if the client
// IP is missing or the database call errors, the request is allowed.
export async function rateLimit(
  req: Request,
  corsHeaders: Record<string, string>,
  fn: string,
  limit: number,
  windowSeconds = 3600,
): Promise<Response | null> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!ip) return null;

  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
    const ipHash = [...new Uint8Array(digest)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: allowed, error } = await supabase.rpc('hit_rate_limit', {
      p_bucket: `${fn}:${ipHash}`,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error(`[rate-limit] ${fn}: ${error.message}`);
      return null;
    }
    if (allowed === false) {
      console.warn(`[rate-limit] ${fn}: limit ${limit}/${windowSeconds}s exceeded`);
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(windowSeconds) },
      });
    }
  } catch (e) {
    console.error(`[rate-limit] ${fn}:`, e);
  }
  return null;
}
