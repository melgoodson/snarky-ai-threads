import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Star } from "lucide-react";
import personalizationBlanket from "@/assets/personalization-blanket.png";
import { resolveDesignImage } from "@/lib/resolveDesignImage";

interface Design {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

// Monthly featured rotation — SEO-researched themes per month
// Each month targets high-volume keywords from AnswerThePublic / search data
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
    headline: "SUMMER SNARK",
    subheadline: "Bold summer vibes. Snarky tees, custom hoodies for chilly nights, and gifts that pop.",
    themes: [
      { label: "🏖️ Summer Attitude", keywords: "snarky t shirts, attitude summer tee, bold design shirt" },
      { label: "💀 Dark Humor", keywords: "dark humor shirt, twisted humor apparel" },
      { label: "🧥 Custom Hoodies", keywords: "personalized hoodie, custom print hoodie" },
      { label: "🎨 All Designs", keywords: "snarky designs, sarcastic quote apparel" },
    ],
  },
  7: { // August
    headline: "BACK TO SNARK",
    subheadline: "School's back, attitude never left. Snarky picks for students, teachers, and rebels.",
    themes: [
      { label: "📚 Back to School", keywords: "funny school shirt, snarky student tee" },
      { label: "🏥 Nurse & Teacher Snark", keywords: "snarky nurses, funny teacher shirt" },
      { label: "👕 Custom T-Shirts", keywords: "custom t shirt printing for sarcastic designs, personalized t shirts" },
      { label: "💼 Office Snark", keywords: "snarky office signs, snarky pens" },
    ],
  },
  8: { // September
    headline: "FALL INTO ATTITUDE",
    subheadline: "Cozy season, snarky style. Blankets, hoodies, and mugs with personality.",
    themes: [
      { label: "🍂 Fall Vibes", keywords: "fall attitude shirt, cozy snarky hoodie" },
      { label: "🛏️ Photo Blankets", keywords: "personalized blanket, custom photo blanket" },
      { label: "🧥 Hoodies", keywords: "snarky hoodie, custom print hoodie, personalized hoodie" },
      { label: "☕ Mugs", keywords: "snarky coffee mug, personalized coffee mug" },
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
    headline: "THANKFUL & SNARKY",
    subheadline: "Black Friday meets attitude. Personalized gift guide for everyone on your list.",
    themes: [
      { label: "🦃 Thanksgiving Snark", keywords: "funny thanksgiving shirt, snarky holiday tee" },
      { label: "🛒 Gift Guide", keywords: "personalized gifts christmas, best websites to order personalized gifts online" },
      { label: "💞 Gifts for Couples", keywords: "affordable personalized gifts for couples, personalized anniversary gifts" },
      { label: "👵 Gifts for Grandma", keywords: "personalized gifts grandma, custom photo gift grandma" },
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

const getCurrentMonthData = () => {
  const month = new Date().getMonth();
  return MONTHLY_FEATURED[month] || MONTHLY_FEATURED[1]; // fallback to Feb
};

export const ProductGrid = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const monthData = getCurrentMonthData();

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  // Pick first 6 designs as featured (in production, use a featured flag or admin curation)
  const featuredDesigns = designs.slice(0, 6);
  const allDesigns = designs;

  if (loading) {
    return (
      <section id="products" className="py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              FEATURED <span className="text-primary">DESIGNS</span>
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
        {/* HIDDEN: investigating print quality
        <div className="mb-20">
          <div className="text-center mb-8">
            <span className="text-sm font-bold text-primary uppercase tracking-widest">NEW • HIGH DEMAND</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4 mt-2">
              PERSONALIZATION <span className="text-primary">BLANKETS</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
              The #1 personalized gift — upload your photos and create a custom blanket. Perfect for birthdays, holidays, and every "just because" moment.
            </p>
          </div>
          <div
            className="max-w-md mx-auto cursor-pointer group"
            onClick={() => navigate("/product/personalization-blanket")}
          >
            <div className="relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
              <div className="aspect-square overflow-hidden">
                <img
                  src={personalizationBlanket}
                  alt="Personalization Blanket – Custom Photo Blanket with your pictures"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 text-center">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Personalized Gifts</span>
                <h3 className="font-black text-2xl text-foreground mt-2 group-hover:text-primary transition-colors">
                  Custom Photo Blanket
                </h3>
                <p className="text-muted-foreground text-sm mt-1 font-medium">Upload your photos • Made to order</p>
                <p className="text-3xl font-black text-foreground mt-2">$49.99</p>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Featured This Month — SEO-optimized monthly rotation */}
        {featuredDesigns.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-widest">Featured This Month</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                {monthData.headline.split(' ').map((word, i) => (
                  <span key={i} className={i === monthData.headline.split(' ').length - 1 ? "text-primary" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
                {monthData.subheadline}
              </p>
            </div>

            {/* Monthly theme tags — rich keyword signals */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {monthData.themes.map((theme) => (
                <span
                  key={theme.label}
                  className="text-xs font-semibold bg-secondary px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-default"
                  title={theme.keywords}
                >
                  {theme.label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDesigns.map((design) => (
                <ProductCard
                  key={design.id}
                  id={design.id}
                  title={design.title}
                  price={0}
                  image={resolveDesignImage(design.image_url)}
                  category=""
                  badge="FEATURED"
                />
              ))}
            </div>
          </div>
        )}

        {/* All Designs */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            ALL <span className="text-primary">DESIGNS</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            Browse the full collection. Because normal is boring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allDesigns.map((design) => (
            <ProductCard
              key={design.id}
              id={design.id}
              title={design.title}
              price={0}
              image={resolveDesignImage(design.image_url)}
              category=""
            />
          ))}
        </div>
      </div>
    </section>
  );
};
