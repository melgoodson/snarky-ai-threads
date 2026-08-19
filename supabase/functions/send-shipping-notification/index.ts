import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { sendSesEmail } from "../_shared/ses.ts";

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

    const fromEmail = Deno.env.get("AWS_SES_FROM_EMAIL") || Deno.env.get("SES_FROM_EMAIL") || "Snarky Humans <hello@snarkyhumans.com>";
    const replyToEmail = "support@snarkyhumans.com";

    const customerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Order Shipped — Snarky Humans</title>
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
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;color:rgba(255,255,255,0.6);text-transform:uppercase;">Snarky Humans</p>
              <h1 style="margin:12px 0 0;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;line-height:1.1;">YOUR ORDER SHIPPED</h1>
            </td>
          </tr>

          <!-- Hero text -->
          <tr>
            <td style="padding:40px 40px 8px;">
              <h2 style="margin:0 0 16px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">IT'S ON THE WAY. 🚀</h2>
              <p style="margin:0 0 16px;font-size:16px;color:#aaaaaa;line-height:1.6;">
                Your custom gear just left the building. It's out there in the world now, making its way to your door. We're honestly a little jealous.
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#cccccc;font-weight:600;">Get ready to flex.</p>
            </td>
          </tr>

          <!-- Tracking details -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;">
                <tr><td style="padding:24px 24px 8px;">
                  <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:0.15em;color:#C0392B;text-transform:uppercase;">Tracking Info</p>
                </td></tr>
                <tr><td style="padding:0 24px 12px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">🧾 <strong style="color:#ffffff;">Order ID:</strong> ${orderId}</p>
                </td></tr>
                <tr><td style="padding:0 24px 20px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">📦 <strong style="color:#ffffff;">Tracking Number:</strong> ${trackingNumber || "Will be available soon"}</p>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- Track CTA (if tracking URL available) -->
          ${trackingUrl ? `
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="${trackingUrl}"
                 style="display:inline-block;background:#C0392B;color:#ffffff;font-size:14px;font-weight:900;letter-spacing:0.05em;text-decoration:none;padding:14px 28px;border-radius:8px;">
                → TRACK YOUR PACKAGE
              </a>
            </td>
          </tr>
          ` : ""}

          <!-- What's Next -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;">
                <tr><td style="padding:24px 24px 8px;">
                  <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:0.15em;color:#C0392B;text-transform:uppercase;">What happens next</p>
                </td></tr>
                <tr><td style="padding:0 24px 12px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">📦 <strong style="color:#ffffff;">Your package is in transit</strong> — it's on its way</p>
                </td></tr>
                <tr><td style="padding:0 24px 12px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">🚚 <strong style="color:#ffffff;">Estimated delivery:</strong> 3-7 business days</p>
                </td></tr>
                <tr><td style="padding:0 24px 20px;">
                  <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">📸 <strong style="color:#ffffff;">Show it off</strong> — tag us when it arrives, we love seeing it</p>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- Browse CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <p style="margin:0 0 20px;font-size:15px;color:#aaaaaa;">Already planning your next piece?</p>
              <a href="https://snarkyhumans.com/custom-design"
                 style="display:inline-block;background:#C0392B;color:#ffffff;font-size:14px;font-weight:900;letter-spacing:0.05em;text-decoration:none;padding:14px 28px;border-radius:8px;margin-bottom:12px;">
                → DESIGN SOMETHING NEW
              </a>
              <br />
              <a href="https://snarkyhumans.com/collections"
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
                You placed an order at SnarkyHumans.com.<br />
                Questions? Just reply to this email — we've got you.<br />
                <a href="https://snarkyhumans.com" style="color:#555555;">snarkyhumans.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Alert — Snarky Humans</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:12px;overflow:hidden;border:1px solid #C0392B;">
          <!-- Header -->
          <tr>
            <td style="background:#C0392B;padding:24px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;color:rgba(255,255,255,0.8);text-transform:uppercase;">Admin Alert</p>
              <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">ORDER IN TRANSIT 🚀</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#cccccc;line-height:1.6;">Another masterpiece has left the building.</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:8px;border:1px solid #2a2a2a;">
                <tr><td style="padding:24px;">
                  <p style="margin:0 0 12px;font-size:15px;color:#cccccc;">🧾 <strong style="color:#ffffff;">Order ID:</strong> ${orderId}</p>
                  <p style="margin:0 0 12px;font-size:15px;color:#cccccc;">📧 <strong style="color:#ffffff;">Customer:</strong> ${email}</p>
                  <p style="margin:0 0 12px;font-size:15px;color:#cccccc;">📦 <strong style="color:#ffffff;">Tracking:</strong> ${trackingNumber || "N/A"}</p>
                  <p style="margin:0;font-size:15px;color:#cccccc;">🔗 <strong style="color:#ffffff;">URL:</strong> ${trackingUrl || "N/A"}</p>
                </td></tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#666666;font-style:italic;">Stay snarky. The mail carrier is watching.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 1. Send customer notification via Amazon SES
    const customerSesResult = await sendSesEmail({
      from: fromEmail,
      replyTo: replyToEmail,
      to: [email],
      subject: "Your snarky gear just shipped. 📦",
      html: customerHtml,
    });

    let customerSent = false;
    let customerResultData: any = customerSesResult;

    if (customerSesResult.success) {
      customerSent = true;
      console.log(`[send-shipping-notification] Shipping email sent via SES to ${email}, msgId=${customerSesResult.messageId}`);
    } else {
      console.warn(`[send-shipping-notification] SES failed for customer: ${customerSesResult.error}. Attempting Resend fallback...`);
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          const resendResponse = await resend.emails.send({
            from: fromEmail,
            replyTo: replyToEmail,
            to: [email],
            subject: "Your snarky gear just shipped. 📦",
            html: customerHtml,
          });
          customerSent = true;
          customerResultData = resendResponse;
          console.log(`[send-shipping-notification] Shipping email sent via Resend to ${email}`);
        } catch (resendErr) {
          console.error("[send-shipping-notification] Resend customer send failed:", resendErr);
        }
      }
    }

    // 2. Send admin notification via Amazon SES
    const adminEmails = ["teamsienvi@gmail.com", "sienviclientmelgoodson@gmail.com"];
    const adminSesResult = await sendSesEmail({
      from: fromEmail,
      to: adminEmails,
      subject: `[INTERNAL] Order Shipped: ${orderId}`,
      html: adminHtml,
    });

    if (adminSesResult.success) {
      console.log(`[send-shipping-notification] Admin alert sent via SES for order ${orderId}`);
    } else {
      console.warn(`[send-shipping-notification] SES failed for admin alert: ${adminSesResult.error}`);
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: fromEmail,
            to: adminEmails,
            subject: `[INTERNAL] Order Shipped: ${orderId}`,
            html: adminHtml,
          });
          console.log(`[send-shipping-notification] Admin alert sent via Resend for order ${orderId}`);
        } catch (resendAdminErr) {
          console.error("[send-shipping-notification] Resend admin alert failed:", resendAdminErr);
        }
      }
    }

    if (!customerSent && !customerSesResult.success) {
      return new Response(
        JSON.stringify({ error: customerSesResult.error || "Failed to send shipping notification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, detail: customerResultData }),
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
