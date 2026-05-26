import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Default fallback Pixel ID
const DEFAULT_PIXEL_ID = "D869S2RC77UBE9T94SV0";

// Standard SHA-256 Hashing helper
async function sha256(text: string): Promise<string> {
  const normalized = text.trim().toLowerCase();
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Phone number normalization and hashing
async function hashPhone(phone: string): Promise<string> {
  // Remove non-numeric characters, preserving '+' for country codes
  const normalized = phone.replace(/[^\d+]/g, "");
  return sha256(normalized);
}

function isSha256(str: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(str);
}

async function hashIfNeeded(
  value: string | undefined | null,
  type: "email" | "phone" | "external_id"
): Promise<string | null> {
  if (!value) return null;
  const trimmed = value.trim();
  if (isSha256(trimmed)) return trimmed.toLowerCase();

  if (type === "email") {
    return sha256(trimmed);
  } else if (type === "phone") {
    return hashPhone(trimmed);
  } else {
    return sha256(trimmed);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      event,
      event_id,
      timestamp,
      test_event_code,
      context = {},
      properties = {},
    } = body;

    if (!event) {
      return new Response(
        JSON.stringify({ error: "Missing event name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve environment variables
    const pixelId = Deno.env.get("TIKTOK_PIXEL_ID") || DEFAULT_PIXEL_ID;
    const accessToken = Deno.env.get("TIKTOK_ACCESS_TOKEN");

    // Gather client details from headers
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim();
    const userAgent = req.headers.get("user-agent");

    // Extract user info
    const userEmail = context.user?.email || null;
    const userPhone = context.user?.phone_number || context.user?.phone || null;
    const userExtId = context.user?.external_id || null;

    // Hash sensitive customer parameters
    const hashedEmail = await hashIfNeeded(userEmail, "email");
    const hashedPhone = await hashIfNeeded(userPhone, "phone");
    const hashedExtId = await hashIfNeeded(userExtId, "external_id");

    // Build the request payload for TikTok Events API
    const tiktokPayload: Record<string, any> = {
      pixel_code: pixelId,
      event,
      event_id: event_id || crypto.randomUUID(),
      timestamp: timestamp || new Date().toISOString(),
      test_event_code: test_event_code || Deno.env.get("TIKTOK_TEST_EVENT_CODE") || null,
      context: {
        ad: {
          callback: context.ad?.callback || null,
        },
        user: {
          email: hashedEmail,
          phone_number: hashedPhone,
          external_id: hashedExtId,
          ip: ip || context.user?.ip || null,
          user_agent: userAgent || context.user?.user_agent || null,
          ttp: context.user?.ttp || null,
        },
        page: {
          url: context.page?.url || null,
          referrer: context.page?.referrer || null,
        },
      },
      properties: {
        value: properties.value !== undefined ? Number(properties.value) : null,
        currency: properties.currency || "USD",
        query: properties.query || null,
        contents: Array.isArray(properties.contents)
          ? properties.contents.map((item: any) => ({
              price: item.price !== undefined ? Number(item.price) : null,
              quantity: item.quantity !== undefined ? Number(item.quantity) : null,
              content_id: item.content_id ? String(item.content_id) : null,
              content_type: item.content_type || "product",
              content_name: item.content_name || null,
            }))
          : [],
      },
    };

    console.log(`[TikTok Events API] Payload built for "${event}":`, JSON.stringify(tiktokPayload, null, 2));

    if (!accessToken) {
      console.warn("[TikTok Events API] TIKTOK_ACCESS_TOKEN is missing. Event logged but not forwarded.");
      return new Response(
        JSON.stringify({
          success: true,
          status: "debug_mode",
          message: "Event logged successfully (Access Token is missing).",
          payload: tiktokPayload,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call TikTok business API
    const tikTokRes = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tiktokPayload),
    });

    const tikTokData = await tikTokRes.json();
    console.log("[TikTok Events API] Response status:", tikTokRes.status, tikTokData);

    if (!tikTokRes.ok) {
      console.error("[TikTok Events API] Error returned from TikTok:", tikTokData);
      return new Response(
        JSON.stringify({
          success: false,
          error: tikTokData?.message || "Failed to forward event to TikTok",
        }),
        { status: tikTokRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        tiktok_response: tikTokData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[TikTok Events API] Handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
