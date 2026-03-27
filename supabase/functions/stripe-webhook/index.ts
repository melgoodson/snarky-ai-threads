import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// No CORS needed — this is server-to-server (Stripe → Supabase)
serve(async (req) => {
    // Only accept POST
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        // Get the raw body and signature for verification
        const body = await req.text();
        const signature = req.headers.get("stripe-signature");
        const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

        let event: Stripe.Event;

        if (webhookSecret && signature) {
            // Verify the webhook signature (production mode)
            try {
                event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
            } catch (err) {
                console.error("Webhook signature verification failed:", err);
                return new Response(
                    JSON.stringify({ error: "Invalid signature" }),
                    { status: 400 }
                );
            }
        } else {
            // No webhook secret configured — parse event directly (dev/testing mode)
            console.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
            event = JSON.parse(body);
        }

        console.log("Stripe webhook event:", event.type, event.id);

        // Only handle checkout.session.completed
        if (event.type !== "checkout.session.completed") {
            console.log("Ignoring event type:", event.type);
            return new Response(JSON.stringify({ received: true }), { status: 200 });
        }

        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (!orderId) {
            console.error("No order_id in session metadata:", session.id);
            return new Response(
                JSON.stringify({ error: "No order_id in metadata" }),
                { status: 400 }
            );
        }

        console.log("Processing payment for order:", orderId, "Session:", session.id);

        // Check if order is already processed (idempotent)
        const { data: existingOrder } = await supabaseClient
            .from("orders")
            .select("id, status")
            .eq("id", orderId)
            .single();

        if (!existingOrder) {
            console.error("Order not found:", orderId);
            return new Response(
                JSON.stringify({ error: "Order not found" }),
                { status: 404 }
            );
        }

        if (existingOrder.status === "paid" || existingOrder.status === "processing") {
            console.log("Order already processed:", orderId, "status:", existingOrder.status);
            return new Response(
                JSON.stringify({ received: true, already_processed: true }),
                { status: 200 }
            );
        }

        // Update order status to paid and store Stripe payment intent ID
        const paymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent as any)?.id || null;

        const { error: updateError } = await supabaseClient
            .from("orders")
            .update({
                status: "paid",
                fulfillment_status: "pending",
                stripe_payment_intent_id: paymentIntentId,
            })
            .eq("id", orderId);

        if (updateError) {
            console.error("Error updating order:", updateError);
            throw updateError;
        }

        console.log("Order marked as paid:", orderId);

        // Create timeline entry for payment
        try {
            await supabaseClient
                .from("order_notes")
                .insert({
                    order_id: orderId,
                    note_type: "status_change",
                    content: "Payment confirmed via Stripe",
                    metadata: {
                        new_status: "paid",
                        stripe_session_id: session.id,
                        payment_intent_id: paymentIntentId,
                    },
                });
        } catch (noteErr) {
            console.warn("Could not create order note:", noteErr);
        }

        // Trigger Printify order creation (reuse existing function)
        try {
            console.log("Triggering create-printify-order for:", orderId);
            const { data: printifyResult, error: printifyError } =
                await supabaseClient.functions.invoke("create-printify-order", {
                    body: { orderId },
                });

            if (printifyError) {
                console.error("Printify order error:", printifyError);
            } else {
                console.log("Printify order created:", printifyResult);
            }
        } catch (printifyError) {
            console.error("Failed to create Printify order:", printifyError);
            // Don't throw — order is already paid, we'll retry manually if needed
        }

        // Send order confirmation email
        try {
            const { data: order } = await supabaseClient
                .from("orders")
                .select("email, total_amount")
                .eq("id", orderId)
                .single();

            if (order) {
                await supabaseClient.functions.invoke("send-order-confirmation", {
                    body: {
                        orderId,
                        email: order.email,
                        totalAmount: order.total_amount,
                    },
                });
                console.log("Confirmation email sent for:", orderId);
            }
        } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            // Don't throw — non-critical
        }

        return new Response(
            JSON.stringify({ received: true, orderId }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500 }
        );
    }
});
