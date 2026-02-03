import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    // Get auth header and verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { topic, additionalContext } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert blog content writer for Snarky A$$ Humans, a snarky apparel brand. Your writing style is:
- Direct and no-fluff
- Conversational with a hint of sarcasm
- SEO and AEO (Answer Engine Optimization) optimized

CRITICAL WRITING RULES:
1. Paragraphs MUST be under 80 words - short, punchy, scannable
2. Use question-style H2/H3 headings for AEO (e.g., "Why Do Snarky Shirts Make Great Ice Breakers?")
3. Front-load answers - put the key point in the first sentence of each section
4. Include natural keyword placement without stuffing
5. End with a compelling CTA related to the brand

CONTENT STRUCTURE:
- Hook: Grab attention in the first paragraph
- Atomic sections: Each H2 covers ONE topic completely
- Value-first: Every section answers a question or solves a problem
- CTA: End with action-oriented conclusion

OUTPUT FORMAT - You must call the generate_blog_content function with all required fields.`;

    const userPrompt = `Write a comprehensive, AEO-optimized blog post about: "${topic}"
${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}

The content should be engaging, SEO-friendly, and match the snarky, irreverent tone of our brand.`;

    console.log("Calling Lovable AI for blog generation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_blog_content",
              description: "Generate a complete blog post with all SEO metadata",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "SEO-optimized blog title (under 60 characters)",
                  },
                  metaDescription: {
                    type: "string",
                    description: "Meta description for SEO (under 160 characters)",
                  },
                  excerpt: {
                    type: "string",
                    description: "Short preview excerpt (2-3 sentences)",
                  },
                  content: {
                    type: "string",
                    description: "Full blog post content in Markdown format with H2/H3 headings",
                  },
                  seoKeywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-8 SEO keywords for the post",
                  },
                  longTailQueries: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 long-tail search queries this post answers",
                  },
                },
                required: ["title", "metaDescription", "excerpt", "content", "seoKeywords", "longTailQueries"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_blog_content" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(aiResponse));
      return new Response(JSON.stringify({ error: "AI did not return expected format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const blogData = JSON.parse(toolCall.function.arguments);

    // Generate slug from title
    const slug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 80);

    // Check for slug uniqueness
    const { data: existingPost } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug;

    const result = {
      title: blogData.title,
      slug: finalSlug,
      content: blogData.content,
      excerpt: blogData.excerpt,
      meta_description: blogData.metaDescription,
      seo_keywords: blogData.seoKeywords,
      long_tail_queries: blogData.longTailQueries,
      status: "draft",
    };

    console.log("Blog post generated successfully:", result.title);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-blog:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
