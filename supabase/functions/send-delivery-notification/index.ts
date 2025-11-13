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
    const { email, orderId } = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

    const emailResponse = await resend.emails.send({
      from: "Your Store <onboarding@resend.dev>",
      to: [email],
      subject: "Your Order Has Been Delivered! 🎁",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Your Order Has Arrived! 🎉</h1>
          <p>Your custom design has been delivered. We hope you love it!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Status:</strong> Delivered ✅</p>
          </div>
          
          <div style="background: #EDE9FE; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>We'd Love Your Feedback!</h3>
            <p>🌟 How do you like your custom design?</p>
            <p>📸 Share a photo with us on social media!</p>
            <p>💬 Any issues? We're here to help</p>
          </div>
          
          <p style="margin-top: 30px;">
            Thank you for your order! We hope to see you again soon.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Questions or concerns? Reply to this email anytime!
          </p>
        </div>
      `,
    });

    console.log("Delivery notification sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending delivery notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
