import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    console.log("Verifying payment...");
    
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log("Session retrieved:", session.id, "Payment status:", session.payment_status);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Get order ID from metadata (order was created before checkout)
    const metadata = session.metadata;
    const orderId = metadata?.order_id;

    if (!orderId) {
      throw new Error("Order ID not found in session metadata");
    }

    console.log("Updating order status to paid:", orderId);

    // Update order status from pending to paid
    const { data: order, error: updateError } = await supabaseClient
      .from("orders")
      .update({ 
        status: "paid",
        fulfillment_status: "pending"
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError || !order) {
      console.error("Error updating order:", updateError);
      throw updateError || new Error("Order not found");
    }

    console.log("Order status updated to paid");

    // Trigger Printify order creation
    try {
      console.log("Creating Printify order...");
      const { data: printifyResult, error: printifyError } = await supabaseClient.functions.invoke(
        "create-printify-order",
        {
          body: { orderId: order.id },
        }
      );

      if (printifyError) {
        console.error("Error creating Printify order:", printifyError);
      } else {
        console.log("Printify order created:", printifyResult);
      }
    } catch (printifyError) {
      console.error("Failed to create Printify order:", printifyError);
      // Don't throw - order is already created and paid
    }

    // Send confirmation email
    try {
      await supabaseClient.functions.invoke("send-order-confirmation", {
        body: {
          orderId: order.id,
          email: order.email,
          totalAmount: order.total_amount,
        },
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't throw - order is already created
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in verify-payment:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
