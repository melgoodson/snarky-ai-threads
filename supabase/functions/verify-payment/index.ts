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

    // Get metadata
    const metadata = session.metadata;
    const cartItems = JSON.parse(metadata?.cart_items || "[]");
    const shippingAddress = JSON.parse(metadata?.shipping_address || "{}");
    const userEmail = metadata?.user_email;
    const userId = metadata?.user_id;

    console.log("Creating order for user:", userEmail);

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        user_id: userId,
        email: userEmail,
        total_amount: session.amount_total! / 100, // Convert from cents
        shipping_address: shippingAddress,
        status: "paid",
        fulfillment_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw orderError;
    }

    console.log("Order created:", order.id);

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      printify_product_id: item.printifyProductId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw itemsError;
    }

    console.log("Order items created");

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
          email: userEmail,
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
