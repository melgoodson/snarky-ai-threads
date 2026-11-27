import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shirt, Palette, Sparkles, Flame, Calendar, Gift } from "lucide-react";
import { resolveDesignImage } from "@/lib/resolveDesignImage";
import { HIDDEN_DESIGN_PATTERNS, isHiddenDesign } from "@/lib/designConstants";

// Curated 2-Row (8-item) Featured Apparel Showcase with paired lifestyle & design art views
const FEATURED_APPAREL_ITEMS = [
  {
    id: "caution-choking-hazard",
    title: "Caution: Choking Hazard — Heavyweight Tee",
    price: 15.69,
    originalPrice: 35.69,
    image: "/images/designs/1.jpeg",
    hoverImage: "/images/designs/caution-choking-hazard-art.png",
    category: "NEW DROP • GAG HUMOR",
    badge: "🔥 NEW DROP",
    href: "/product/caution-choking-hazard",
  },
  {
    id: "dig-bick-read-wrong",
    title: "I Got a Dig Bick — Double-Take Tee",
    price: 15.69,
    originalPrice: 35.69,
    image: "/images/designs/5.jpeg",
    hoverImage: "/images/designs/dig-bick-read-wrong-art.png",
    category: "NEW DROP • SARCASM TEE",
    badge: "🔥 NEW DROP",
    href: "/product/dig-bick-read-wrong",
  },
  {
    id: "warning-choking-hazard",
    title: "Warning: Choking Hazard (Large Parts) — Tee",
    price: 15.69,
    originalPrice: 35.69,
    image: "/images/designs/2.jpeg",
    hoverImage: "/images/designs/warning-choking-hazard-art.png",
    category: "NEW DROP • ADULT HUMOR",
    badge: "🔥 NEW DROP",
    href: "/product/warning-choking-hazard",
  },
  {
    id: "f2acfadd-7310-43d8-b437-74c5449c8c70",
    title: "Kindly F*ck Off — Heavyweight Tee",
    price: 15.69,
    originalPrice: 35.69,
    image: "/images/carousel/shirt-hero-new-1.jpg",
    hoverImage: "/images/designs/1.jpg",
    category: "BESTSELLER TEE",
    badge: "BEST SELLER",
    href: "/designs/f2acfadd-7310-43d8-b437-74c5449c8c70",
  },
  {
    id: "8e16af21-c0a0-46b4-a90b-d1eb95e0754e",
    title: "Respectfully, No! — Retro Pin-Up Tee",
    price: 15.69,
    originalPrice: 35.69,
    image: "/images/carousel/shirt-hero-new-2.jpg",
    hoverImage: "/images/designs/6.jpg",
    category: "SNARKY TEE",
    href: "/designs/8e16af21-c0a0-46b4-a90b-d1eb95e0754e",
  },
  {
    id: "8bebc34c-e44d-4439-a131-51f89e3c9aa1",
    title: "How Bold of You to Ass-U-Me I Care — Hoodie",
    price: 39.99,
    originalPrice: 59.99,
    image: "/images/carousel/hoodie-hero-2.jpg",
    hoverImage: "/images/designs/2.jpg",
    category: "COZY HOODIE",
    badge: "FAN FAVORITE",
    href: "/designs/8bebc34c-e44d-4439-a131-51f89e3c9aa1",
  },
  {
    id: "free-hugs",
    title: "Free Hugs — Horror Slasher Tee",
    price: 21.69,
    originalPrice: 41.69,
    image: "/images/carousel/free-hugs-2.png",
    hoverImage: "/images/carousel/free-hugs-1.png",
    category: "DARK HUMOR TEE",
    href: "/product/free-hugs",
  },
  {
    id: "abduct-me",
    title: "Abduct Me — I'm Done With Humans Tee",
    price: 21.69,
    originalPrice: 41.69,
    image: "/images/carousel/abduct-me-2.png",
    hoverImage: "/images/carousel/abduct-me-1.png",
    category: "ALIEN HUMOR TEE",
    badge: "GIFT PICK",
    href: "/product/abduct-me",
  },
];

// Latest paired tee designs also surfaced at the top of All Designs (standalone design art)
const LATEST_PAIRED_DESIGNS: Design[] = [
  {
    id: "caution-choking-hazard",
    title: "Caution: Choking Hazard — Heavyweight Tee",
    description: "High-voltage distressed yellow warning graphic tee — paired with lifestyle & flat-lay views.",
    image_url: "/images/designs/caution-choking-hazard-art.png",
    href: "/product/caution-choking-hazard",
    badge: "🔥 NEW DROP",
  },
  {
    id: "dig-bick-read-wrong",
    title: "I Got a Dig Bick — You Read That Wrong Tee",
    description: "I Got a Dig Bick — You That Read Wrong — You Read That Wrong Too double-take graphic tee.",
    image_url: "/images/designs/dig-bick-read-wrong-art.png",
    href: "/product/dig-bick-read-wrong",
    badge: "🔥 NEW DROP",
  },
  {
    id: "warning-choking-hazard",
    title: "Warning: Choking Hazard (Large Parts) — Tee",
    description: "Warning: Choking Hazard — Package Contains Large Parts — Keep Out Of Reach Of Small Women gag tee.",
    image_url: "/images/designs/warning-choking-hazard-art.png",
    href: "/product/warning-choking-hazard",
    badge: "🔥 NEW DROP",
  },
];

// Designs within each event group that should get the "FEATURED" badge.
// Title substrings are matched case-insensitively.
const FEATURED_BADGE_PATTERNS: Record<string, string[]> = {
  "labor-day": [
    "Back to Work Tomorrow",
    "Pretend to Love Workers",
    "One Day They Thank",
    "Well-Deserved Nap",
  ],
  // Other event groups: all designs are featured by default
};

interface Design {
  id: string;
  title: string;
  description: string;
  image_url: string;
  hover_image_url?: string;
  href?: string;
  badge?: string;
}

// Monthly featured rotation — SEO-researched themes per month
const MONTHLY_FEATURED: Record<number, {
  headline: string;
  subheadline: string;
  themes: { label: string; keywords: string }[];
}> = {
  0: { // January
    headline: "NEW YEAR, NEW SNARK",
    subheadline: "Start the year with attitude. Fresh snarky designs for people who don't do resolutions.",
    themes: [
      { label: "🎆 New Year Snark", keywords: "snarky new year shirts, funny resolution tee" },
      { label: "😈 Dark Humor", keywords: "dark humor shirt, offensive funny tee" },
      { label: "☕ Snarky Mugs", keywords: "snarky coffee mug, funny mug gift" },
      { label: "🎁 Personalized Gifts", keywords: "personalized gifts, custom photo blanket" },
    ],
  },
  1: { // February
    headline: "LOVE IS SNARKY",
    subheadline: "Personalized gifts with attitude. Snarky Valentine's picks for him, her, and everyone who hates Hallmark.",
    themes: [
      { label: "💘 Snarky Valentine's", keywords: "snarky valentine shirt, funny valentine gift" },
      { label: "🎁 Gifts for Him", keywords: "personalized gifts for him, personalized gifts for boyfriend" },
      { label: "💝 Gifts for Her", keywords: "personalized gifts for her, personalized gifts for girlfriend" },
      { label: "📸 Photo Gifts", keywords: "personalized gifts with photo, custom photo blanket, photo mug" },
      { label: "😏 Sarcastic Cards", keywords: "snarky birthday cards, funny sarcastic greeting cards" },
    ],
  },
  2: { // March
    headline: "LUCK OF THE SNARKY",
    subheadline: "Spring into attitude. Bold designs and personalized gifts that actually mean something.",
    themes: [
      { label: "🍀 St. Patrick's Snark", keywords: "funny irish shirt, snarky st patricks tee" },
      { label: "🌸 Spring Attitude", keywords: "snarky t shirts, attitude apparel, sarcastic clothing" },
      { label: "👩 Gifts for Mom", keywords: "personalized gifts for mom, personalized gifts to mom" },
      { label: "🏥 Snarky Nurses", keywords: "snarky nurses, nurse attitude shirt, funny nurse gift" },
    ],
  },
  3: { // April
    headline: "FOOL-PROOF SNARK",
    subheadline: "Life's a joke — wear it. April's top snarky picks and custom gifts.",
    themes: [
      { label: "🃏 April Fools", keywords: "funny prank shirt, sarcastic humor tee" },
      { label: "👕 Snarky Tees", keywords: "snarky t shirts, funny quote shirt, sarcastic t-shirt" },
      { label: "🎂 Birthday Gifts", keywords: "unique personalized gift ideas for birthdays, snarky birthday cards" },
      { label: "🏠 Office Snark", keywords: "snarky office signs, snarky pens, snarky notebooks" },
    ],
  },
  4: { // May
    headline: "MOM DESERVES SNARK",
    subheadline: "Personalized gifts for the mom who's earned her attitude. Custom blankets, mugs, and tees.",
    themes: [
      { label: "👩‍👧 Gifts for Mom", keywords: "personalized gifts for mom, personalized gifts to mom, mothers day gift" },
      { label: "📸 Photo Blankets", keywords: "personalized blanket, custom photo blanket, personalization blanket" },
      { label: "☕ Custom Mugs", keywords: "personalized coffee mug, snarky coffee mug" },
      { label: "👜 Tote Bags", keywords: "personalized tote bags, custom tote bag gift" },
    ],
  },
  5: { // June
    headline: "DAD JOKE SEASON",
    subheadline: "Father's Day picks: snarky shirts, personalized gifts, and dad-approved attitude.",
    themes: [
      { label: "👨 Gifts for Dad", keywords: "personalized gifts for men, personalized gifts for him, fathers day gift" },
      { label: "🔧 Dad Humor", keywords: "funny dad shirt, if dad cant fix it, dad joke tee" },
      { label: "🎁 Personalized Gifts", keywords: "personalized gifts, personalized gifts for men" },
      { label: "👽 Alien Humor", keywords: "alien t-shirt, ufo funny shirt" },
    ],
  },
  6: { // July
    headline: "SUMMER SNARK & ATTITUDE",
    subheadline: "Bold graphic tees, funny coffee mugs, and unapologetic gifts for every summer occasion.",
    themes: [
      { label: "👕 Graphic Tees", keywords: "snarky t-shirts, funny summer shirt, sarcastic graphic tee" },
      { label: "☕ Funny Mugs", keywords: "snarky coffee mug, funny coworker mug, sarcastic gift" },
      { label: "🎁 Gag Gifts", keywords: "funny gag gifts, adult humor shirts, birthday roast gifts" },
      { label: "✨ AI Custom Gifts", keywords: "ai custom clothing, personalized gifts, custom shirt design" },
    ],
  },
  7: { // August
    headline: "UNFILTERED ATTITUDE",
    subheadline: "Heavyweight graphic tees, custom journals, and sarcastic gifts for people who refuse to wear boring clothes.",
    themes: [
      { label: "👕 Heavyweight Tees", keywords: "snarky t-shirts, sarcastic graphic tee, heavyweight cotton shirt" },
      { label: "📓 Custom Journals", keywords: "funny office notebook, custom hardcover journal, coworker gift" },
      { label: "☕ Sarcastic Mugs", keywords: "funny coffee mug, office humor mug" },
      { label: "🎁 Personalized Gifts", keywords: "personalized gifts, ai custom clothing" },
    ],
  },
  8: { // September
    headline: "FALL INTO SNARK",
    subheadline: "Cozy fleece hoodies, heavyweight graphic tees, and personalized gifts built for cooler weather and sharper humor.",
    themes: [
      { label: "🧥 Snarky Hoodies", keywords: "funny graphic hoodie, sarcastic sweatshirt, cozy fall hoodie" },
      { label: "👕 Sarcastic Tees", keywords: "snarky t-shirts, funny graphic tees" },
      { label: "☕ Coffee Mugs", keywords: "snarky coffee mug, funny coworker gift" },
      { label: "🎁 Custom Gifts", keywords: "personalized gifts, custom photo blanket" },
    ],
  },
  9: { // October
    headline: "SPOOKY SNARK",
    subheadline: "Halloween attitude: dark humor, creepy cards, and gifts for your favorite monsters.",
    themes: [
      { label: "🎃 Halloween Snark", keywords: "dark humor halloween, spooky snarky shirt" },
      { label: "💀 Dark Humor", keywords: "dark humor shirt, offensive funny tee, twisted humor" },
      { label: "👻 Snarky Cards", keywords: "snarky birthday cards, funny sarcastic greeting cards" },
      { label: "🎁 Unique Gifts", keywords: "unique gift ideas for someone with a dry wit" },
    ],
  },
  10: { // November
    headline: "SNARKY APPAREL & GIFTS",
    subheadline: "Heavyweight graphic tees, cozy hoodies & gag gifts — Buy 3, Get 1 FREE storewide!",
    themes: [
      { label: "🔥 Buy 3, Get 1 FREE", keywords: "buy 3 get 1 free shirts, snarky t-shirt sale" },
      { label: "👕 Heavyweight Tees", keywords: "snarky t-shirts, sarcastic graphic tees" },
      { label: "🧥 Snarky Hoodies", keywords: "funny hoodies, sarcastic sweatshirt" },
      { label: "🎄 Holiday & White Elephant", keywords: "white elephant gifts, funny gag shirts" },
    ],
  },
  11: { // December
    headline: "SNARKY CHRISTMAS",
    subheadline: "The #1 personalized gift shop for people who say what they mean. Custom photo gifts, snarky stocking stuffers, and more.",
    themes: [
      { label: "🎄 Christmas Gifts", keywords: "personalized christmas gifts, personalized gifts christmas, personalized gifts xmas" },
      { label: "📸 Photo Gifts", keywords: "personalized gifts with photo, personalized gifts with pictures, personalized gifts using photos" },
      { label: "🧦 Stocking Stuffers", keywords: "snarky stickers, snarky pens, snarky coffee mug" },
      { label: "💝 Personalized Gifts", keywords: "personalized gifts for him, personalized gifts for her, personalized gifts for mom" },
      { label: "🎅 Last-Minute Gifts", keywords: "personalized gifts by christmas, best websites for photo gifts with fast delivery" },
    ],
  },
};

const FALLBACK_DESIGNS: Design[] = [
  ...LATEST_PAIRED_DESIGNS,
];

const getCurrentMonthData = () => {
  const month = new Date().getMonth();
  return MONTHLY_FEATURED[month] || MONTHLY_FEATURED[10];
};

interface ProductGridProps {
  categorySlug?: string;
  section?: "both" | "featured-hero" | "all-only";
}

export const ProductGrid = ({ categorySlug, section = "both" }: ProductGridProps) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroTab, setHeroTab] = useState<"apparel" | "seasonal">("apparel");
  const [showOnShirt, setShowOnShirt] = useState(false);
  const navigate = useNavigate();

  // Dynamic month data — starts with hardcoded defaults, overridden by DB schedule
  const [monthData, setMonthData] = useState(getCurrentMonthData());
  const [scheduledDesignIds, setScheduledDesignIds] = useState<string[] | null>(null);

  // Fetch admin-scheduled featured config for the current month
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const month = new Date().getMonth();
        const { data, error } = await supabase
          .from("featured_schedules")
          .select("*")
          .eq("month", month)
          .eq("is_active", true)
          .maybeSingle();

        if (!error && data && data.headline) {
          setMonthData({
            headline: data.headline.replace(/Q3\s*/g, ""),
            subheadline: (data.subheadline || getCurrentMonthData().subheadline).replace(/\s*Q3\s*/g, " "),
            themes: (data.themes as { label: string; keywords: string }[]) || getCurrentMonthData().themes,
          });
          if (data.design_ids && data.design_ids.length > 0) {
            setScheduledDesignIds(data.design_ids);
            // If admin explicitly scheduled designs for the current month, default to showing them
            setHeroTab("seasonal");
          }
        } else {
          setMonthData(getCurrentMonthData());
        }
      } catch {
        setMonthData(getCurrentMonthData());
      }
    };
    fetchSchedule();
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [categorySlug]);

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      let fetchedDesigns: Design[] = [...LATEST_PAIRED_DESIGNS, ...(data || [])];
      const existingUrls = new Set(
        fetchedDesigns.map((d) => resolveDesignImage(d.image_url))
      );
      const missingQ3 = FALLBACK_DESIGNS.filter(
        (d) => !existingUrls.has(resolveDesignImage(d.image_url))
      );
      fetchedDesigns = [...fetchedDesigns, ...missingQ3];

      // Deduplicate by resolved image URL and title
      const seenImages = new Set<string>();
      fetchedDesigns = fetchedDesigns.filter((d) => {
        const key = resolveDesignImage(d.image_url).toLowerCase();
        if (seenImages.has(key)) return false;
        seenImages.add(key);
        return true;
      });

      // Filter designs based on target gift persona or category keywords
      if (categorySlug) {
        const slug = categorySlug.toLowerCase();
        if (slug.includes("coworker") || slug.includes("office")) {
          fetchedDesigns = fetchedDesigns.filter((d) =>
            ["RBF Champion", "Snarky Humans", "Dark", "White Idol Morning", "Dig Bick"].some((t) => d.title.includes(t))
          );
        } else if (slug.includes("men") || slug.includes("dad")) {
          fetchedDesigns = fetchedDesigns.filter((d) =>
            ["Fathers", "Sasquatches", "Abduct Me", "Choking Hazard", "Dig Bick"].some((t) => d.title.includes(t))
          );
        } else if (slug.includes("mom") || slug.includes("mother")) {
          fetchedDesigns = fetchedDesigns.filter((d) =>
            ["RBF Champion", "Snarky Humans", "White Idol Morning", "Good Morning"].some((t) => d.title.includes(t))
          );
        } else if (slug.includes("teacher")) {
          fetchedDesigns = fetchedDesigns.filter((d) =>
            ["RBF Champion", "Snarky Humans", "White Idol Morning", "Dark"].some((t) => d.title.includes(t))
          );
        } else if (slug.includes("christmas") || slug.includes("white-elephant") || slug.includes("gag")) {
          fetchedDesigns = fetchedDesigns.filter((d) =>
            ["Choking Hazard", "Dig Bick", "Free Hugs", "Abduct Me", "Sasquatches", "Dark", "RBF Champion", "Snarky Humans"].some((t) => d.title.includes(t))
          );
        }
      }

      setDesigns(fetchedDesigns);
    } catch {
      setDesigns(FALLBACK_DESIGNS);
    } finally {
      setLoading(false);
    }
  };

  const visibleAllDesigns = designs.filter(
    (design) => !isHiddenDesign(design)
  );

  const scheduledDesigns =
    scheduledDesignIds && scheduledDesignIds.length > 0
      ? visibleAllDesigns.filter((d) => scheduledDesignIds.includes(d.id))
      : [];

  const seasonalDesigns: Design[] = [...scheduledDesigns];
  for (const d of visibleAllDesigns) {
    if (seasonalDesigns.length >= 8) break;
    if (!seasonalDesigns.some((existing) => existing.id === d.id)) {
      seasonalDesigns.push(d);
    }
  }

  const featuredDesigns =
    scheduledDesigns.length > 0
      ? scheduledDesigns
      : visibleAllDesigns.slice(0, 8);

  const [activeEventTab, setActiveEventTab] = useState<string>("all");

  const getEventGroups = (_allFeatured: Design[]): {
    id: string;
    name: string;
    badge: string;
    icon: string;
    badgeBg: string;
    description: string;
    designs: Design[];
  }[] => {
    return [];
  };

  // ── Mode 1: Top-of-Homepage 2-Row Featured / Seasonal Clothing Hero ──
  if (section === "featured-hero") {
    return (
      <section className="pt-4 pb-8 md:pt-6 md:pb-12 border-b border-border/60 bg-gradient-to-b from-card/40 to-background">
        <div className="container px-4">
          {/* Compact Single-Row Header: Headline + Sale Callout + Quick Category Links */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 md:mb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                  <Gift className="h-3 w-3" />
                  BUY 3, GET 1 FREE
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  Sale Tees from <strong className="text-foreground">$15.69</strong> <span className="line-through opacity-75">$35.69</span> • Hover any card to view paired mockup
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none">
                {monthData.headline.split(" ").map((word, i, arr) => (
                  <span
                    key={i}
                    className={i === arr.length - 1 ? "text-primary" : ""}
                  >
                    {word}{" "}
                  </span>
                ))}
              </h1>
            </div>

            {/* Right Controls: Seasonal toggle (when scheduled) + Quick Category Links */}
            <div className="flex flex-wrap items-center gap-2">
              {scheduledDesigns.length > 0 && (
                <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
                  <button
                    type="button"
                    onClick={() => setHeroTab("apparel")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      heroTab === "apparel"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5" />
                    Featured Apparel
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroTab("seasonal")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      heroTab === "seasonal"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Seasonal Drops ({scheduledDesigns.length})
                  </button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="font-bold h-8 text-xs"
                onClick={() => navigate("/shirts")}
              >
                Graphic Tees
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-bold h-8 text-xs"
                onClick={() => navigate("/hoodies")}
              >
                Cozy Hoodies
              </Button>
              <Button
                variant="default"
                size="sm"
                className="font-bold h-8 text-xs"
                onClick={() => navigate("/custom-design")}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Customize Yours
              </Button>
            </div>
          </div>

          {/* 2 Rows of Clothing (8 items = 4 cols × 2 rows on desktop) */}
          {heroTab === "apparel" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {FEATURED_APPAREL_ITEMS.map((item, idx) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  image={item.image}
                  hoverImage={item.hoverImage}
                  category={item.category}
                  badge={item.badge}
                  href={item.href}
                  priority={idx < 4}
                />
              ))}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {seasonalDesigns.slice(0, 8).map((design) => (
                <ProductCard
                  key={design.id}
                  id={design.id}
                  title={design.title}
                  price={15.69}
                  originalPrice={35.69}
                  priceLabel="From"
                  image={resolveDesignImage(design.image_url)}
                  hoverImage={design.hover_image_url}
                  category="SEASONAL DESIGN"
                  badge={design.badge || "FEATURED"}
                  href={design.href}
                />
              ))}
            </div>
          )}

          {/* Bottom Quick Action Strip */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {monthData.themes.map((theme, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold bg-secondary/80 border border-border px-3 py-1 rounded-full text-muted-foreground"
                >
                  {theme.label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <Button
                variant="hero"
                size="sm"
                className="group font-bold"
                onClick={() => navigate("/designs")}
              >
                Browse All Designs
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="products" className="py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              ALL <span className="text-primary">DESIGNS</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium">
              Our most popular snarky shirts. Because normal is boring.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 md:py-24">
      <div className="container px-4">
        {/* Featured This Month — Separated by Holiday & Event (when section === "both") */}
        {section === "both" && featuredDesigns.length > 0 && (() => {
          const eventGroups = getEventGroups(featuredDesigns);
          const visibleGroups =
            activeEventTab === "all"
              ? eventGroups
              : eventGroups.filter((g) => g.id === activeEventTab);

          return (
            <div className="mb-20">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">
                    Featured This Month • Buy 3, Get 1 Free
                  </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                  {monthData.headline.split(" ").map((word, i) => (
                    <span
                      key={i}
                      className={
                        i === monthData.headline.split(" ").length - 1
                          ? "text-primary"
                          : ""
                      }
                    >
                      {word}{" "}
                    </span>
                  ))}
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
                  {monthData.subheadline}
                </p>
              </div>

              {eventGroups.length > 0 ? (
                <>
                  {/* Interactive Event Filter Tabs */}
                  <div className="flex flex-wrap justify-center gap-2 mb-12">
                    <button
                      onClick={() => setActiveEventTab("all")}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        activeEventTab === "all"
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                          : "bg-secondary/80 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      ✨ All Events ({featuredDesigns.length})
                    </button>
                    {eventGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => setActiveEventTab(group.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          activeEventTab === group.id
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                            : "bg-secondary/80 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <span>{group.icon}</span>
                        <span>
                          {group.name} ({group.designs.length})
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Categorized Event Sub-Sections */}
                  <div className="space-y-16">
                    {visibleGroups.map((group) => (
                      <div
                        key={group.id}
                        className="rounded-2xl border border-border/80 p-6 md:p-8 bg-card/60 backdrop-blur-sm shadow-xl transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-2xl">{group.icon}</span>
                              <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                                {group.name}
                              </h3>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${group.badgeBg}`}
                              >
                                {group.badge}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                              {group.description}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full w-fit">
                            {group.designs.length}{" "}
                            {group.designs.length === 1 ? "Design" : "Designs"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                          {group.designs
                            .filter((design) => {
                              const patterns = FEATURED_BADGE_PATTERNS[group.id];
                              return (
                                !patterns ||
                                patterns.some((p) =>
                                  design.title
                                    .toLowerCase()
                                    .includes(p.toLowerCase())
                                )
                              );
                            })
                            .map((design) => (
                              <ProductCard
                                key={design.id}
                                id={design.id}
                                title={design.title}
                                price={15.69}
                                originalPrice={35.69}
                                priceLabel="From"
                                image={resolveDesignImage(design.image_url)}
                                hoverImage={design.hover_image_url}
                                category={group.name}
                                badge="FEATURED"
                                href={design.href}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {featuredDesigns.slice(0, 8).map((design) => (
                    <ProductCard
                      key={design.id}
                      id={design.id}
                      title={design.title}
                      price={15.69}
                      originalPrice={35.69}
                      priceLabel="From"
                      image={resolveDesignImage(design.image_url)}
                      hoverImage={design.hover_image_url}
                      category="FEATURED APPAREL"
                      badge={design.badge || "FEATURED"}
                      href={design.href}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* All Designs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-2">
              ALL <span className="text-primary">DESIGNS</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-xl font-medium">
              Browse the full collection — Buy 3, Get 1 FREE across all tees, hoodies, mugs &amp; gifts.
            </p>
          </div>
          <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowOnShirt(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                !showOnShirt
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Design Art
            </button>
            <button
              type="button"
              onClick={() => setShowOnShirt(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                showOnShirt
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shirt className="h-3.5 w-3.5" />
              Preview on Tee
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {visibleAllDesigns.map((design) => (
            <ProductCard
              key={design.id}
              id={design.id}
              title={design.title}
              price={15.69}
              originalPrice={35.69}
              priceLabel="From"
              image={resolveDesignImage(design.image_url)}
              hoverImage={design.hover_image_url}
              category="SNARKY DESIGN"
              badge={design.badge}
              href={design.href}
              showOnShirt={showOnShirt}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
