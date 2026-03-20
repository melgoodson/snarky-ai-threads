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
        const { email } = await req.json();

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return new Response(
                JSON.stringify({ error: "Valid email is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (!RESEND_API_KEY) {
            console.error("[send-welcome-email] RESEND_API_KEY not configured");
            return new Response(
                JSON.stringify({ error: "Email service not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const resend = new Resend(RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: "Snarky Humans <hello@snarkyazzhumans.com>",
            replyTo: "support@snarkyazzhumans.com",
            to: [email],
            subject: "You're officially one of us. Here's what happens next. 😈",
            html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Snarky Humans</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:12px;overflow:hidden;border:1px solid #222;">

          <!-- Header -->
          <tr>
            <td style="background:#C0392B;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;color:rgba(255,255,255,0.6);text-transform:uppercase;">Snarky A$$ Apparel</p>
              <h1 style="margin:12px 0 0;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;line-height:1.1;">WEAR YOUR ATTITUDE</h1>
            </td>
          </tr>

          <!-- Hero text -->
          <tr>
            <td style="padding:40px 40px 8px;">
              <h2 style="margin:0 0 16px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">YOU'RE IN. DON'T BLOW IT.</h2>
              <p style="margin:0 0 16px;font-size:16px;color:#aaaaaa;line-height:1.6;">Hey you,</p>
              <p style="margin:0 0 16px;font-size:16px;color:#aaaaaa;line-height:1.6;">
                Congrats — you just joined the most unapologetically snarky community on the internet.
                We're talking the people who say what everyone else is thinking, slap it on a shirt, and laugh about it.
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#cccccc;font-weight:600;">You made a good call.</p>
            </td>
          </tr>

          <!-- Perks list -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;">
                <tr><td style="padding:24px 24px 8px;">
                  <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:0.15em;color:#C0392B;text-transform:uppercase;">What being on the list actually means</p>
                </td></tr>
                <tr><td style="padding:0 24px 12px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">🔥 <strong style="color:#ffffff;">First look at new drops</strong> — before anyone else sees them</p>
                </td></tr>
                <tr><td style="padding:0 24px 12px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">🎁 <strong style="color:#ffffff;">Free stuff</strong> — actual free merch. We run giveaways for subscribers only.</p>
                </td></tr>
                <tr><td style="padding:0 24px 12px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">💸 <strong style="color:#ffffff;">Promo codes that aren't garbage</strong> — real discounts, not 5% off</p>
                </td></tr>
                <tr><td style="padding:0 24px 12px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">🎨 <strong style="color:#ffffff;">Free AI design credits</strong> — to use our custom design tool on us</p>
                </td></tr>
                <tr><td style="padding:0 24px 20px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">🚨 <strong style="color:#ffffff;">Limited runs and collabs</strong> — gone when they're gone. You'll know first.</p>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:15px;color:#888888;line-height:1.6;font-style:italic;">
                We won't email you every day. We're not that desperate. But when we do send something, it's going to be worth opening.
              </p>
            </td>
          </tr>

          <!-- CTAs -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <p style="margin:0 0 20px;font-size:15px;color:#aaaaaa;">In the meantime, go make something ridiculous:</p>
              <a href="https://snarkyazzhumans.com/custom-design"
                 style="display:inline-block;background:#C0392B;color:#ffffff;font-size:14px;font-weight:900;letter-spacing:0.05em;text-decoration:none;padding:14px 28px;border-radius:8px;margin-bottom:12px;">
                → DESIGN SOMETHING CUSTOM
              </a>
              <br />
              <a href="https://snarkyazzhumans.com/collections"
                 style="display:inline-block;color:#C0392B;font-size:14px;font-weight:700;text-decoration:none;padding:8px 0;">
                Or browse what's already killing it →
              </a>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding:0 40px 32px;border-top:1px solid #222;margin-top:8px;">
              <p style="margin:24px 0 4px;font-size:15px;color:#cccccc;">Stay snarky,</p>
              <p style="margin:0 0 4px;font-size:15px;color:#ffffff;font-weight:700;">The Snarky Humans Team</p>
              <p style="margin:0;font-size:13px;color:#666666;font-style:italic;">We're Snarky. Not Shady.™</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#0d0d0d;text-align:center;">
              <p style="margin:0;font-size:12px;color:#444444;line-height:1.6;">
                You signed up at SnarkyAzzHumans.com.<br />
                If someone signed you up as a prank — honestly, fair play.<br />
                <a href="https://snarkyazzhumans.com/unsubscribe" style="color:#555555;">Unsubscribe here</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        });

        if (error) {
            console.error("[send-welcome-email] Resend error:", error);
            return new Response(
                JSON.stringify({ error: "Failed to send welcome email", detail: error }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`[send-welcome-email] Sent to ${email}, id=${data?.id}`);
        return new Response(
            JSON.stringify({ success: true, id: data?.id }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error("[send-welcome-email] Unhandled error:", err);
        return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
