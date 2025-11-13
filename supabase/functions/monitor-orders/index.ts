import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Order monitoring agent started");

    // Find all pending orders without Printify order ID
    const { data: pendingOrders, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .is("printify_order_id", null)
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error("Error fetching pending orders:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingOrders?.length || 0} pending orders`);

    const results = [];

    for (const order of pendingOrders || []) {
      try {
        console.log(`Processing order ${order.id}`);

        // Call the create-printify-order function
        const { data, error } = await supabase.functions.invoke(
          "create-printify-order",
          { body: { orderId: order.id } }
        );

        if (error) {
          console.error(`Failed to submit order ${order.id}:`, error);
          results.push({
            orderId: order.id,
            success: false,
            error: error.message,
          });
          
          // Update order status to indicate failure
          await supabase
            .from("orders")
            .update({ status: "failed" })
            .eq("id", order.id);
        } else {
          console.log(`Successfully submitted order ${order.id} to Printify`);
          results.push({
            orderId: order.id,
            success: true,
            printifyOrderId: data?.printifyOrderId,
          });
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`Error processing order ${order.id}:`, error);
        results.push({
          orderId: order.id,
          success: false,
          error: error.message,
        });
      }
    }

    console.log("Order monitoring agent completed:", results);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Order monitoring agent error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
