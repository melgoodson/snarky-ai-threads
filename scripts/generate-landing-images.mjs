/**
 * Generate hero images for landing pages via Google AI (Gemini) API.
 * Usage: node scripts/generate-landing-images.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images");
const API_KEY = process.env.GOOGLE_AI_API_KEY;
const MODEL = "gemini-2.0-flash-exp-image-generation";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const IMAGES = [
    {
        filename: "hoodie-hero.png",
        prompt: "Professional product photography of a black pullover hoodie with a bold snarky graphic print on the front. The hoodie is styled on a model, shot from waist up against an urban graffiti wall backdrop. The hoodie has a large colorful cartoon design printed on it. Moody studio lighting, fashion editorial style, e-commerce quality.",
    },
    {
        filename: "tote-hero.png",
        prompt: "Professional product photography of a natural canvas tote bag with a bold, snarky printed design on it, laying on a wooden cafe table next to a coffee cup and sunglasses. The tote bag has colorful artwork printed on it. Natural lighting, lifestyle product photography, warm tones, e-commerce quality.",
    },
    {
        filename: "mug-hero.png",
        prompt: "Professional product photography of a white ceramic coffee mug with a funny snarky quote printed on it. The mug is filled with coffee, sitting on a wooden desk next to a laptop. Steam rising from the coffee. Morning sunlight, warm cozy atmosphere, close-up e-commerce product photo.",
    },
    {
        filename: "greeting-card-hero.png",
        prompt: "Professional product photography of premium greeting cards with bold funny designs, arranged in a fan layout on a clean white surface. The cards have colorful artwork and snarky text. A small envelope and decorative ribbons are placed nearby. Studio lighting, high quality product photography.",
    },
    // Also generate carousel images for the shirt landing page hero
    {
        filename: "carousel/shirt-hero-1.png",
        prompt: "Lifestyle product photo of a young man wearing a white cotton graphic t-shirt with a bold funny design printed on the chest. He's standing against a colorful urban street art mural, arms crossed, confident pose. Natural daylight, fashion photography style, waist-up shot focused on the shirt.",
    },
    {
        filename: "carousel/shirt-hero-2.png",
        prompt: "Lifestyle product photo of a young woman wearing a black cotton t-shirt with a snarky colorful graphic print. She's laughing in a trendy coffee shop, casual and relaxed. Natural lighting, lifestyle photography, waist-up shot focused on the shirt design.",
    },
    {
        filename: "carousel/shirt-hero-3.png",
        prompt: "A collection of folded colorful graphic t-shirts arranged on a clean white surface, showing different bold snarky designs. Flat lay product photography, studio lighting, e-commerce style, showing variety of colors including black, white, green, and red shirts.",
    },
];

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
        const parts = data.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));

        if (!imagePart) throw new Error("No image in response");

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
    console.log("🎨 Generating landing page hero images...\n");

    let generated = 0, failed = 0;
    for (const img of IMAGES) {
        const outputPath = path.join(OUTPUT_DIR, img.filename);
        if (fs.existsSync(outputPath)) {
            console.log(`  ⏭ Already exists: ${img.filename}`);
            generated++;
            continue;
        }
        const success = await generateImage(img.prompt, outputPath);
        if (success) generated++; else failed++;
        if (IMAGES.indexOf(img) < IMAGES.length - 1) await sleep(5000);
    }

    console.log(`\n✅ Done! Generated: ${generated}, Failed: ${failed}`);
}

main();
