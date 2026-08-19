import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { sendSesEmail } from "../_shared/ses.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DirectEmailRequest {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: DirectEmailRequest = await req.json();
    const { to, subject, html, text, from, replyTo, cc, bcc } = body;

    if (!to || (!html && !text) || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, and either html or text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const defaultFrom = Deno.env.get("AWS_SES_FROM_EMAIL") || Deno.env.get("SES_FROM_EMAIL") || "Snarky Humans <hello@snarkyhumans.com>";
    const fromAddress = from || defaultFrom;
    const replyToAddress = replyTo || "support@snarkyhumans.com";

    // 1. Try sending via Amazon SES
    const sesResult = await sendSesEmail({
      to,
      from: fromAddress,
      subject,
      html,
      text,
      replyTo: replyToAddress,
      cc,
      bcc,
    });

    if (sesResult.success) {
      console.log(`[send-email] Email sent via Amazon SES: to=${Array.isArray(to) ? to.join(",") : to}, msgId=${sesResult.messageId}`);
      return new Response(
        JSON.stringify({ success: true, provider: "ses", messageId: sesResult.messageId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.warn(`[send-email] SES send failed: ${sesResult.error}. Checking Resend fallback...`);

    // 2. Fallback to Resend if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const { data, error } = await resend.emails.send({
          from: fromAddress,
          replyTo: replyToAddress,
          to: Array.isArray(to) ? to : [to],
          subject,
          html: html || text,
          text: text,
        });

        if (error) {
          console.error("[send-email] Resend fallback error:", error);
          return new Response(
            JSON.stringify({ error: "Failed to send email via both SES and Resend", sesError: sesResult.error, resendError: error }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[send-email] Email sent via Resend fallback: id=${data?.id}`);
        return new Response(
          JSON.stringify({ success: true, provider: "resend", id: data?.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (resendEx: any) {
        console.error("[send-email] Resend fallback exception:", resendEx);
      }
    }

    return new Response(
      JSON.stringify({ error: "Failed to send email via Amazon SES", detail: sesResult.error }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[send-email] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
