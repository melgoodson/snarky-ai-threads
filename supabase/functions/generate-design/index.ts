import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper: extract base64 data and mime type from a data URL
function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, referenceImage } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const enhancedPrompt = `Create a standalone artwork design. ${prompt}. IMPORTANT: Generate ONLY the flat design/artwork itself on a clean white or transparent background. Do NOT show the design on any product like a shirt, hoodie, mug, or any merchandise. No product mockups. Just the pure artwork/illustration/graphic by itself, high resolution, vibrant colors, clean edges, print-ready.`;

    // Build request parts
    const parts: any[] = [{ text: enhancedPrompt }];

    // Add reference image if provided
    if (referenceImage) {
      const parsed = parseDataUrl(referenceImage);
      if (parsed) {
        parts.push({ inlineData: { mimeType: parsed.mimeType, data: parsed.data } });
      }
    }

    const models = ["gemini-2.0-flash-exp-image-generation", "gemini-2.5-flash-image"];
    const MAX_RETRIES = 3;
    let lastError = "";

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;
      console.log(`Trying model: ${model}, prompt: ${enhancedPrompt.substring(0, 200)}`);

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 8000);
          console.log(`Retry attempt ${attempt + 1}, waiting ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        }

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        });

        if (response.status === 429) {
          lastError = "Rate limit exceeded";
          console.log(`Rate limited on ${model}, attempt ${attempt + 1}/${MAX_RETRIES}`);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gemini API error: ${response.status} - ${errorText}`);
          lastError = `${response.status} - ${errorText}`;
          break; // Don't retry non-rate-limit errors, try next model
        }

        const data = await response.json();
        console.log("Gemini API response received");

        let generatedImageUrl: string | null = null;
        const candidateParts = data.candidates?.[0]?.content?.parts;

        if (Array.isArray(candidateParts)) {
          for (const part of candidateParts) {
            if (part.inlineData?.data && part.inlineData?.mimeType) {
              generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (!generatedImageUrl) {
          console.error("No image in response:", JSON.stringify(data).substring(0, 1000));
          lastError = "No image found in response";
          break; // Try next model
        }

        console.log("Successfully generated design image");
        return new Response(
          JSON.stringify({ image: generatedImageUrl }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // All models/retries exhausted
    if (lastError === "Rate limit exceeded") {
      return new Response(
        JSON.stringify({ error: "AI service is busy. Please wait 1-2 minutes and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    throw new Error(`Failed to generate image: ${lastError}`);
  } catch (error: any) {
    console.error("Error in generate-design function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate design" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
