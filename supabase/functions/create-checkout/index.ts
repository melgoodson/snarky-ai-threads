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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    console.log("Starting checkout process...");
    
    // Try to get authenticated user, but allow guest checkout
    let user = null;
    let userEmail = null;
    let userId = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        user = data.user;
        userEmail = user?.email;
        userId = user?.id;
        console.log("User authenticated:", userEmail);
      } catch (error) {
        console.log("No authenticated user, proceeding as guest");
      }
    }

    const { cartItems, shippingAddress } = await req.json();
    
    // Use email from shipping address if user not authenticated
    if (!userEmail && shippingAddress?.email) {
      userEmail = shippingAddress.email;
      console.log("Guest checkout with email:", userEmail);
    }
    
    if (!userEmail) {
      throw new Error("Email is required for checkout");
    }
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    console.log("Cart items:", cartItems);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
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

    // Store order data in metadata to retrieve after payment
    const metadata = {
      user_id: userId || "",
      user_email: userEmail,
      cart_items: JSON.stringify(cartItems),
      shipping_address: JSON.stringify(shippingAddress),
    };

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
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
