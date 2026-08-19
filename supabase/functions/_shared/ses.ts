// Amazon SES (Simple Email Service) v2 client for Supabase Edge Functions
// Uses Web Crypto API for zero-dependency AWS SigV4 request signing.

export interface SendEmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Convert ArrayBuffer to hex string
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// SHA-256 hash using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  return bufToHex(hashBuffer);
}

// HMAC-SHA256 using Web Crypto API
async function hmacSha256(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

// Generate AWS Signature Version 4 signing key
async function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Promise<ArrayBuffer> {
  const kSecret = new TextEncoder().encode("AWS4" + key);
  const kDate = await hmacSha256(kSecret, dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

function getEnv(key: string): string | undefined {
  if (typeof Deno !== "undefined" && typeof Deno.env?.get === "function") {
    return Deno.env.get(key);
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
}

/**
 * Send an email using Amazon Simple Email Service (SES) v2 REST API.
 */
export async function sendSesEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const accessKeyId =
    getEnv("AWS_SES_ACCESS_KEY_ID") ||
    getEnv("AWS_ACCESS_KEY_ID");

  const secretAccessKey =
    getEnv("AWS_SES_SECRET_ACCESS_KEY") ||
    getEnv("AWS_SECRET_ACCESS_KEY");

  if (!accessKeyId || !secretAccessKey) {
    return {
      success: false,
      error: "AWS SES credentials not configured (missing AWS_SES_ACCESS_KEY_ID or AWS_SES_SECRET_ACCESS_KEY)",
    };
  }

  const region =
    getEnv("AWS_SES_REGION") ||
    getEnv("AWS_REGION") ||
    "us-east-1";

  const defaultFrom =
    getEnv("AWS_SES_FROM_EMAIL") ||
    getEnv("SES_FROM_EMAIL") ||
    "Snarky Humans <hello@snarkyhumans.com>";

  const fromEmail = options.from || defaultFrom;
  const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

  if (!toAddresses.length) {
    return { success: false, error: "No recipient address provided" };
  }

  // Strip HTML tags for fallback plain text if not provided
  const textContent =
    options.text ||
    (options.html ? options.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "");

  const payloadObj: Record<string, any> = {
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: toAddresses,
    },
    Content: {
      Simple: {
        Subject: {
          Data: options.subject,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: textContent,
            Charset: "UTF-8",
          },
        },
      },
    },
  };

  if (options.html) {
    payloadObj.Content.Simple.Body.Html = {
      Data: options.html,
      Charset: "UTF-8",
    };
  }

  if (options.replyTo) {
    payloadObj.ReplyToAddresses = Array.isArray(options.replyTo)
      ? options.replyTo
      : [options.replyTo];
  }

  if (options.cc) {
    payloadObj.Destination.CcAddresses = Array.isArray(options.cc)
      ? options.cc
      : [options.cc];
  }

  if (options.bcc) {
    payloadObj.Destination.BccAddresses = Array.isArray(options.bcc)
      ? options.bcc
      : [options.bcc];
  }

  const payload = JSON.stringify(payloadObj);

  const service = "ses";
  const host = `email.${region}.amazonaws.com`;
  const endpoint = `https://${host}/v2/email/outbound-emails`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const method = "POST";
  const canonicalUri = "/v2/email/outbound-emails";
  const canonicalQueryString = "";
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";
  const payloadHash = await sha256(payload);

  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await sha256(canonicalRequest);
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = bufToHex(signatureBuffer);

  const authHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  try {
    const res = await fetch(endpoint, {
      method,
      headers: {
        "content-type": "application/json",
        "host": host,
        "x-amz-date": amzDate,
        "Authorization": authHeader,
      },
      body: payload,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AWS SES Error:", res.status, errText);
      return { success: false, error: `AWS SES ${res.status}: ${errText}` };
    }

    const data = await res.json();
    return { success: true, messageId: data.MessageId };
  } catch (err: any) {
    console.error("AWS SES Exception:", err);
    return { success: false, error: err.message || String(err) };
  }
}
