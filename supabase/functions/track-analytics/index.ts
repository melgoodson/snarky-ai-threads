import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const {
            clientId,
            visitorId,
            pageUrl,
            pageTitle,
            referrer,
            utmSource,
            utmMedium,
            utmCampaign,
        } = body;

        if (!clientId || !visitorId || !pageUrl) {
            return new Response(
                JSON.stringify({ error: "clientId, visitorId, and pageUrl are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Parse the page path from the full URL
        let pagePath = "/";
        try {
            pagePath = new URL(pageUrl).pathname;
        } catch {
            pagePath = pageUrl;
        }

        // Insert into analytics_page_views (existing table)
        // We create a synthetic session_id from the visitorId + date
        const today = new Date().toISOString().slice(0, 10);
        const sessionId = `${visitorId}-${today}`;

        const { error: pvError } = await supabase
            .from("analytics_page_views")
            .insert({
                session_id: sessionId,
                path: pagePath,
                title: pageTitle || null,
            });

        if (pvError) {
            console.error("Page view insert error:", pvError);
        }

        // Upsert session — only insert if this session_id doesn't exist yet
        const { data: existingSession } = await supabase
            .from("analytics_sessions")
            .select("id")
            .eq("session_id", sessionId)
            .maybeSingle();

        if (!existingSession) {
            const { error: sessError } = await supabase
                .from("analytics_sessions")
                .insert({
                    visitor_id: visitorId,
                    session_id: sessionId,
                    referrer: referrer || null,
                    utm_source: utmSource || null,
                    utm_medium: utmMedium || null,
                    utm_campaign: utmCampaign || null,
                    traffic_source_type: classifySource(utmSource, utmMedium, referrer),
                    entry_page_path: pagePath,
                    is_bounce: true,
                });

            if (sessError) {
                console.error("Session insert error:", sessError);
            }
        } else {
            // Mark as not a bounce since the visitor viewed another page
            await supabase
                .from("analytics_sessions")
                .update({ is_bounce: false, ended_at: new Date().toISOString() })
                .eq("session_id", sessionId);
        }

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    } catch (error) {
        console.error("Track analytics error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }
});

function classifySource(
    utmSource: string | null,
    utmMedium: string | null,
    referrer: string | null,
): string {
    if (utmSource || utmMedium) {
        const medium = (utmMedium || "").toLowerCase();
        if (["cpc", "ppc", "paid", "paidsearch", "paidsocial", "display"].includes(medium)) return "paid";
        if (medium === "email") return "email";
        if (medium === "social") return "social";
        return "referral";
    }

    if (!referrer) return "direct";

    try {
        const refHost = new URL(referrer).hostname.toLowerCase();
        if (["google.", "bing.", "yahoo.", "duckduckgo.", "baidu."].some((d) => refHost.includes(d))) return "organic";
        if (["facebook.", "instagram.", "twitter.", "t.co", "tiktok.", "youtube.", "reddit.", "pinterest.", "linkedin."].some((d) => refHost.includes(d))) return "social";
        return "referral";
    } catch {
        return "referral";
    }
}
