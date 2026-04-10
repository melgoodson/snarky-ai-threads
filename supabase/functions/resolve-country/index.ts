import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Resolve visitor country using ip-api.com (free, no key required).
 *
 * HOW IT WORKS:
 * - Supabase edge functions don't pass CDN geo headers (cf-ipcountry etc.)
 *   so we extract the caller IP from x-forwarded-for / x-real-ip and call
 *   ip-api.com to get the country code.
 * - NO IP address is stored, logged, or returned — only the 2-letter country code.
 * - Falls back to "XX" if resolution fails.
 *
 * Returns: { country: "US" } (ISO 3166-1 alpha-2)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function validateCountry(code: string | null): string {
  if (!code || code.length !== 2) return 'XX';
  const upper = code.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) return upper;
  return 'XX';
}

function extractIp(req: Request): string | null {
  // x-forwarded-for may contain a comma-separated list; take the first (client) IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }
  return req.headers.get('x-real-ip') ?? null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. Try CDN geo headers first (works if ever deployed behind Cloudflare/Vercel)
  const cdnCountry = validateCountry(
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('x-country-code') ||
    null
  );

  if (cdnCountry !== 'XX') {
    return new Response(
      JSON.stringify({ country: cdnCountry }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 2. Fallback: resolve via ip-api.com using the caller IP
  //    Only the country code is extracted — IP is never stored or returned.
  try {
    const ip = extractIp(req);
    // ip-api.com returns '::1' or similar for loopback (local dev) — skip those
    if (ip && !ip.startsWith('127.') && !ip.startsWith('::') && ip !== 'localhost') {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
        signal: AbortSignal.timeout(3000),
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const country = validateCountry(geoData?.countryCode ?? null);
        return new Response(
          JSON.stringify({ country }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch {
    // Silently fall through to XX
  }

  return new Response(
    JSON.stringify({ country: 'XX' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

