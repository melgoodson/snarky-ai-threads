import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Sparkles, Tag, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ImageCarousel } from "@/components/ImageCarousel";
import { useCart } from "@/contexts/CartContext";
import rbfChampion from "@/assets/rbf-champion.png";
import snarkyHumans from "@/assets/snarky-humans.png";
import freeHugs from "@/assets/free-hugs.png";
import abductMe from "@/assets/abduct-me.png";
import sasquatches from "@/assets/sasquatches.png";
import whiteIdolMorning from "@/assets/white-idol-morning.png";
import fathers from "@/assets/fathers.png";
import dark from "@/assets/dark.png";
import personalizationBlanket from "@/assets/personalization-blanket.png";

// Color name → hex mapping for visual swatches
const COLOR_HEX_MAP: Record<string, string> = {
  "Black": "#000000",
  "White": "#FFFFFF",
  "Navy": "#1B1F3B",
  "Red": "#C0392B",
  "Royal Blue": "#2E5EAA",
  "Sport Grey": "#9B9B9B",
  "Dark Heather": "#4A4A4A",
  "Military Green": "#4B5320",
  "Maroon": "#6B1C23",
  "Forest Green": "#2D572C",
  "Sand": "#C2B280",
  "Light Blue": "#ADD8E6",
  "Charcoal": "#36454F",
  "Heather Grey": "#B0B0B0",
  "Natural": "#F5F5DC",
  "Irish Green": "#009A44",
  "Orange": "#FF6B35",
  "Purple": "#6B3FA0",
  "Indigo Blue": "#3F51B5",
  "Carolina Blue": "#56A0D3",
  "Light Pink": "#FFB6C1",
  "Daisy": "#F8D568",
  "Ash": "#B2BEB5",
  "Ice Grey": "#D6D6D6",
  "Sapphire": "#0F52BA",
  "Berry": "#8E4585",
  "Mint Green": "#98FB98",
  "Coral Silk": "#FF7F7F",
  "Sunset": "#FAD6A5",
  "Safety Green": "#78FF00",
  "Safety Orange": "#FF6600",
  "Gold": "#FFD700",
  "Antique Cherry Red": "#9B111E",
  "Tweed": "#C3B091",
  "Tropical Blue": "#00CED1",
  "Violet": "#7F00FF",
  "Rustique": "#B7410E",
};

interface ProductData {
  title: string;
  subtitle: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  material: string;
  description: string;
  fit: string;
  care: string;
  productType: "shirt" | "blanket" | "mug" | "greeting-card" | "tote-bag" | "hoodie";
  availableColors?: { name: string; hex: string }[];
  sizeChart: {
    cm: { size: string; length: string; width?: string; chest: string }[];
    inches: { size: string; length: string; width?: string; chest: string }[];
  };
  fixedSpecs?: string[];
}

const PRODUCT_DATA: Record<string, ProductData> = {
  "personalization-blanket": {
    title: "Personalization Blanket – Custom Photo Blanket",
    subtitle: "Upload Your Photos • Create a One-of-a-Kind Gift",
    category: "PERSONALIZED GIFTS",
    price: 49.99,
    originalPrice: 69.99,
    image: personalizationBlanket,
    images: [personalizationBlanket],
    productType: "blanket",
    material: `Premium fleece front with cozy sherpa backing. Edge-to-edge sublimation photo print that won't fade, crack, or peel. Machine washable & dryer safe.`,
    description: `Turn your favorite memories into the coziest personalized gift ever. Our Personalization Blanket lets you upload your own photos to create a custom photo blanket that's as unique as the person you're gifting it to.

Why customers love it:
Ultra-soft premium fleece on one side, cozy sherpa on the other — pure warmth and comfort.
Vibrant, edge-to-edge photo printing that won't fade, crack, or peel.
Multiple sizes available: 30"×40" (baby/lap), 50"×60" (throw), 60"×80" (full).
Machine washable & dryer safe — built for everyday snuggles.

The perfect personalized gift for every occasion:
Personalized gifts for mom — Mother's Day, birthdays, or "just because."
Personalized gifts for dad — Father's Day, retirement, or game-day couch sessions.
Custom gifts for girlfriend or boyfriend — anniversaries, Valentine's Day, long-distance love.
Personalized gifts with photo — weddings, graduations, memorials, new baby arrivals.
Personalized gifts for Christmas — the gift that actually means something.

How it works:
1. Choose your blanket size.
2. Upload your favorite photos (1–12 images).
3. We print, quality-check, and ship your custom blanket within 5–7 business days.

Every blanket is made to order with care. No generic gifts — just your memories, wrapped in softness.`,
    fit: `Available in three sizes:
• 30" × 40" — Perfect lap/baby blanket
• 50" × 60" — Classic throw size for the couch
• 60" × 80" — Full-size for the bed`,
    care: `Machine wash cold on gentle cycle with mild detergent. Tumble dry on low heat. Do not bleach. Do not iron directly on printed area. Your photos will stay vibrant wash after wash.

Pro tip: Wash inside-out to protect the print and keep colors looking fresh for years.`,
    sizeChart: {
      cm: [
        { size: "30×40", length: "102", chest: "76" },
        { size: "50×60", length: "152", chest: "127" },
        { size: "60×80", length: "203", chest: "152" },
      ],
      inches: [
        { size: "30×40", length: "40", chest: "30" },
        { size: "50×60", length: "60", chest: "50" },
        { size: "60×80", length: "80", chest: "60" },
      ],
    },
  },
  "rbf-champion": {
    title: "RBF Champion",
    subtitle: "(I'm coming for you bitch)",
    category: "ATTITUDE",
    price: 21.36,
    originalPrice: 41.36,
    image: rbfChampion,
    images: [rbfChampion, "/images/carousel/rbf-champion-1.png", "/images/carousel/rbf-champion-2.png"],
    productType: "shirt",
    availableColors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Sport Grey", hex: "#9B9B9B" },
      { name: "Navy", hex: "#1B1F3B" },
    ],
    material: `100% preshrunk cotton (5.3 oz/yd² / 180 g/m²). Gildan® 5000 heavyweight body. Seamless double-needle collar, taped neck & shoulders. DTG-printed graphics.`,
    description: `Meet the uniform of the undefeated scowl. Our RBF Champion tee is a heavyweight, snark-approved classic that survives side-eye, small talk, and the spin cycle.

Why you'll love it
Classic, unisex crewneck built on the proven Gildan® 5000 block

Heavyweight 100% cotton (soft, sturdy, not see-through)

Durable details: seamless double-needle collar, double-needle sleeves & hem

Taped neck & shoulders for long-term shape and fewer "why is this twisted?" moments

Clean white canvas that makes the RBF graphic pop`,
    fit: `Relaxed, true-to-size everyday fit (S–5XL)

Size up for extra slouch; check the chart below if you're between sizes`,
    care: `Cold wash with like colours. Tumble dry low or hang dry. Don't iron directly on the print (the RBF does not like heat).

TL;DR

Snarky graphic. Bomb-proof basics. A perfect gift for the RBFer in your life—or for the mirror.`,
    sizeChart: {
      cm: [
        { size: "S", length: "71.1", chest: "45.7" },
        { size: "M", length: "73.7", chest: "50.8" },
        { size: "L", length: "76.2", chest: "55.9" },
        { size: "XL", length: "78.7", chest: "61" },
        { size: "2XL", length: "81.3", chest: "66" },
        { size: "3XL", length: "83.8", chest: "71.1" },
        { size: "4XL", length: "86", chest: "76" },
        { size: "5XL", length: "89", chest: "81" },
      ],
      inches: [
        { size: "S", length: "28", chest: "18" },
        { size: "M", length: "29", chest: "20" },
        { size: "L", length: "30", chest: "22" },
        { size: "XL", length: "31", chest: "24" },
        { size: "2XL", length: "32", chest: "26" },
        { size: "3XL", length: "33", chest: "28" },
        { size: "4XL", length: "33.9", chest: "29.9" },
        { size: "5XL", length: "35", chest: "31.9" },
      ],
    },
  },
  "snarky-humans": {
    title: "Snarky Humans",
    subtitle: "Laughing Design",
    category: "SNARKY HUMANS",
    price: 20.69,
    originalPrice: 40.69,
    image: snarkyHumans,
    images: [snarkyHumans, "/images/carousel/snarky-humans-1.png", "/images/carousel/snarky-humans-2.png"],
    productType: "shirt",
    availableColors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Sport Grey", hex: "#9B9B9B" },
      { name: "Navy", hex: "#1B1F3B" },
      { name: "Red", hex: "#C0392B" },
    ],
    material: `100% preshrunk cotton (5.3 oz/yd² / 180 g/m²). Gildan® 5000 heavyweight body. Seamless double-needle collar, taped neck & shoulders. DTG-printed graphics.`,
    description: `Make a statement without saying a word! This heavyweight cotton T-shirt isn't just a durable staple—it's your new favorite sidekick for casual wear with an attitude. A relaxed style that screams, "I'm comfy, I'm cool, and yes, I'm probably judging you."

Seamless double-needle collar: Because your shirt should be seamless, unlike your drama.
Double-needle sleeve and bottom hems: Reinforced to withstand even your most intense eye rolls.
100% cotton: Soft, breathable, and perfect for those days when you want to look like you tried (but didn't).
Taped neck and shoulders for durability: Built to last longer than your last situationship.`,
    fit: `Whether you're small or rocking 5XL, we've got a size that fits your vibe.`,
    care: `General: This tee is the triple threat—comfort, style, and durability all rolled into one snarky package.
Wash: Keep the sass fresh—cold water, similar colors.
Dry: Tumble dry low or hang it up, just like you do with your high standards.
Store: Perfect for anyone looking for a high-quality, ethically made tee that doesn't take itself too seriously.`,
    sizeChart: {
      cm: [
        { size: "S", length: "71.1", width: "91.4", chest: "45.7" },
        { size: "M", length: "73.7", width: "101.6", chest: "50.8" },
        { size: "L", length: "76.2", width: "111.8", chest: "55.9" },
        { size: "XL", length: "78.7", width: "122", chest: "61" },
        { size: "2XL", length: "81.3", width: "132", chest: "66" },
        { size: "3XL", length: "83.8", width: "142.2", chest: "71.1" },
        { size: "4XL", length: "86", width: "152", chest: "76" },
        { size: "5XL", length: "89", width: "162", chest: "81" },
      ],
      inches: [
        { size: "S", length: "28", width: "36", chest: "18" },
        { size: "M", length: "29", width: "40", chest: "20" },
        { size: "L", length: "30", width: "44", chest: "22" },
        { size: "XL", length: "31", width: "48", chest: "24" },
        { size: "2XL", length: "32", width: "52", chest: "26" },
        { size: "3XL", length: "33", width: "56", chest: "28" },
        { size: "4XL", length: "33.9", width: "59.8", chest: "29.9" },
        { size: "5XL", length: "35", width: "63.8", chest: "31.9" },
      ],
    },
  },
  "free-hugs": {
    title: "Free Hugs",
    subtitle: "",
    category: "SARCASM",
    price: 21.69,
    originalPrice: 41.69,
    image: freeHugs,
    images: [freeHugs, "/images/carousel/free-hugs-1.png", "/images/carousel/free-hugs-2.png"],
    productType: "shirt",
    availableColors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Dark Heather", hex: "#4A4A4A" },
      { name: "Maroon", hex: "#6B1C23" },
    ],
    material: `100% preshrunk cotton (5.3 oz/yd² / 180 g/m²). Gildan® 5000 heavyweight body. Seamless double-needle collar, taped neck & shoulders. DTG-printed graphics.`,
    description: `Make 'em laugh nervously from across the room. This heavyweight cotton T-shirt serves creepy-cute realness: a cartoon Freddy Krueger with arms wide like he's going in for a hug, "FREE HUGS" arced above in red-and-green stripes, and two tiny kids sprinting away in the distance. It's comfortable, durable, and just the right amount of "I'm friendly… probably."

Seamless double-needle collar: Smooth where it counts—unlike your plot twists.

Double-needle sleeve & bottom hems: Reinforced to survive jump scares and side-eye.

100% cotton: Soft, breathable, and perfect for days you want max chill with minimum effort.

Taped neck & shoulders: Built to last longer than your latest horror phase.`,
    fit: `Whether you're S or rocking 5XL, pick your poison—this one fits true and feels deadly comfy.`,
    care: `General: Spooky, snarky, and sturdy—your new go-to for midnight snacks and matinee slashers.

Wash: Cold water, similar colors. Keep the stripes bold and the vibes bolder.

Dry: Tumble low or hang—just like your standards (which should be high).

Store: Perfect for fans who want a quality, ethically made tee that doesn't take itself too seriously.

No blood, just bad decisions. Artwork is parody/fan-inspired.`,
    sizeChart: {
      cm: [
        { size: "S", length: "71.1", width: "91.4", chest: "45.7" },
        { size: "M", length: "73.7", width: "101.6", chest: "50.8" },
        { size: "L", length: "76.2", width: "111.8", chest: "55.9" },
        { size: "XL", length: "78.7", width: "122", chest: "61" },
        { size: "2XL", length: "81.3", width: "132", chest: "66" },
        { size: "3XL", length: "83.8", width: "142.2", chest: "71.1" },
        { size: "4XL", length: "86", width: "152", chest: "76" },
        { size: "5XL", length: "89", width: "162", chest: "81" },
      ],
      inches: [
        { size: "S", length: "28", width: "36", chest: "18" },
        { size: "M", length: "29", width: "40", chest: "20" },
        { size: "L", length: "30", width: "44", chest: "22" },
        { size: "XL", length: "31", width: "48", chest: "24" },
        { size: "2XL", length: "32", width: "52", chest: "26" },
        { size: "3XL", length: "33", width: "56", chest: "28" },
        { size: "4XL", length: "33.9", width: "59.8", chest: "29.9" },
        { size: "5XL", length: "35", width: "63.8", chest: "31.9" },
      ],
    },
  },
  "abduct-me": {
    title: "Abduct Me",
    subtitle: "",
    category: "ALIENS",
    price: 21.69,
    originalPrice: 41.69,
    image: abductMe,
    images: [abductMe, "/images/carousel/abduct-me-1.png", "/images/carousel/abduct-me-2.png"],
    productType: "shirt",
    availableColors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Navy", hex: "#1B1F3B" },
      { name: "Military Green", hex: "#4B5320" },
    ],
    material: `100% preshrunk cotton (5.3 oz/yd² / 180 g/m²). Gildan® 5000 heavyweight body. Seamless double-needle collar, taped neck & shoulders. DTG-printed graphics.`,
    description: `Make a statement without saying a word! This heavyweight cotton T-shirt isn't just a durable staple—it's your new favorite sidekick for casual wear with an attitude. Front and center: bold graffiti cartoon text "ABDUCT ME" with a human sprinting after a zooming UFO. A relaxed style that screams, "I'm comfy, I'm cool, and yes, I'd absolutely board the mothership."

Seamless double-needle collar: Because your shirt should be seamless—unlike your conspiracy theories.
Double-needle sleeve and bottom hems: Reinforced to withstand even your most chaotic close encounters.
100% cotton: Soft, breathable, and perfect for days you want to look like you tried (but didn't).
Taped neck and shoulders for durability: Built to last longer than your latest situationship with extraterrestrials.`,
    fit: `Whether you're small or rocking 5XL, we've got a size that fits your vibe.`,
    care: `General: This tee is the triple threat—comfort, style, and durability all rolled into one snarky package.
Wash: Keep the sass (and the signal) strong—cold water, similar colors.
Dry: Tumble dry low or hang it up, just like you do with your high standards.
Store: Perfect for anyone seeking a high-quality, ethically made tee that doesn't take itself too seriously—earthling or otherwise.`,
    sizeChart: {
      cm: [
        { size: "S", length: "71.1", width: "91.4", chest: "45.7" },
        { size: "M", length: "73.7", width: "101.6", chest: "50.8" },
        { size: "L", length: "76.2", width: "111.8", chest: "55.9" },
        { size: "XL", length: "78.7", width: "122", chest: "61" },
        { size: "2XL", length: "81.3", width: "132", chest: "66" },
        { size: "3XL", length: "83.8", width: "142.2", chest: "71.1" },
        { size: "4XL", length: "86", width: "152", chest: "76" },
        { size: "5XL", length: "89", width: "162", chest: "81" },
      ],
      inches: [
        { size: "S", length: "28", width: "36", chest: "18" },
        { size: "M", length: "29", width: "40", chest: "20" },
        { size: "L", length: "30", width: "44", chest: "22" },
        { size: "XL", length: "31", width: "48", chest: "24" },
        { size: "2XL", length: "32", width: "52", chest: "26" },
        { size: "3XL", length: "33", width: "56", chest: "28" },
        { size: "4XL", length: "33.9", width: "59.8", chest: "29.9" },
        { size: "5XL", length: "35", width: "63.8", chest: "31.9" },
      ],
    },
  },
  "sasquatches": {
    title: "Sasquatches",
    subtitle: "",
    category: "HUMOR",
    price: 21.36,
    originalPrice: 41.36,
    image: sasquatches,
    images: [sasquatches, "/images/carousel/sasquatches-1.png", "/images/carousel/sasquatches-2.png"],
    productType: "shirt",
    availableColors: [
      { name: "Black", hex: "#000000" },
      { name: "Forest Green", hex: "#2D572C" },
      { name: "Military Green", hex: "#4B5320" },
      { name: "Sport Grey", hex: "#9B9B9B" },
    ],
    material: `100% preshrunk cotton (5.3 oz/yd² / 180 g/m²). Gildan® 5000 heavyweight body. Seamless double-needle collar, taped neck & shoulders. DTG-printed graphics.`,
    description: `Make a statement without saying a word! This heavyweight cotton T-shirt isn't just a durable staple—it's your new favorite sidekick for casual wear with an attitude. Front and center: a cozy forest camp scene—family by the campfire, tents set up, picnic table loaded with food—while a giant Sasquatch peeks from behind a tree. The text ties it all together: "SASQUATCHES" up top, and "successfully avoiding humans for thousands of years" underneath. A relaxed style that says, "I'm comfy, I'm outdoorsy, and yes, I might have seen something."

Seamless double-needle collar: Because your shirt should be seamless, unlike your blurry trail-cam footage.

Double-needle sleeve and bottom hems: Reinforced to survive campfire smoke, ghost stories, and panicked marshmallow drops.

100% cotton: Soft, breathable, and perfect for days you want to look like you tried (but didn't).

Taped neck and shoulders for durability: Built to last longer than humanity's best attempts at Bigfoot selfies.`,
    fit: `Whether you're small or rocking 5XL, we've got a size that fits your vibe.`,
    care: `General: This tee is the triple threat—comfort, style, and durability all rolled into one snarky package.
Wash: Keep the camp vibes fresh—cold water, similar colors.
Dry: Tumble dry low or hang it up, just like you do with your high standards.
Store: Perfect for anyone who loves quality, ethical gear—and a good cryptid joke around the fire.`,
    sizeChart: {
      cm: [
        { size: "S", length: "71.1", width: "91.4", chest: "45.7" },
        { size: "M", length: "73.7", width: "101.6", chest: "50.8" },
        { size: "L", length: "76.2", width: "111.8", chest: "55.9" },
        { size: "XL", length: "78.7", width: "122", chest: "61" },
        { size: "2XL", length: "81.3", width: "132", chest: "66" },
        { size: "3XL", length: "83.8", width: "142.2", chest: "71.1" },
        { size: "4XL", length: "86", width: "152", chest: "76" },
        { size: "5XL", length: "89", width: "162", chest: "81" },
      ],
      inches: [
        { size: "S", length: "28", width: "36", chest: "18" },
        { size: "M", length: "29", width: "40", chest: "20" },
        { size: "L", length: "30", width: "44", chest: "22" },
        { size: "XL", length: "31", width: "48", chest: "24" },
        { size: "2XL", length: "32", width: "52", chest: "26" },
        { size: "3XL", length: "33", width: "56", chest: "28" },
        { size: "4XL", length: "33.9", width: "59.8", chest: "29.9" },
        { size: "5XL", length: "35", width: "63.8", chest: "31.9" },
      ],
    },
  },
  "white-idol-morning": {
    title: "Good Morning",
    subtitle: "",
    category: "ADULT HUMOR",
    price: 21.69,
    originalPrice: 41.69,
    image: whiteIdolMorning,
    images: [whiteIdolMorning, "/images/carousel/white-idol-morning-1.png", "/images/carousel/white-idol-morning-2.png"],
    productType: "shirt",
    availableColors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Sand", hex: "#C2B280" },
      { name: "Light Blue", hex: "#ADD8E6" },
      { name: "Sport Grey", hex: "#9B9B9B" },
    ],
    material: `100% preshrunk cotton (5.3 oz/yd² / 180 g/m²). Gildan® 5000 heavyweight body. Seamless double-needle collar, taped neck & shoulders. DTG-printed graphics.`,
    description: `Make a statement without saying a word! This heavyweight cotton T-shirt isn't just a durable staple—it's your new favorite sidekick for easygoing vibes with a wink. Front and center: a beautiful mountain sunrise with the message wonderfully and subtly woven into the landscape. From afar it's serene; up close it's delightfully clever. A relaxed style that says, "I'm comfy, I'm outdoorsy, and yes, I'm a sunrise person—after coffee."

Seamless double-needle collar: Because your morning should be seamless—unlike your snooze-button streak.

Double-needle sleeve and bottom hems: Reinforced to survive trail dust, coffee drips, and spontaneous road trips.

100% cotton: Soft, breathable, and perfect for days you want to look like you tried (but didn't).

Taped neck and shoulders for durability: Built to last longer than your latest morning routine hack.`,
    fit: `Whether you're small or rocking 5XL, we've got a size that fits your vibe.`,
    care: `General: This tee is the triple threat—comfort, style, and durability all rolled into one sunrise-ready package.
Wash: Keep those dawn hues bright—cold water, similar colors.
Dry: Tumble dry low or hang it up, just like you do with your standards.
Store: Perfect for anyone who loves crisp mornings, scenic views, and a clever reveal.`,
    sizeChart: {
      cm: [
        { size: "S", length: "71.1", width: "91.4", chest: "45.7" },
        { size: "M", length: "73.7", width: "101.6", chest: "50.8" },
        { size: "L", length: "76.2", width: "111.8", chest: "55.9" },
        { size: "XL", length: "78.7", width: "122", chest: "61" },
        { size: "2XL", length: "81.3", width: "132", chest: "66" },
        { size: "3XL", length: "83.8", width: "142.2", chest: "71.1" },
        { size: "4XL", length: "86", width: "152", chest: "76" },
        { size: "5XL", length: "89", width: "162", chest: "81" },
      ],
      inches: [
        { size: "S", length: "28", width: "36", chest: "18" },
        { size: "M", length: "29", width: "40", chest: "20" },
        { size: "L", length: "30", width: "44", chest: "22" },
        { size: "XL", length: "31", width: "48", chest: "24" },
        { size: "2XL", length: "32", width: "52", chest: "26" },
        { size: "3XL", length: "33", width: "56", chest: "28" },
        { size: "4XL", length: "33.9", width: "59.8", chest: "29.9" },
        { size: "5XL", length: "35", width: "63.8", chest: "31.9" },
      ],
    },
  },
  "fathers": {
    title: "Fathers",
    subtitle: "If dad can't fix it we're all screwed",
    category: "FATHERS",
    price: 15.69,
    originalPrice: 35.69,
    image: fathers,
    images: [fathers, "/images/carousel/fathers-1.png", "/images/carousel/fathers-2.png"],
    productType: "shirt",
    availableColors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#1B1F3B" },
      { name: "Charcoal", hex: "#36454F" },
    ],
    material: `100% combed, ring-spun cotton (4.3 oz/yd² / 146 g/m²). Premium fitted body. Heather colors: 90% cotton, 10% polyester. Classic crew neckline.`,
    description: `This premium fitted short sleeve is more than just comfy and light — it's a wearable warning. The bold print makes it clear: if Dad can't fix it, we're all officially doomed. Great for family BBQs, DIY disasters, or just reminding everyone who really keeps things from falling apart.

The unisex cotton crew tee comes with a light fabric (4.3 oz/yd² / 146 g/m²) making it an excellent all-season choice. Made with 100% combed, ring-spun cotton for long-lasting comfort and dad-level durability.

Fabric blends: Heather colors — 90% cotton, 10% polyester.

The classic fit and crew neckline offer a timeless style perfect for accessorizing — maybe with a wrench or a roll of duct tape.`,
    fit: `Whether you're small or rocking 5XL, we've got a size that fits your vibe.`,
    care: `General: Comfort, style, and durability all in one — the ultimate dad tee.
Wash: Keep those colors fresh—cold water, similar colors.
Dry: Tumble dry low or hang it up, just like you do with your standards.`,
    sizeChart: {
      cm: [
        { size: "S", length: "71.1", width: "91.4", chest: "45.7" },
        { size: "M", length: "73.7", width: "101.6", chest: "50.8" },
        { size: "L", length: "76.2", width: "111.8", chest: "55.9" },
        { size: "XL", length: "78.7", width: "122", chest: "61" },
        { size: "2XL", length: "81.3", width: "132", chest: "66" },
        { size: "3XL", length: "83.8", width: "142.2", chest: "71.1" },
        { size: "4XL", length: "86", width: "152", chest: "76" },
        { size: "5XL", length: "89", width: "162", chest: "81" },
      ],
      inches: [
        { size: "S", length: "28", width: "36", chest: "18" },
        { size: "M", length: "29", width: "40", chest: "20" },
        { size: "L", length: "30", width: "44", chest: "22" },
        { size: "XL", length: "31", width: "48", chest: "24" },
        { size: "2XL", length: "32", width: "52", chest: "26" },
        { size: "3XL", length: "33", width: "56", chest: "28" },
        { size: "4XL", length: "33.9", width: "59.8", chest: "29.9" },
        { size: "5XL", length: "35", width: "63.8", chest: "31.9" },
      ],
    },
  },
  "dark": {
    title: "Snarky — Punching People with Words & Attitude",
    subtitle: "For when your words hit harder than your fists",
    category: "DARK HUMOR",
    price: 15.69,
    originalPrice: 35.69,
    image: dark,
    images: [dark, "/images/carousel/dark-1.png", "/images/carousel/dark-2.png"],
    productType: "shirt",
    availableColors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Dark Heather", hex: "#4A4A4A" },
      { name: "Red", hex: "#C0392B" },
    ],
    material: `100% preshrunk cotton. Seamless double-needle collar. Tear-away label. Tubular fit reduces torque. High-density stitch surface for sharp DTG printing.`,
    description: `Soft, sassy, and ready to make a statement – just like you. This t-shirt isn't just for wearing; it's for owning the room with your snarky attitude. Designed with DTG printing in mind, it offers a high-density stitch surface so your sarcasm shines crisply, every time.

Key Features:

Seamless double-needle collar – Because rough edges are for amateurs.

Tear-away label – Perfect for those who don't do labels.

Tubular fit – Reduces torque because you're already twisted enough.

Available in a wide range of colors – A blank canvas for your most cutting comebacks.

Why punch people when words (and this shirt) do it better?`,
    fit: `A durable, comfortable, and versatile t-shirt that excels in printability and wearability, making it a top choice for custom designs.`,
    care: `Wash: Wash with similar colors and it will sustain regular washing without losing color or shape.
Dry: Tumble dry low or hang dry to maintain the integrity of the print and fabric.
Store: Keep in a cool, dry place away from direct sunlight to maintain color and fabric integrity.`,
    sizeChart: {
      cm: [
        { size: "S", length: "71", width: "92", chest: "46" },
        { size: "M", length: "74", width: "102", chest: "51" },
        { size: "L", length: "76", width: "112", chest: "56" },
        { size: "XL", length: "79", width: "122", chest: "61" },
        { size: "2XL", length: "81", width: "132", chest: "66" },
        { size: "3XL", length: "85", width: "142", chest: "71" },
      ],
      inches: [
        { size: "S", length: "28", width: "36.2", chest: "18.1" },
        { size: "M", length: "29.1", width: "40.2", chest: "20.1" },
        { size: "L", length: "29.9", width: "44.1", chest: "22" },
        { size: "XL", length: "31.1", width: "48", chest: "24" },
        { size: "2XL", length: "31.9", width: "52", chest: "26" },
        { size: "3XL", length: "33.5", width: "55.9", chest: "28" },
      ],
    },
  },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const product = PRODUCT_DATA[id as keyof typeof PRODUCT_DATA];
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [mockupPreview, setMockupPreview] = useState<string | null>(null);
  const [generatingMockup, setGeneratingMockup] = useState(false);

  // Auto-generate mockup when color is selected
  useEffect(() => {
    if (!selectedColor || !product) return;

    setMockupPreview(null);
    setGeneratingMockup(true);

    const toAbsoluteUrl = (path: string) => {
      if (path.startsWith('http') || path.startsWith('data:')) return path;
      return window.location.origin + (path.startsWith('/') ? path : '/' + path);
    };

    const productImgUrl = toAbsoluteUrl(product.image);

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Mockup generation timed out')), 45000)
    );

    const apiCall = supabase.functions.invoke('generate-user-mockup', {
      body: {
        userImage: productImgUrl,
        productImage: productImgUrl,
        productTitle: product.title,
        productColor: selectedColor,
      },
    });

    Promise.race([apiCall, timeout])
      .then(({ data, error }: any) => {
        if (error) {
          console.error('[Mockup] Error:', error);
          return;
        }
        if (data?.mockupUrl) {
          setMockupPreview(data.mockupUrl);
        }
      })
      .catch((err) => {
        console.error('[Mockup] Failed:', err);
      })
      .finally(() => setGeneratingMockup(false));
  }, [selectedColor]);

  if (!product) {
    navigate("/");
    return null;
  }

  const savings = product.originalPrice - product.price;
  const isGreetingCard = product.productType === "greeting-card";
  const isBlanket = product.productType === "blanket";

  const handleAddToCart = () => {
    addItem({
      productId: id!,
      title: product.title,
      price: product.price,
      size: selectedSize,
      image: product.image,
      printifyProductId: id,
      variantId: selectedSize,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        {/* Compact 2-column purchase layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT: Sticky product image */}
          <div className="md:sticky md:top-4 md:self-start space-y-4">
            <ImageCarousel
              images={product.images}
              alt={product.title}
            />

            {/* Auto-generated color mockup preview */}
            {(generatingMockup || mockupPreview) && (
              <div>
                <h3 className="text-sm font-bold mb-2">Color Preview</h3>
                {generatingMockup ? (
                  <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="text-xs text-muted-foreground">Generating {selectedColor} preview...</p>
                    </div>
                  </div>
                ) : mockupPreview ? (
                  <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                    <img src={mockupPreview} alt={`${product.title} in ${selectedColor}`} className="w-full h-full object-contain" />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* RIGHT: Compact purchase flow */}
          <div className="space-y-5">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-foreground mt-1 leading-tight">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="text-lg font-bold text-foreground/80 mt-1">
                  {product.subtitle}
                </p>
              )}

              {/* Strikethrough pricing */}
              <div className="flex items-center gap-3 mt-3">
                <p className="text-3xl font-black text-foreground">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-xl font-bold text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </p>
                <span className="inline-flex items-center gap-1 bg-green-500/15 text-green-500 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/20">
                  <Tag className="h-3 w-3" />
                  SAVE ${savings.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Material - compact one-liner */}
            <div className="flex items-start gap-2 bg-card border border-border rounded-lg px-3 py-2.5">
              <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">{product.material}</p>
            </div>

            {/* Fixed spec badges for greeting cards */}
            {product.fixedSpecs && product.fixedSpecs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.fixedSpecs.map((spec) => (
                  <span key={spec} className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Color Selection */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wider">
                  Color {selectedColor && <span className="text-primary normal-case">— {selectedColor}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 relative ${selectedColor === color.name
                        ? "border-primary ring-2 ring-primary/30 scale-110"
                        : "border-border hover:border-foreground/50 hover:scale-105"
                        }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.name && (
                        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${color.hex === "#FFFFFF" || color.hex === "#F5F5DC" ? "text-black" : "text-white"
                          }`}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {!isGreetingCard && (
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wider">Size</label>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizeChart.inches.map((item) => (
                    <Button
                      key={item.size}
                      variant={selectedSize === item.size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(item.size)}
                      className="h-8 px-3 text-xs"
                    >
                      {item.size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA buttons */}
            {!isBlanket && (
              <Button size="xl" className="w-full group" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                ADD TO CART
              </Button>
            )}
            {isBlanket && (
              <Button size="xl" variant="default" className="w-full group" onClick={() => navigate("/custom-design?product=blanket")}>
                <Sparkles className="mr-2 h-5 w-5" />
                DESIGN YOUR BLANKET
              </Button>
            )}
          </div>
        </div>

        {/* Details tabs — BELOW the purchase section */}
        <div className="mt-12 max-w-3xl">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description" className="font-bold text-xs">Description</TabsTrigger>
              <TabsTrigger value="size" className="font-bold text-xs">Size Chart</TabsTrigger>
              <TabsTrigger value="care" className="font-bold text-xs">Care</TabsTrigger>
              <TabsTrigger value="tryit" className="font-bold text-xs">{isBlanket ? "Preview" : "Try It On"}</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <div className="prose prose-sm max-w-none">
                {product.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-black text-base text-foreground mb-1">Fit & Sizing</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {product.fit}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="size" className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-foreground mb-2">
                  {isBlanket ? "Dimensions (inches)" : "Inches (garment lay-flat)"}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card">
                        <th className="text-left p-2 font-bold">Size</th>
                        <th className="text-left p-2 font-bold">{isBlanket ? "Height" : "Length"}</th>
                        {'width' in product.sizeChart.inches[0] && (
                          <th className="text-left p-2 font-bold">Width</th>
                        )}
                        <th className="text-left p-2 font-bold">{isBlanket ? "Width" : "Half Chest"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.sizeChart.inches.map((row) => (
                        <tr key={row.size} className="border-b border-border">
                          <td className="p-2 font-semibold">{row.size}</td>
                          <td className="p-2">{row.length}</td>
                          {'width' in row && <td className="p-2">{(row as any).width}</td>}
                          <td className="p-2">{row.chest}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="care">
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {product.care}
              </p>
            </TabsContent>

            <TabsContent value="tryit">
              <AIMockupGenerator
                productImage={product.image}
                productTitle={product.title}
                productColor={selectedColor || "White"}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
