import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Star } from "lucide-react";
import personalizationBlanket from "@/assets/personalization-blanket.png";
import { resolveDesignImage } from "@/lib/resolveDesignImage";

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

// Designs temporarily hidden from the "All Designs" grid.
// Title substrings matched case-insensitively.
const HIDDEN_DESIGN_PATTERNS: string[] = [
  // Non-featured Labor Day
  "World Takes All the Credit",
  "Fueled by Caffeine & Deadlines",
  "Deserves More Than a Holiday",
  "Adulting Is Hard",
  // Seasonal / temporarily hidden
  "Just Here for the Ice Cream",
  "Red, White & Scoops",
  "CEOs of Chaos",
  "World's Okayest Parent",
  "Powered by Love",
  "Snacks Are Currency",
  "Raising Humans Is Exhausting",
  "Snarky Humans",
];

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
    headline: "Q3 HOLIDAYS & ATTITUDE",
    subheadline: "Labor Day, Grandparents Day, 9/11 Patriot Remembrance, & Hispanic Heritage Month — snarky apparel for every Q3 event.",
    themes: [
      { label: "🛠️ Labor Day Snark", keywords: "labor day shirt, funny labor day tee, work humor, adulting is hard" },
      { label: "👵 Grandparents Day", keywords: "happy grandparents day shirt, funny grandparents gift, professional spoilers, awesome in aging" },
      { label: "🇺🇸 9/11 Patriot Day", keywords: "patriot day shirt, 9-11 remembrance tee, september 11 tribute, we will never forget" },
      { label: "💃 Hispanic Heritage Month", keywords: "hispanic heritage month shirt, nuestra cultura, nuestra historia, orgullo, viva la vida" },
    ],
  },
  7: { // August
    headline: "Q3 HOLIDAYS & ATTITUDE",
    subheadline: "Labor Day, Grandparents Day, 9/11 Patriot Remembrance, & Hispanic Heritage Month — snarky apparel for every Q3 event.",
    themes: [
      { label: "🛠️ Labor Day Snark", keywords: "labor day shirt, funny labor day tee, work humor, adulting is hard" },
      { label: "👵 Grandparents Day", keywords: "happy grandparents day shirt, funny grandparents gift, professional spoilers, awesome in aging" },
      { label: "🇺🇸 9/11 Patriot Day", keywords: "patriot day shirt, 9-11 remembrance tee, september 11 tribute, we will never forget" },
      { label: "💃 Hispanic Heritage Month", keywords: "hispanic heritage month shirt, nuestra cultura, nuestra historia, orgullo, viva la vida" },
    ],
  },
  8: { // September
    headline: "Q3 HOLIDAYS & ATTITUDE",
    subheadline: "Labor Day, Grandparents Day, 9/11 Patriot Remembrance, & Hispanic Heritage Month — snarky apparel for every Q3 event.",
    themes: [
      { label: "🛠️ Labor Day Snark", keywords: "labor day shirt, funny labor day tee, work humor, adulting is hard" },
      { label: "👵 Grandparents Day", keywords: "happy grandparents day shirt, funny grandparents gift, professional spoilers, awesome in aging" },
      { label: "🇺🇸 9/11 Patriot Day", keywords: "patriot day shirt, 9-11 remembrance tee, september 11 tribute, we will never forget" },
      { label: "💃 Hispanic Heritage Month", keywords: "hispanic heritage month shirt, nuestra cultura, nuestra historia, orgullo, viva la vida" },
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

const FALLBACK_DESIGNS: Design[] = [
  {
    id: "q3-labor-day-1",
    title: "Labor Day: Back to Work Tomorrow",
    description: "Cool woman in denim with sunglasses and coffee cup — Labor Day: Relax today because let's be real... You'll be back to work tomorrow.",
    image_url: "/images/designs/labor-day.png",
  },
  {
    id: "q3-grandparents-1",
    title: "Grandparents Day: Awesome in Aging",
    description: "Cool grandpa and grandma in pink and dark sunglasses — Happy Grandparents Day: We put the awesome in aging.",
    image_url: "/images/designs/happy-grandparents-day-2.png",
  },
  {
    id: "q3-911-1",
    title: "9/11 Patriot Day — United We Stand",
    description: "Patriot Day 9-11-01 tribute featuring American flag, Twin Towers skyline silhouette, flying eagle, and United We Stand message.",
    image_url: "/images/designs/9-11.png",
  },
  {
    id: "q3-hispanic-1",
    title: "Hispanic Heritage Month — Historia, Cultura, Orgullo",
    description: "National Hispanic Heritage Month Begins — Gold leaf branch decoration with text: Nuestra Historia. Nuestra Cultura. Nuestro Orgullo.",
    image_url: "/images/designs/national-hispanic-heritage-month-begins-2.png",
  },
  {
    id: "q3-labor-day-2",
    title: "Labor Day: Pretend to Love Workers",
    description: "Rosie the Riveter style woman in red bandana — Labor Day: The only day we pretend to love workers. Now back to exploiting you.",
    image_url: "/images/designs/labor-day-3.png",
  },
  {
    id: "q3-grandparents-2",
    title: "Grandparents Day: Professional Spoilers",
    description: "Crown icon badge font graphic — Happy Grandparents Day: Not retired. Professional spoilers.",
    image_url: "/images/designs/happy-grandparents-day-3.png",
  },
  {
    id: "q3-grandparents-3",
    title: "Grandparents Day: Older, Wiser, Zero Filter",
    description: "Glamorous grandma in leopard print jacket giving peace sign — Happy Grandparents Day: Older. Wiser. Still zero filter.",
    image_url: "/images/designs/happy-grandparents-day-4.png",
  },
  {
    id: "q3-labor-day-3",
    title: "Labor Day: Fueled by Caffeine & Deadlines",
    description: "Hand clutching coffee cup with crown emblem — Shoutout to everyone who works like it's not every single day. We see you.",
    image_url: "/images/designs/labor-day-4.png",
  },
  {
    id: "q3-hispanic-2",
    title: "Hispanic Heritage Month — Festive Floral",
    description: "National Hispanic Heritage Month Begins — Colorful festive block font with floral decor and banner.",
    image_url: "/images/designs/national-hispanic-heritage-month-begins.png",
  },
  {
    id: "q3-hispanic-3",
    title: "Hispanic Heritage Month — Culture & Pride",
    description: "Happy National Hispanic Heritage Month Begins — Let's celebrate our culture, roots & pride font with heart accent.",
    image_url: "/images/designs/national-hispanic-heritage-month-begins-3.png",
  },
  {
    id: "q3-911-2",
    title: "9/11 We Will Never Forget",
    description: "Bold Patriot Day 9-11-01 typography badge with Twin Towers sunset and American flag graphics.",
    image_url: "/images/designs/9-11-2.png",
  },
  {
    id: "q3-labor-day-4",
    title: "Labor Day: Deserves More Than a Holiday",
    description: "Flexing Rosie the Riveter in red headband — Labor Day: A reminder that hard work deserves more than a holiday.",
    image_url: "/images/designs/labor-day-6.png",
  },
  {
    id: "q3-labor-day-5",
    title: "Labor Day: Well-Deserved Nap",
    description: "Guy relaxing on chair in sunglasses — Labor Day: No parades. No speeches. Just a well-deserved NAP! Earned it.",
    image_url: "/images/designs/labor-day-7.png",
  },
  {
    id: "q3-labor-day-6",
    title: "Labor Day: Adulting Is Hard",
    description: "Wrench badge typography design — Labor Day: Because adulting is hard. Thanks for not quitting.",
    image_url: "/images/designs/labor-day-8.png",
  },
  {
    id: "q3-grandparents-4",
    title: "Happy Grandparents Day — Bench Warmth",
    description: "Heartwarming illustration of grandmother and grandfather sitting on a wooden bench with their grandchildren.",
    image_url: "/images/designs/happy-grandparents-day.png",
  },
  {
    id: "q3-hispanic-4",
    title: "Hispanic Heritage Month — Celebrate, Honor, Inspire",
    description: "National Hispanic Heritage Month Begins — Sun icon script with text: Celebrate. Honor. Inspire.",
    image_url: "/images/designs/national-hispanic-heritage-month-begins-4.png",
  },
];

const getCurrentMonthData = () => {
  const month = new Date().getMonth();
  return MONTHLY_FEATURED[month] || MONTHLY_FEATURED[8]; // fallback to Q3 September
};

export const ProductGrid = ({ categorySlug }: { categorySlug?: string }) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dynamic month data — starts with hardcoded defaults, overridden by DB schedule
  const [monthData, setMonthData] = useState(getCurrentMonthData());
  const [scheduledDesignIds, setScheduledDesignIds] = useState<string[] | null>(null);

  // Fetch admin-scheduled featured config for the current month
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const month = new Date().getMonth();
        const { data, error } = await (supabase as any)
          .from("featured_schedules")
          .select("*")
          .eq("month", month)
          .eq("is_active", true)
          .maybeSingle();

        if (!error && data && data.headline && data.headline.includes("Q3")) {
          setMonthData({
            headline: data.headline,
            subheadline: data.subheadline || getCurrentMonthData().subheadline,
            themes: (data.themes as { label: string; keywords: string }[]) || getCurrentMonthData().themes,
          });
          if (data.design_ids && data.design_ids.length > 0) {
            setScheduledDesignIds(data.design_ids);
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
      
      let fetchedDesigns = data || [];
      const existingUrls = new Set(fetchedDesigns.map((d: any) => d.image_url));
      const missingQ3 = FALLBACK_DESIGNS.filter(d => !existingUrls.has(d.image_url));
      fetchedDesigns = [...missingQ3, ...fetchedDesigns];

      // Filter designs based on target gift persona or category keywords
      if (categorySlug) {
        const slug = categorySlug.toLowerCase();
        if (slug.includes("coworker") || slug.includes("office")) {
          fetchedDesigns = fetchedDesigns.filter(d => 
            ["RBF Champion", "Snarky Humans", "Dark", "White Idol Morning"].some(t => d.title.includes(t))
          );
        } else if (slug.includes("men") || slug.includes("dad")) {
          fetchedDesigns = fetchedDesigns.filter(d => 
            ["Fathers", "Sasquatches", "Abduct Me"].some(t => d.title.includes(t))
          );
        } else if (slug.includes("mom") || slug.includes("mother")) {
          fetchedDesigns = fetchedDesigns.filter(d => 
            ["RBF Champion", "Snarky Humans", "White Idol Morning", "Good Morning"].some(t => d.title.includes(t))
          );
        } else if (slug.includes("teacher")) {
          fetchedDesigns = fetchedDesigns.filter(d => 
            ["RBF Champion", "Snarky Humans", "White Idol Morning", "Dark"].some(t => d.title.includes(t))
          );
        } else if (slug.includes("christmas") || slug.includes("white-elephant") || slug.includes("gag")) {
          fetchedDesigns = fetchedDesigns.filter(d => 
            ["Free Hugs", "Abduct Me", "Sasquatches", "Dark", "RBF Champion", "Snarky Humans"].some(t => d.title.includes(t))
          );
        }
      }

      setDesigns(fetchedDesigns);
    } catch (error) {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  // Prioritize Q3 featured designs for the featured section
  const q3FeaturedDesigns = designs.filter((d) =>
    d.id.startsWith("q3-") ||
    /labor[- ]day|grandparents|9[-/]11|hispanic/i.test(d.title) ||
    /labor-day|grandparents|9-11|hispanic/i.test(d.image_url)
  );

  const featuredDesigns = q3FeaturedDesigns.length > 0
    ? q3FeaturedDesigns
    : (scheduledDesignIds && scheduledDesignIds.length > 0)
    ? designs.filter((d) => scheduledDesignIds.includes(d.id))
    : designs.slice(0, 8);
  const allDesigns = designs;

  const [activeEventTab, setActiveEventTab] = useState<string>("all");

  const getEventGroups = (allFeatured: Design[]) => {
    const laborDayDesigns = allFeatured.filter(d =>
      /labor/i.test(d.id) || /labor/i.test(d.title) || /labor/i.test(d.image_url)
    );
    const grandparentsDesigns = allFeatured.filter(d =>
      /grandparent/i.test(d.id) || /grandparent/i.test(d.title) || /grandparent/i.test(d.image_url)
    );
    const patriotDesigns = allFeatured.filter(d =>
      /9-11|patriot|never-forget/i.test(d.id) || /9-11|patriot|never forget/i.test(d.title) || /9-11/i.test(d.image_url)
    );
    const hispanicDesigns = allFeatured.filter(d =>
      /hispanic|heritage|cultura|orgullo/i.test(d.id) || /hispanic|heritage|cultura|orgullo/i.test(d.title) || /hispanic/i.test(d.image_url)
    );

    return [
      {
        id: "labor-day",
        name: "Labor Day Snark",
        badge: "WORK & ANTI-OVERWORK",
        icon: "🛠️",
        badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        description: "Work hard, rest harder. Sarcastic apparel for anyone who works like it's not every single day.",
        designs: laborDayDesigns,
      },
      {
        id: "grandparents-day",
        name: "Grandparents Day",
        badge: "NOT RETIRED • PROFESSIONAL SPOILERS",
        icon: "👵",
        badgeBg: "bg-pink-500/10 text-pink-400 border-pink-500/30",
        description: "Awesome in aging. Cheeky, heartwarming gifts for the grandparents with zero filter.",
        designs: grandparentsDesigns,
      },
      {
        id: "patriot-day",
        name: "9/11 Patriot Remembrance",
        badge: "NEVER FORGET • UNITED WE STAND",
        icon: "🇺🇸",
        badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        description: "Honoring the heroes, remembering the lives lost, and standing united.",
        designs: patriotDesigns,
      },
      {
        id: "hispanic-heritage",
        name: "Hispanic Heritage Month",
        badge: "HISTORIA • CULTURA • ORGULLO",
        icon: "💃",
        badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        description: "Celebrate our culture, roots, and pride with vibrant festive designs.",
        designs: hispanicDesigns,
      },
    ].filter(group => group.designs.length > 0);
  };

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
        {/* Featured This Month — Separated by Q3 Holiday & Event */}
        {featuredDesigns.length > 0 && (() => {
          const eventGroups = getEventGroups(featuredDesigns);
          const visibleGroups = activeEventTab === "all"
            ? eventGroups
            : eventGroups.filter(g => g.id === activeEventTab);

          return (
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
                  ✨ All Q3 Events ({featuredDesigns.length})
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
                    <span>{group.name} ({group.designs.length})</span>
                  </button>
                ))}
              </div>

              {/* Categorized Event Sub-Sections */}
              <div className="space-y-16">
                {visibleGroups.map((group) => (
                  <div key={group.id} className="rounded-2xl border border-border/80 p-6 md:p-8 bg-card/60 backdrop-blur-sm shadow-xl transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-2xl">{group.icon}</span>
                          <h3 className="text-2xl md:text-3xl font-black tracking-tight">{group.name}</h3>
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${group.badgeBg}`}>
                            {group.badge}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{group.description}</p>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full w-fit">
                        {group.designs.length} {group.designs.length === 1 ? "Design" : "Designs"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                      {group.designs
                        .filter((design) => {
                          const patterns = FEATURED_BADGE_PATTERNS[group.id];
                          // If no patterns defined, show all; otherwise only show matching designs
                          return !patterns || patterns.some(
                            (p) => design.title.toLowerCase().includes(p.toLowerCase())
                          );
                        })
                        .map((design) => (
                          <ProductCard
                            key={design.id}
                            id={design.id}
                            title={design.title}
                            price={0}
                            image={resolveDesignImage(design.image_url)}
                            category={group.name}
                            badge="FEATURED"
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* All Designs */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-3 md:mb-4">
            ALL <span className="text-primary">DESIGNS</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-xl font-medium">
            Browse the full collection. Because normal is boring.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {allDesigns
            .filter((design) => !HIDDEN_DESIGN_PATTERNS.some(
              (p) => design.title.toLowerCase().includes(p.toLowerCase())
            ))
            .map((design) => (
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
