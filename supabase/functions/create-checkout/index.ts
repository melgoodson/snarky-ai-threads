import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product to price mapping
const PRODUCT_PRICES: Record<string, string> = {
  "t-shirt": "price_1SUStmJDOzG265rpCrUfdGg4", // $39.99
  "hoodie": "price_1SUT2AJDOzG265rpCI9semlI", // $69.99
  "mug": "price_1SUT2oJDOzG265rpJZeCVu2p", // $19.99
  "card": "price_1SUT3UJDOzG265rpgWPFIK8h", // $8.99
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key to bypass RLS since we verify auth ourselves
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("Starting checkout process...");
    
    // Require authentication for checkout
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentication required for checkout");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError);
      throw new Error("Authentication required for checkout");
    }
    
    console.log("User authenticated:", user.email);

    const { cartItems, shippingAddress } = await req.json();
    
    if (!user.email) {
      throw new Error("User email is required for checkout");
    }
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    console.log("Cart items:", cartItems);

    // Calculate total
    const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Create order in database FIRST to avoid Stripe metadata size limits
    const { data: orderData, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        user_id: user.id,
        email: user.email,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error("Failed to create order:", orderError);
      throw new Error("Failed to create order in database");
    }

    console.log("Order created:", orderData.id);

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.productId,
      printify_product_id: item.printifyProductId || "placeholder",
      variant_id: item.variantId || "placeholder",
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Failed to create order items:", itemsError);
      throw new Error("Failed to create order items");
    }

    console.log("Order items created");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    }

    // Convert cart items to Stripe line items
    const lineItems = cartItems.map((item: any) => {
      // Determine product type from title (with safe fallback)
      let productType = "t-shirt"; // default
      const title = (item.title || "").toLowerCase();
      if (title.includes("hoodie") || title.includes("sweatshirt")) productType = "hoodie";
      else if (title.includes("mug")) productType = "mug";
      else if (title.includes("card")) productType = "card";

      return {
        price: PRODUCT_PRICES[productType],
        quantity: item.quantity,
      };
    });

    console.log("Line items:", lineItems);

    // Only store order ID in metadata (stays well under 500 char limit)
    const metadata = {
      order_id: orderData.id,
    };

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/order-confirmation/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata,
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
