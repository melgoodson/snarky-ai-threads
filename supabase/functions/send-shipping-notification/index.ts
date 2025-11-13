import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, orderId, trackingNumber, trackingUrl } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

    const emailResponse = await resend.emails.send({
      from: "Your Store <onboarding@resend.dev>",
      to: [email],
      subject: "Your Order Has Shipped! 📦",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Your Order is On The Way! 🎉</h1>
          <p>Great news! Your custom design has been shipped and is heading your way.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Tracking Information</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Tracking Number:</strong> ${trackingNumber || "Will be available soon"}</p>
            ${trackingUrl ? `<p><a href="${trackingUrl}" style="color: #7c3aed; text-decoration: none; font-weight: bold;">Track Your Package →</a></p>` : ""}
          </div>
          
          <div style="background: #EDE9FE; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What's Next?</h3>
            <p>📦 Your package is in transit</p>
            <p>🚚 Estimated delivery: 3-7 business days</p>
            <p>📧 You'll receive a confirmation once delivered</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Questions about your order? Reply to this email and we'll help!
          </p>
        </div>
      `,
    });

    console.log("Shipping notification sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending shipping notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
