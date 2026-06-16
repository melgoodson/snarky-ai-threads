import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    const { email, password, type, redirectTo } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type !== "signup" && type !== "magiclink") {
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be 'signup' or 'magiclink'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "signup" && (!password || password.length < 6)) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("[send-auth-email] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(RESEND_API_KEY);

    console.log(`[send-auth-email] Generating link of type '${type}' for email: ${email}`);

    // Generate link via Supabase Auth Admin API
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type,
      email,
      password: type === "signup" ? password : undefined,
      options: {
        redirectTo: redirectTo || `${new URL(req.url).origin}/`,
      },
    });

    if (linkError) {
      console.error("[send-auth-email] generateLink error:", linkError);
      return new Response(
        JSON.stringify({ error: linkError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const actionLink = linkData?.properties?.action_link;
    if (!actionLink) {
      console.error("[send-auth-email] No action link generated in properties", linkData);
      return new Response(
        JSON.stringify({ error: "Failed to generate authorization link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare Branded Email Template
    const subject = type === "signup"
      ? "Verify your Snarky Humans account 😈"
      : "Your Snarky Humans Magic Sign-In Link ⚡";

    const titleText = type === "signup"
      ? "WELCOME TO THE SNARKY PACK."
      : "BACK FOR MORE SNARK?";

    const bodyText = type === "signup"
      ? "You just registered an account. Click the button below to confirm your email and complete your registration. (We promise we don't spam, we are only snarky.)"
      : "Click the button below to sign in instantly. No password required. Easy as that.";

    const buttonLabel = type === "signup"
      ? "CONFIRM REGISTRATION"
      : "SIGN IN INSTANTLY";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:12px;overflow:hidden;border:1px solid #222;">
          <!-- Header -->
          <tr>
            <td style="background:#C0392B;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;color:rgba(255,255,255,0.6);text-transform:uppercase;">Snarky A$$ Humans</p>
              <h1 style="margin:12px 0 0;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;line-height:1.1;">AUTHENTICATION</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <h2 style="margin:0 0 16px;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${titleText}</h2>
              <p style="margin:0 0 24px;font-size:16px;color:#aaaaaa;line-height:1.6;">
                ${bodyText}
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${actionLink}"
                 style="display:inline-block;background:#C0392B;color:#ffffff;font-size:14px;font-weight:900;letter-spacing:0.05em;text-decoration:none;padding:14px 28px;border-radius:8px;">
                → ${buttonLabel}
              </a>
              <p style="margin:24px 0 0;font-size:12px;color:#666666;line-height:1.5;word-break:break-all;text-align:left;">
                If the button doesn't work, copy and paste this URL into your browser:<br />
                <a href="${actionLink}" style="color:#C0392B;text-decoration:underline;">${actionLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer Info -->
          <tr>
            <td style="padding:0 40px 32px;border-top:1px solid #222;margin-top:8px;">
              <p style="margin:24px 0 4px;font-size:14px;color:#cccccc;">Need help?</p>
              <p style="margin:0;font-size:13px;color:#666666;font-style:italic;">Reply to this email or reach out to support@snarkyazzhumans.com.</p>
            </td>
          </tr>

          <!-- Footer Base -->
          <tr>
            <td style="padding:20px 40px;background:#0d0d0d;text-align:center;">
              <p style="margin:0;font-size:11px;color:#444444;line-height:1.6;">
                This link was requested for authentication on SnarkyAzzHumans.com.<br />
                If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send the email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Snarky Humans <hello@snarkyazzhumans.com>",
      replyTo: "support@snarkyazzhumans.com",
      to: [email],
      subject,
      html,
    });

    if (emailError) {
      console.error("[send-auth-email] Resend error:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email", detail: emailError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-auth-email] Email sent successfully to ${email}, id=${emailData?.id}`);
    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[send-auth-email] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
