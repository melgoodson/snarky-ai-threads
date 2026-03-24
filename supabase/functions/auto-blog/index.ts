import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Keyword Research Data ──────────────────────────────────────────────
// Extracted from provided keyword research across 5 categories

const KEYWORD_RESEARCH = {
  customGifts: {
    volume: "22.2K",
    competition: "High",
    cpc: "$2.97",
    keywords: [
      "custom gifts for men",
      "custom gifts christmas",
      "custom gifts for grandma",
      "custom gifts anniversary",
      "custom gifts for girlfriend",
      "custom mother's day gifts",
      "custom gifts for him",
      "custom gifts for mom",
      "custom gifts valentines day",
      "custom gifts corporate",
    ],
    aiPrompts: [
      "Best websites to order personalized custom gifts",
      "Unique personalized gift ideas for birthdays",
      "Unique custom gift ideas for anniversaries",
      "Where to find custom photo gifts online",
      "How to choose a reliable custom gift company",
      "How to create custom gifts online easily",
      "Custom corporate gift suppliers",
      "Affordable custom gift options for birthdays",
      "Personalized wedding gift inspiration",
    ],
  },
  personalization: {
    volume: "33.1K",
    competition: "High",
    cpc: "$2.56",
    keywords: [
      "personalization mall",
      "personalization creations",
      "personalization stockings",
      "personalization socks",
      "personalization blanket with pictures",
      "personalization cutting board",
      "personalization blankets",
      "personalization necklace",
      "personalization golf balls",
      "embroidery personalization near me",
    ],
    searchQuestions: [
      "What do you mean by personalization?",
      "What is a synonym for personalization?",
      "What are the two types of personalization?",
      "What are the 5 promises of personalization?",
    ],
    aiPrompts: [
      "What are the best platforms for e-commerce personalization?",
      "Where can I get custom-engraved gifts online?",
      "What brands provide customizable smartphone cases online?",
      "Explain the benefits of personalized customer service",
    ],
  },
  personalizedGifts: {
    volume: "90.5K",
    competition: "Low",
    cpc: "$1.54",
    keywords: [
      "personalized gifts christmas",
      "personalized gifts photo",
      "personalized gifts pictures",
      "personalized gifts for mom",
      "personalized gifts to mom",
      "personalized gifts with pictures",
      "personalized gifts with photo",
      "personalized gifts using photos",
      "personalized gifts xmas",
      "personalized gifts for him",
      "personalized gifts for men",
      "personalized gifts mom",
    ],
    searchQuestions: [
      "What is a good personalized gift?",
      "What is the most fun thing to have personalized with your name?",
      "What are the top 3 most popular gift categories?",
      "What is the 5 gift rule for girlfriends?",
      "What is the 3 gift rule?",
      "What gifts can you personalise?",
      "What are some good personalized office gifts?",
      "What decor style is trending right now?",
    ],
    aiPrompts: [
      "Best websites to order personalized gifts online",
      "Unique personalized gift ideas for a milestone birthday",
      "Top-rated companies for custom engraved gifts",
      "Where to find custom engraved jewelry",
      "Unique personalized gift ideas for birthdays",
      "How to create personalized photo gifts easily",
      "Personalized gifts for men who have everything",
      "Affordable personalized gifts for couples",
      "How to choose a personalized gift for a wedding anniversary",
      "Customizable gift options for baby showers",
      "Companies offering custom embroidered apparel",
    ],
  },
  snarky: {
    volume: "40.5K",
    competition: "High",
    cpc: "$0",
    keywords: [
      "snarky tea",
      "snarky definition",
      "snarky meaning",
      "snarky jay",
      "synonym for snarky",
      "snarky synonym",
      "snarky thesaurus",
      "snarky tea reviews",
      "snarky tea house",
    ],
    searchQuestions: [
      "What is snarky attitude?",
      "What does being snarky mean?",
      "Is being called snarky an insult?",
      "What is an example of snark?",
      "What does snarky mean in simple words?",
      "Why do people get snarky?",
      "What's the difference between snarky and sarcastic?",
      "What is another word for snarky?",
      "Is snarky the same as sassy?",
      "What is snarky personality?",
      "Does snarky mean rude?",
    ],
    aiPrompts: [
      "What are the best snarky greeting card brands available online?",
      "Where to buy funny sarcastic greeting cards?",
      "Where can I find snarky coffee mugs for gift ideas?",
      "Unique gift ideas for someone with a dry wit?",
      "How to add snarky quotes to my social media posts using popular apps?",
      "Online stores for witty home decor?",
      "Which subscription boxes offer snarky or sarcastic merchandise?",
      "Custom t-shirt printing for sarcastic designs?",
      "What online stores specialize in snarky T-shirts and apparel?",
      "Tips for writing snarky social media posts?",
    ],
  },
  gagGifts: {
    keywords: [
      "gag gifts",
      "gag gifts for adults",
      "funny gag gifts",
      "gag gifts for men",
      "gag gifts for women",
      "office gag gifts",
      "white elephant gag gifts",
      "birthday gag gifts",
    ],
  },
};

// ─── Topic Pool ─────────────────────────────────────────────────────────
// ~30 topic ideas drawn from keyword clusters, rotated each run

const TOPIC_POOL = [
  // Custom Gifts cluster
  {
    topic:
      "The Best Custom Gifts for Men Who Claim They Don't Want Anything",
    cluster: "custom gifts",
    targetKeywords: [
      "custom gifts for men",
      "custom gifts for him",
      "personalized gifts for men",
    ],
  },
  {
    topic:
      "Custom Christmas Gifts That Don't End Up in the Return Pile",
    cluster: "custom gifts",
    targetKeywords: [
      "custom gifts christmas",
      "personalized gifts christmas",
      "personalized gifts xmas",
    ],
  },
  {
    topic:
      "Why Grandma Deserves a Custom Gift (Not Another Bath Set)",
    cluster: "custom gifts",
    targetKeywords: [
      "custom gifts for grandma",
      "custom gifts for mom",
      "personalized gifts for mom",
    ],
  },
  {
    topic:
      "Custom Anniversary Gifts That Actually Celebrate Your Relationship",
    cluster: "custom gifts",
    targetKeywords: [
      "custom gifts anniversary",
      "personalized wedding gift",
      "custom gifts for girlfriend",
    ],
  },
  {
    topic:
      "Corporate Custom Gifts That Won't Get Thrown in a Desk Drawer",
    cluster: "custom gifts",
    targetKeywords: [
      "custom gifts corporate",
      "personalized office gifts",
      "custom corporate gift suppliers",
    ],
  },
  {
    topic:
      "Custom Mother's Day Gifts That Make Brunch Look Basic",
    cluster: "custom gifts",
    targetKeywords: [
      "custom mother's day gifts",
      "custom gifts for mom",
      "personalized gifts for mom",
    ],
  },

  // Personalized Gifts cluster
  {
    topic:
      "Photo Gifts That People Actually Display (Not Hide in a Closet)",
    cluster: "personalized gifts",
    targetKeywords: [
      "personalized gifts photo",
      "personalized gifts with pictures",
      "personalized gifts using photos",
    ],
  },
  {
    topic:
      "The 5 Gift Rule: How to Pick Personalized Gifts That Actually Matter",
    cluster: "personalized gifts",
    targetKeywords: [
      "personalized gifts",
      "5 gift rule",
      "gift categories",
    ],
  },
  {
    topic:
      "What Is a Good Personalized Gift? A No-BS Guide",
    cluster: "personalized gifts",
    targetKeywords: [
      "personalized gifts",
      "good personalized gift",
      "unique gift ideas",
    ],
  },
  {
    topic:
      "Personalized Gifts for the Person Who Has Everything (Except Taste)",
    cluster: "personalized gifts",
    targetKeywords: [
      "personalized gifts for him",
      "personalized gifts for men",
      "unique personalized gifts",
    ],
  },
  {
    topic:
      "The Most Fun Things to Have Personalized With Your Name",
    cluster: "personalized gifts",
    targetKeywords: [
      "personalized gifts",
      "personalized with your name",
      "custom personalization",
    ],
  },
  {
    topic:
      "Personalized Gifts for Couples That Don't Make Everyone Cringe",
    cluster: "personalized gifts",
    targetKeywords: [
      "personalized gifts for couples",
      "personalized gifts photo",
      "custom gifts anniversary",
    ],
  },

  // Personalization cluster
  {
    topic:
      "Custom Blankets With Pictures: The Gift That Lives on the Couch Forever",
    cluster: "personalization",
    targetKeywords: [
      "personalization blanket with pictures",
      "personalization blankets",
      "custom blanket",
    ],
  },
  {
    topic:
      "Personalized Socks, Cutting Boards, and Other Gifts That Sound Weird But Slap",
    cluster: "personalization",
    targetKeywords: [
      "personalization socks",
      "personalization cutting board",
      "personalization necklace",
    ],
  },
  {
    topic:
      "What Does Personalization Actually Mean? (Hint: It's Not Just Slapping a Name on Something)",
    cluster: "personalization",
    targetKeywords: [
      "personalization meaning",
      "types of personalization",
      "custom vs personalized",
    ],
  },

  // Snarky cluster
  {
    topic:
      "What Does Snarky Mean? A Love Letter to Your Inner A$$hole",
    cluster: "snarky",
    targetKeywords: [
      "snarky definition",
      "snarky meaning",
      "what does snarky mean",
    ],
  },
  {
    topic:
      "Snarky vs Sarcastic: Is There a Difference? (Yes, and It Matters)",
    cluster: "snarky",
    targetKeywords: [
      "snarky vs sarcastic",
      "snarky synonym",
      "snarky definition",
    ],
  },
  {
    topic:
      "Why Snarky People Are the Best Gift Givers (And What to Get Them)",
    cluster: "snarky",
    targetKeywords: [
      "snarky gifts",
      "snarky coffee mugs",
      "snarky greeting cards",
    ],
  },
  {
    topic:
      "Is Being Called Snarky an Insult? Let's Settle This",
    cluster: "snarky",
    targetKeywords: [
      "snarky attitude",
      "snarky personality",
      "is snarky an insult",
    ],
  },
  {
    topic:
      "Snarky T-Shirts That Say What You're Thinking (So You Don't Have To)",
    cluster: "snarky",
    targetKeywords: [
      "snarky t-shirts",
      "snarky apparel",
      "custom t-shirt sarcastic designs",
    ],
  },
  {
    topic:
      "The Best Snarky Coffee Mugs for People Who Need Caffeine and Attitude",
    cluster: "snarky",
    targetKeywords: [
      "snarky coffee mugs",
      "snarky tea",
      "funny mugs",
    ],
  },

  // Gag Gifts cluster
  {
    topic:
      "Gag Gifts for Adults That Are Actually Funny (Not Just Inappropriate)",
    cluster: "gag gifts",
    targetKeywords: [
      "gag gifts for adults",
      "funny gag gifts",
      "gag gifts",
    ],
  },
  {
    topic:
      "White Elephant Gifts That Win the Party (Every. Single. Time.)",
    cluster: "gag gifts",
    targetKeywords: [
      "white elephant gag gifts",
      "funny gag gifts",
      "office gag gifts",
    ],
  },
  {
    topic:
      "The Ultimate Guide to Birthday Gag Gifts That Don't Get Weird",
    cluster: "gag gifts",
    targetKeywords: [
      "birthday gag gifts",
      "gag gifts for men",
      "gag gifts for women",
    ],
  },
  {
    topic:
      "Office Gag Gifts That Won't Get You Called Into HR",
    cluster: "gag gifts",
    targetKeywords: [
      "office gag gifts",
      "funny office gifts",
      "gag gifts corporate",
    ],
  },

  // Cross-cluster / brand pieces
  {
    topic:
      "How AI Custom Design Is Killing Generic Gift Culture (And We're Here for It)",
    cluster: "brand",
    targetKeywords: [
      "AI custom design",
      "custom gifts",
      "personalized gifts",
    ],
  },
  {
    topic:
      "Why Print-on-Demand Custom Gifts Are Better Than Anything in a Store",
    cluster: "brand",
    targetKeywords: [
      "print on demand",
      "custom apparel",
      "personalized gifts online",
    ],
  },
  {
    topic:
      "How to Design a Custom Shirt That's Actually Funny (Not Cringey)",
    cluster: "brand",
    targetKeywords: [
      "custom t-shirt design",
      "funny shirt design",
      "snarky shirts",
    ],
  },
  {
    topic:
      "The Spicy Meter Explained: How to Pick the Right Level of Snarky Apparel",
    cluster: "brand",
    targetKeywords: [
      "snarky apparel",
      "edgy graphic tees",
      "spicy meter",
    ],
  },
  {
    topic:
      "Valentine's Day Custom Gifts That Are Funny, Romantic, and Not a Teddy Bear",
    cluster: "custom gifts",
    targetKeywords: [
      "custom gifts valentines day",
      "personalized gifts for girlfriend",
      "funny valentine gifts",
    ],
  },
];

// ─── Build keyword-rich system prompt ───────────────────────────────────

function buildSystemPrompt(targetKeywords: string[]): string {
  // Flatten all keywords for the system prompt
  const allKeywords = [
    ...KEYWORD_RESEARCH.customGifts.keywords,
    ...KEYWORD_RESEARCH.personalization.keywords,
    ...KEYWORD_RESEARCH.personalizedGifts.keywords,
    ...KEYWORD_RESEARCH.snarky.keywords,
    ...KEYWORD_RESEARCH.gagGifts.keywords,
  ];

  const allQuestions = [
    ...(KEYWORD_RESEARCH.personalization.searchQuestions || []),
    ...(KEYWORD_RESEARCH.personalizedGifts.searchQuestions || []),
    ...(KEYWORD_RESEARCH.snarky.searchQuestions || []),
  ];

  return `You are an expert blog content writer for Snarky A$$ Humans (snarkyhumans.com), a snarky custom apparel and gift brand. Your writing style is:
- Direct and no-fluff
- Conversational with a hint of sarcasm and razor-sharp wit
- SEO and AEO (Answer Engine Optimization) optimized
- Genuinely helpful underneath the snark

BRAND CONTEXT:
- Snarky A$$ Humans sells custom-designed apparel (t-shirts, hoodies), blankets, mugs, and greeting cards
- Products are AI-designed and print-on-demand — customers describe what they want and AI generates the design
- The brand tone is irreverent, honest, and unapologetically real
- There's a "Spicy Meter" system: Mild, Medium, Nuclear for content heat levels
- The brand champions custom, personalized gifts over generic garbage

TARGET SEO KEYWORDS (work these in naturally, prioritize the first 3):
${targetKeywords.map((k) => `- "${k}"`).join("\n")}

HIGH-VOLUME KEYWORD CLUSTERS TO REFERENCE NATURALLY:
- Custom Gifts (22.2K monthly searches): ${KEYWORD_RESEARCH.customGifts.keywords.slice(0, 5).join(", ")}
- Personalized Gifts (90.5K monthly searches): ${KEYWORD_RESEARCH.personalizedGifts.keywords.slice(0, 5).join(", ")}
- Personalization (33.1K monthly searches): ${KEYWORD_RESEARCH.personalization.keywords.slice(0, 5).join(", ")}
- Snarky (40.5K monthly searches): ${KEYWORD_RESEARCH.snarky.keywords.slice(0, 3).join(", ")}

AEO SEARCH QUESTIONS TO ADDRESS (use as H2/H3 headings where relevant):
${allQuestions.slice(0, 8).map((q) => `- "${q}"`).join("\n")}

CRITICAL WRITING RULES:
1. Paragraphs MUST be under 80 words — short, punchy, scannable
2. Use question-style H2/H3 headings for AEO (e.g., "What Is the Best Personalized Gift?")
3. Front-load answers — put the key point in the first sentence of each section
4. Include natural keyword placement without stuffing
5. End with a compelling CTA mentioning Snarky A$$ Humans and the AI design tool
6. Include at least one internal link reference to the shop or product categories
7. Write 1000-1500 words minimum

CONTENT STRUCTURE:
- Hook: Grab attention in the first paragraph with a snarky observation
- Atomic sections: Each H2 covers ONE topic completely
- Value-first: Every section answers a question or solves a problem
- CTA: End with action-oriented conclusion pointing to snarkyhumans.com

OUTPUT FORMAT: You MUST respond with a JSON object (no markdown wrapping) with these exact fields:
{
  "title": "SEO-optimized blog title (under 60 characters)",
  "metaDescription": "Meta description for SEO (under 160 characters)",
  "excerpt": "Short preview excerpt (2-3 sentences)",
  "content": "Full blog post content in Markdown format with H2/H3 headings",
  "seoKeywords": ["keyword1", "keyword2", ...],
  "longTailQueries": ["query1", "query2", ...]
}`;
}

// ─── Main handler ───────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_AI_API_KEY")!;

    if (!googleApiKey) {
      throw new Error("GOOGLE_AI_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check what day it is (or accept override from body)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is fine for cron calls
    }

    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const scheduleDays = [1, 3, 5]; // Mon, Wed, Fri

    // Allow force override with body.day or body.force
    const forceDay = body?.day?.toLowerCase();
    const isForced = body?.force === true || !!forceDay;

    if (!isForced && !scheduleDays.includes(dayOfWeek)) {
      return new Response(
        JSON.stringify({
          message: `Not a scheduled day (today is day ${dayOfWeek}). Use {"force": true} to override.`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `Auto-blog triggered: ${isForced ? "FORCED" : "SCHEDULED"} on ${now.toISOString()}`
    );

    // ── Fetch existing posts to avoid duplicates ──
    const { data: existingPosts } = await supabase
      .from("blog_posts")
      .select("title, slug")
      .order("created_at", { ascending: false })
      .limit(50);

    const existingTitles = new Set(
      (existingPosts || []).map((p: any) => p.title.toLowerCase())
    );
    const existingSlugs = new Set(
      (existingPosts || []).map((p: any) => p.slug)
    );

    // ── Pick a topic that hasn't been covered ──
    const availableTopics = TOPIC_POOL.filter(
      (t) => !existingTitles.has(t.topic.toLowerCase())
    );

    if (availableTopics.length === 0) {
      return new Response(
        JSON.stringify({
          message: "All topics in the pool have been used. Add more topics.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Pick a random topic from available pool
    const selectedTopic =
      availableTopics[Math.floor(Math.random() * availableTopics.length)];

    console.log(
      `Selected topic: "${selectedTopic.topic}" (cluster: ${selectedTopic.cluster})`
    );

    // ── Generate blog post with Gemini ──
    const systemPrompt = buildSystemPrompt(selectedTopic.targetKeywords);
    const userPrompt = `Write a comprehensive, AEO-optimized blog post about: "${selectedTopic.topic}"

This should be a long-form, engaging article (1000-1500 words) that ranks for the target keywords while maintaining the snarky, irreverent tone of the Snarky A$$ Humans brand.

Focus on providing genuine value while being entertaining. Make sure to include relevant search questions as H2/H3 headings for AEO optimization.

IMPORTANT: Respond ONLY with a valid JSON object, no extra text or markdown wrapping.`;

    // ── Auto-discover available models via ListModels API ──
    console.log("Discovering available Gemini models...");

    let availableModels: string[] = [];
    for (const apiVersion of ["v1beta", "v1"]) {
      try {
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${googleApiKey}`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          const textModels = (listData.models || [])
            .filter((m: any) =>
              m.supportedGenerationMethods?.includes("generateContent") &&
              !m.name.includes("image") &&
              !m.name.includes("embedding") &&
              !m.name.includes("aqa")
            )
            .map((m: any) => ({ name: m.name.replace("models/", ""), api: apiVersion }));
          availableModels.push(...textModels.map((m: any) => `${m.api}/${m.name}`));
          console.log(`Found ${textModels.length} text models on ${apiVersion}: ${textModels.map((m: any) => m.name).join(", ")}`);
          if (textModels.length > 0) break; // Use first API version that has models
        }
      } catch (err) {
        console.log(`ListModels (${apiVersion}) error:`, err);
      }
    }

    if (availableModels.length === 0) {
      throw new Error("No Gemini text generation models found for this API key. Check GOOGLE_AI_API_KEY.");
    }

    // Prefer flash models (faster), then pro
    const preferOrder = ["flash", "pro"];
    availableModels.sort((a, b) => {
      const aIdx = preferOrder.findIndex(p => a.includes(p));
      const bIdx = preferOrder.findIndex(p => b.includes(p));
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });

    let response: Response | null = null;
    let lastError = "";

    for (const modelPath of availableModels) {
      const [apiVersion, ...modelParts] = modelPath.split("/");
      const modelName = modelParts.join("/");
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${googleApiKey}`;
      console.log(`Trying model: ${modelName} on ${apiVersion}...`);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 8192,
              responseMimeType: "application/json",
            },
          }),
        });

        if (res.ok) {
          console.log(`Success with model: ${modelName} on ${apiVersion}`);
          response = res;
          break;
        }

        lastError = await res.text();
        console.log(`Model ${modelName} (${apiVersion}) failed: ${res.status}`);
      } catch (err) {
        console.log(`Model ${modelName} (${apiVersion}) fetch error:`, err);
        lastError = String(err);
      }
    }

    if (!response) {
      throw new Error(`All discovered models failed. Models tried: ${availableModels.join(", ")}. Last error: ${lastError.substring(0, 200)}`);
    }

    const aiResponse = await response.json();
    let textContent =
      aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error(
        "No text in Gemini response:",
        JSON.stringify(aiResponse).substring(0, 500)
      );
      throw new Error("Gemini did not return expected format");
    }

    // ── Robust JSON extraction ──
    // 1. Strip markdown code fences & surrounding text
    textContent = textContent
      .replace(/^[\s\S]*?```json\s*/i, "")
      .replace(/^[\s\S]*?```\s*/i, "")
      .replace(/\s*```[\s\S]*$/i, "")
      .trim();

    // 2. If there's still non-JSON wrapping, extract the outermost { ... }
    if (!textContent.startsWith("{")) {
      const firstBrace = textContent.indexOf("{");
      if (firstBrace !== -1) {
        textContent = textContent.substring(firstBrace);
      }
    }
    // Trim anything after the last closing brace
    const lastBrace = textContent.lastIndexOf("}");
    if (lastBrace !== -1 && lastBrace < textContent.length - 1) {
      textContent = textContent.substring(0, lastBrace + 1);
    }

    let blogData: any;
    try {
      blogData = JSON.parse(textContent);
    } catch (parseErr) {
      console.log("First JSON.parse failed, attempting sanitization...");
      // 3. Sanitize unescaped control characters inside string values
      const sanitized = textContent.replace(
        /("(?:[^"\\]|\\.)*")/g,
        (match: string) => {
          return match
            .replace(/(?<!\\)\n/g, "\\n")
            .replace(/(?<!\\)\r/g, "\\r")
            .replace(/(?<!\\)\t/g, "\\t");
        }
      );
      try {
        blogData = JSON.parse(sanitized);
      } catch (parseErr2) {
        console.log("Sanitized JSON.parse failed, attempting regex extraction...");
        // 4. Fallback: regex extract individual fields
        const extractField = (name: string, isArray = false): string | string[] | null => {
          if (isArray) {
            const m = textContent.match(new RegExp(`"${name}"\\s*:\\s*(\\[[^\\]]*\\])`, "s"));
            if (m) try { return JSON.parse(m[1]); } catch { return []; }
            return [];
          }
          const m = textContent.match(new RegExp(`"${name}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
          return m ? m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : null;
        };

        // For the long content field, use a greedy approach
        const contentMatch = textContent.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"(?:seoKeywords|longTailQueries)|"\s*})/);
        const contentValue = contentMatch
          ? contentMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"')
          : `# ${selectedTopic.topic}\n\nContent generation encountered a formatting issue. Please regenerate.`;

        blogData = {
          title: extractField("title") || selectedTopic.topic,
          metaDescription: extractField("metaDescription") || "",
          excerpt: extractField("excerpt") || "",
          content: contentValue,
          seoKeywords: extractField("seoKeywords", true) || selectedTopic.targetKeywords,
          longTailQueries: extractField("longTailQueries", true) || [],
        };
        console.log("Recovered blog data via regex fallback");
      }
    }

    // ── Generate slug ──
    let slug = (blogData.title || selectedTopic.topic)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 80);

    // Ensure unique slug
    if (existingSlugs.has(slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    // ── Determine published_at ──
    // If forced for a specific day, backdate appropriately
    let publishedAt = now.toISOString();
    if (forceDay === "monday") {
      // Find last Monday
      const lastMonday = new Date(now);
      const currentDay = lastMonday.getUTCDay();
      const daysBack = currentDay === 0 ? 6 : currentDay === 1 ? 0 : currentDay - 1;
      lastMonday.setUTCDate(lastMonday.getUTCDate() - daysBack);
      lastMonday.setUTCHours(9, 0, 0, 0);
      publishedAt = lastMonday.toISOString();
    }

    // ── Insert into blog_posts ──
    const postData = {
      title: blogData.title || selectedTopic.topic,
      slug,
      content: blogData.content,
      excerpt: blogData.excerpt,
      meta_description: blogData.metaDescription,
      seo_keywords: blogData.seoKeywords || selectedTopic.targetKeywords,
      long_tail_queries: blogData.longTailQueries || [],
      author_name: "Snarky Humans Team",
      status: "published",
      published_at: publishedAt,
    };

    const { data: insertedPost, error: insertError } = await supabase
      .from("blog_posts")
      .insert([postData])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to insert blog post: ${insertError.message}`);
    }

    console.log(
      `Blog post published: "${postData.title}" → /blog/${postData.slug}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Blog post published: "${postData.title}"`,
        post: {
          id: insertedPost.id,
          title: postData.title,
          slug: postData.slug,
          published_at: postData.published_at,
          cluster: selectedTopic.cluster,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Auto-blog error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
