/**
 * Generate product-specific carousel images using Google AI (Gemini) API.
 * Usage: node scripts/generate-carousel-images.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "carousel");
const API_KEY = "AIzaSyBE-ElNFfNDAsgXmI6sawNKJygH-OZtzFk";
const MODEL = "gemini-2.0-flash-exp-image-generation";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// Each product gets 2 carousel images: a lifestyle mockup + a different color variant
const PRODUCTS = [
    {
        slug: "rbf-champion",
        prompts: [
            "Professional e-commerce product photo of a white heavyweight cotton crewneck t-shirt with a printed design featuring 'RBF CHAMPION' bold text at top, a vintage stern-faced woman portrait in a black laurel wreath frame, and 'Snarky Humans' brand text below. The shirt is laid flat on a clean white surface. Studio lighting, sharp details, high quality product photography.",
            "Lifestyle product photo of a person casually wearing a sport grey heavyweight cotton t-shirt with 'RBF CHAMPION' design featuring a vintage stern-faced woman in laurel wreath. Person is standing with arms crossed, urban street background, natural lighting. Waist-up shot focused on the shirt design.",
        ],
    },
    {
        slug: "snarky-humans",
        prompts: [
            "Professional e-commerce product photo of a white heavyweight cotton crewneck t-shirt with a printed woodcut-style illustration of laughing people around a jar labeled 'Snarky Humans'. The shirt is laid flat on a clean white surface. Studio lighting, sharp details, high quality product photography.",
            "Lifestyle product photo of a person wearing a navy blue heavyweight cotton t-shirt with a woodcut illustration of laughing people around a jar labeled 'Snarky Humans'. Person is laughing while holding a coffee cup, casual indoor setting. Waist-up shot focused on the shirt design.",
        ],
    },
    {
        slug: "free-hugs",
        prompts: [
            "Professional e-commerce product photo of a black heavyweight cotton crewneck t-shirt with a colorful cartoon printed design of a friendly horror movie character with blade fingers offering 'FREE HUGS' in red-green striped text, with kids running away. Laid flat on clean white surface. Studio lighting, high quality.",
            "Lifestyle product photo of a person wearing a dark heather grey heavyweight cotton t-shirt with a funny 'FREE HUGS' cartoon horror parody design. Person is standing with arms wide open in a humorous pose, urban background. Waist-up shot focused on the shirt.",
        ],
    },
    {
        slug: "abduct-me",
        prompts: [
            "Professional e-commerce product photo of a black heavyweight cotton crewneck t-shirt with a colorful cartoon design showing bold green text 'ABDUCT ME' with a person chasing a purple UFO flying saucer. Laid flat on a clean white surface. Studio lighting, high quality product photography.",
            "Lifestyle product photo of a person wearing a military green heavyweight cotton t-shirt with a fun cartoon 'ABDUCT ME' design showing a person running toward a UFO. Person is pointing up at the sky humorously, outdoor park background. Waist-up shot.",
        ],
    },
    {
        slug: "sasquatches",
        prompts: [
            "Professional e-commerce product photo of a forest green heavyweight cotton crewneck t-shirt with a cartoon camping scene design - kids around a campfire, tents, with a bigfoot peeking from behind a tree. Text says 'SASQUATCHES - successfully avoiding humans for thousands of years'. Laid flat on clean white surface. Studio lighting.",
            "Lifestyle product photo of a person wearing a black heavyweight cotton t-shirt with a Sasquatch bigfoot forest camping cartoon design. Person is outdoors near trees, casual and relaxed pose. Waist-up shot focused on the shirt design. Natural lighting.",
        ],
    },
    {
        slug: "white-idol-morning",
        prompts: [
            "Professional e-commerce product photo of a white heavyweight cotton crewneck t-shirt with a beautiful mountain sunrise landscape photograph design. The scenic mountain image has a hidden message in the landscape. Laid flat on a clean white surface. Studio lighting, high quality product photography.",
            "Lifestyle product photo of a person wearing a sand/beige colored heavyweight cotton t-shirt with a beautiful mountain sunrise landscape design. Person is outdoors at a scenic overlook, enjoying nature. Waist-up shot focused on the shirt. Golden hour lighting.",
        ],
    },
    {
        slug: "fathers",
        prompts: [
            "Professional e-commerce product photo of a white heavyweight cotton crewneck t-shirt with a bold printed design reading 'IF DAD CAN'T FIX IT WE ALL ARE SCREWED' with tools imagery like a drill and screwdriver in orange and black. Laid flat on a clean white surface. Studio lighting, high quality.",
            "Lifestyle product photo of a dad wearing a navy blue cotton t-shirt with 'IF DAD CAN'T FIX IT WE ALL ARE SCREWED' design with tool graphics. He's in a garage workshop holding a wrench, smiling. Waist-up shot focused on the shirt. Warm natural lighting.",
        ],
    },
    {
        slug: "dark",
        prompts: [
            "Professional e-commerce product photo of a black heavyweight cotton crewneck t-shirt with bold white typography design reading 'SNARKY PUNCHING PEOPLE WITH WORDS AND ATTITUDE' in various font sizes. Laid flat on a clean white surface. Studio lighting, high quality product photography.",
            "Lifestyle product photo of a person wearing a red heavyweight cotton t-shirt with bold white typography 'SNARKY PUNCHING PEOPLE WITH WORDS AND ATTITUDE'. Person has a confident sassy pose with crossed arms. Urban brick wall background. Waist-up shot.",
        ],
    },
];

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function generateImage(prompt, outputPath) {
    const name = path.basename(outputPath);
    console.log(`  Generating: ${name}...`);

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
        },
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.status === 429) {
            console.log(`  ⚠ Rate limited. Waiting 60s and retrying...`);
            await sleep(60000);
            return generateImage(prompt, outputPath);
        }

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`API ${res.status}: ${errText.substring(0, 200)}`);
        }

        const data = await res.json();

        // Extract image from response
        const parts = data.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));

        if (!imagePart) {
            throw new Error("No image in response");
        }

        const imgBuffer = Buffer.from(imagePart.inlineData.data, "base64");
        fs.writeFileSync(outputPath, imgBuffer);
        console.log(`  ✓ Saved: ${name} (${(imgBuffer.length / 1024).toFixed(0)} KB)`);
        return true;
    } catch (err) {
        console.error(`  ✗ Failed: ${name} — ${err.message}`);
        return false;
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    console.log("🎨 Generating carousel images for all products...\n");

    let generated = 0;
    let failed = 0;

    for (const product of PRODUCTS) {
        console.log(`\n📦 ${product.slug}:`);
        for (let i = 0; i < product.prompts.length; i++) {
            const filename = `${product.slug}-${i + 1}.png`;
            const outputPath = path.join(OUTPUT_DIR, filename);

            // Skip if already exists
            if (fs.existsSync(outputPath)) {
                console.log(`  ⏭ Already exists: ${filename}`);
                generated++;
                continue;
            }

            const success = await generateImage(product.prompts[i], outputPath);
            if (success) generated++;
            else failed++;

            // Rate limit spacing: wait 5 seconds between requests
            if (i < product.prompts.length - 1 || PRODUCTS.indexOf(product) < PRODUCTS.length - 1) {
                await sleep(5000);
            }
        }
    }

    console.log(`\n✅ Done! Generated: ${generated}, Failed: ${failed}`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
}

main();
