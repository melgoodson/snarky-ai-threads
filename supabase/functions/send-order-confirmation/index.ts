import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  orderId: string;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, orderId, totalAmount }: EmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Your Store <onboarding@resend.dev>",
      to: [email],
      subject: "Order Confirmation - Thank You!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7C3AED;">Order Confirmed!</h1>
          <p>Thank you for your order. We're excited to create your custom product!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total:</strong> $${totalAmount.toFixed(2)}</p>
          </div>
          
          <div style="background: #EDE9FE; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What's Next?</h3>
            <p>🎨 Your custom design is being prepared for printing</p>
            <p>📦 Expected delivery: 5-7 business days</p>
            <p>📧 You'll receive tracking information once shipped</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Questions? Reply to this email and we'll help you out!
          </p>
        </div>
      `,
    });

    console.log("Order confirmation email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);