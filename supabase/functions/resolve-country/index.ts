import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Lightweight edge function to resolve visitor country from CDN/proxy headers.
 * 
 * HOW IT WORKS:
 * - Cloudflare (and many CDNs) attach a `cf-ipcountry` header derived from the
 *   connecting IP at the edge. We read that header and return only the country code.
 * - NO IP address is stored, logged, or returned. Only the 2-letter country code.
 * - Falls back to "XX" if no geo header is available.
 *
 * Returns: { country: "US" } (ISO 3166-1 alpha-2)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function validateCountry(code: string | null): string {
  if (!code || code.length !== 2) return "XX";
  const upper = code.toUpperCase();
  // Must be exactly 2 uppercase ASCII letters
  if (/^[A-Z]{2}$/.test(upper)) return upper;
  return "XX";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Try multiple CDN/proxy geo headers (no IP is read or stored)
  const country = validateCountry(
    req.headers.get('cf-ipcountry') ||        // Cloudflare
    req.headers.get('x-vercel-ip-country') ||  // Vercel
    req.headers.get('x-country-code') ||       // Generic CDN header
    null
  );

  return new Response(
    JSON.stringify({ country }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
