import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        const { orderId } = await req.json();

        if (!orderId) {
            throw new Error("Order ID is required");
        }

        // Validate it looks like a UUID to avoid abuse
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID_RE.test(orderId)) {
            throw new Error("Invalid order ID format");
        }

        console.log("Fetching order status for:", orderId);

        const { data: order, error } = await supabaseClient
            .from("orders")
            .select("id, email, total_amount, status, created_at, shipping_address")
            .eq("id", orderId)
            .single();

        if (error || !order) {
            console.error("Order not found:", error);
            throw new Error("Order not found");
        }

        // Mask email for privacy (show first 2 chars + domain)
        const maskedEmail = order.email
            ? order.email.replace(/^(.{2})(.*)(@.*)$/, "$1***$3")
            : null;

        return new Response(
            JSON.stringify({
                order: {
                    ...order,
                    email: maskedEmail,
                },
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error in get-order-status:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: error instanceof Error && error.message === "Order not found" ? 404 : 500,
        });
    }
});
