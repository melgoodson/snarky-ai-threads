import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Gift, HelpCircle, Sparkles, Tag } from "lucide-react";
import { useBfcmTimer } from "@/lib/bfcmConfig";

const HERO_PRODUCTS = [
  {
    id: "caution-choking-hazard",
    title: "Caution: Choking Hazard — Heavyweight Tee",
    recipient: "For Your Favorite Smartass",
    regularPrice: "$15.69",
    bfcmPrice: "$11.77",
    image: "/images/designs/1.jpeg",
    href: "/product/caution-choking-hazard",
  },
  {
    id: "snarky-office-mug",
    title: "Brutally Honest Ceramic Coffee Mug",
    recipient: "For Your Work Bestie",
    regularPrice: "$14.99",
    bfcmPrice: "$11.24",
    image: "/images/carousel/mug-hero-1.jpg",
    href: "/mugs",
  },
  {
    id: "ass-u-me-hoodie",
    title: "How Bold of You to Ass-U-Me I Care — Hoodie",
    recipient: "For The White Elephant Exchange",
    regularPrice: "$39.99",
    bfcmPrice: "$29.99",
    image: "/images/carousel/hoodie-hero-2.jpg",
    href: "/designs/8bebc34c-e44d-4439-a131-51f89e3c9aa1",
  },
];

const GIFT_SHORTCUTS = [
  {
    title: "Coworker Gifts",
    description: "For the person making those meetings survivable.",
    href: "/category/funny-coworker-gifts",
    image: "/images/carousel/mug-hero-1.jpg",
    tag: "Office & 9-to-5",
  },
  {
    title: "White Elephant Gifts",
    description: "Give them something worth stealing.",
    href: "/category/white-elephant-gifts",
    image: "/images/designs/5.jpeg",
    tag: "Party Stealers",
  },
  {
    title: "Gifts Under $25",
    description: "A little attitude. A manageable budget.",
    note: "Item prices before shipping and taxes.",
    href: "/category/funny-gifts-under-25",
    image: "/images/designs/1.jpeg",
    tag: "Budget Friendly",
  },
];

const FEATURED_GIFT_PICKS = [
  {
    title: "Brutally Honest Office Mug (11oz / 15oz)",
    category: "Ceramic Mug",
    recipient: "For Your Work Bestie",
    regularPrice: "$14.99",
    salePrice: "$11.24",
    image: "/images/carousel/mug-hero-1.jpg",
    href: "/mugs",
  },
  {
    title: "Sarcastic Morning Fuel Ceramic Mug",
    category: "Ceramic Mug",
    recipient: "For The Coworker You Actually Like",
    regularPrice: "$14.99",
    salePrice: "$11.24",
    image: "/images/carousel/mug-hero-2.jpg",
    href: "/mugs",
  },
  {
    title: "Caution: Choking Hazard — Heavyweight Tee",
    category: "5.3 oz Cotton Tee",
    recipient: "For The White Elephant Exchange",
    regularPrice: "$15.69",
    salePrice: "$11.77",
    image: "/images/designs/1.jpeg",
    href: "/product/caution-choking-hazard",
  },
  {
    title: "How Bold of You to Ass-U-Me I Care — Hoodie",
    category: "Fleece Hoodie",
    recipient: "For Your Favorite Smartass",
    regularPrice: "$39.99",
    salePrice: "$29.99",
    image: "/images/carousel/hoodie-hero-2.jpg",
    href: "/designs/8bebc34c-e44d-4439-a131-51f89e3c9aa1",
  },
  {
    title: "Custom Hardcover Ruled Journal",
    category: "Hardcover Notebook",
    recipient: "For Meeting Notes & Daily Rants",
    regularPrice: "$18.83",
    salePrice: "$14.12",
    image: "/images/notebook-mockup.png",
    href: "/journals",
  },
  {
    title: "Heavy-Duty Snarky Canvas Tote Bag",
    category: "Canvas Tote",
    recipient: "For Carrying Emotional Baggage",
    regularPrice: "$19.99",
    salePrice: "$14.99",
    image: "/images/carousel/tote-hero-1.jpg",
    href: "/tote-bags",
  },
  {
    title: "Custom Photo Fleece & Sherpa Blanket",
    category: "Personalized Gift",
    recipient: "For Family, Pets & Inside Jokes",
    regularPrice: "$49.99",
    salePrice: "$37.49",
    image: "/images/carousel/shirt-hero-new-1.jpg",
    href: "/product/personalization-blanket",
  },
  {
    title: "AI Custom One-of-One Gift Studio",
    category: "Custom Apparel & Mugs",
    recipient: "Turn Any Inside Joke Into A Gift",
    regularPrice: "$15.69",
    salePrice: "$11.77",
    image: "/images/carousel/shirt-hero-new-2.jpg",
    href: "/ai-custom-clothing",
  },
];

const BFCM_FAQS = [
  {
    q: "How Do I Get 25% Off?",
    a: "The 25% off sitewide discount is applied automatically in your cart and at checkout through Monday, November 30, 2026, at 11:59 p.m. PT—no promo code required. It applies across our entire catalog, including personalized products.",
  },
  {
    q: "How Does Buy 3, Get 1 Free Work?",
    a: "Add any four eligible products and mix and match across the store—including tees, hoodies, mugs, hardcover journals, desk mats, canvas totes, and greeting cards. In every 4-item group, the lowest-priced item is calculated as free.",
  },
  {
    q: "Can I Combine The Offers?",
    a: "Promotional discounts do not stack. Our cart and checkout automatically calculate both 25% Off Sitewide and Buy 3, Get 1 Free and apply whichever eligible offer gives you the larger savings.",
  },
  {
    q: "When Does The Sale End?",
    a: "The Black Friday / Cyber Monday 25% Off Sitewide sale ends Monday, November 30, 2026, at 11:59 p.m. Pacific Time. Our storewide Buy 3, Get 1 Free promotion continues as our ongoing multi-item offer.",
  },
  {
    q: "When Will My Order Arrive?",
    a: "Production and shipping times vary by product and destination (most US print-on-demand items are produced and delivered within 3 to 7 business days). Review the product details and our Shipping & Returns pages before ordering.",
  },
];

export const BfcmAnnouncementBar = () => {
  const navigate = useNavigate();
  const timer = useBfcmTimer();

  if (!timer.isActive) {
    return (
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center">
        <p className="text-xs sm:text-sm font-bold leading-snug tracking-wide">
          🔥 SALE EVENT: BUY 3, GET 1 FREE — Mix &amp; Match Across The Store (Tees, Hoodies, Mugs, Journals &amp; Gifts)
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#C62828] text-white py-2.5 px-4 border-b border-white/15">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <p className="text-xs sm:text-sm font-black tracking-wide">
          {timer.isFinalDay
            ? "Final Day: 25% Off Sitewide Ends Tonight At 11:59 p.m. PT."
            : "Black Friday Sale: 25% Off Sitewide."}
        </p>
        <span
          aria-live="off"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#111111] px-2.5 py-0.5 font-mono text-xs font-black text-white border border-white/20"
        >
          <Clock className="h-3 w-3 text-[#ef5350]" />
          {timer.formattedHhMmSs}
        </span>
        <button
          type="button"
          onClick={() => navigate("/collections")}
          className="text-xs sm:text-sm font-black underline underline-offset-4 hover:opacity-90"
        >
          Shop Now →
        </button>
      </div>
    </div>
  );
};

export const BfcmHeroSection = () => {
  const navigate = useNavigate();
  const timer = useBfcmTimer();

  if (!timer.isActive) return null;

  const scrollToOfferDetails = () => {
    const el = document.getElementById("bfcm-offer-details");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-[#111111] text-white border-b border-white/10 py-10 md:py-16">
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column (Appears FIRST on mobile before the product collage) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1F5C43] border border-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-white">
                <Tag className="h-3.5 w-3.5" />
                {timer.isFinalDay ? "Black Friday Sale · Final Hours" : "Gifts With Attitude Sale"}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#C62828] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                Black Friday Sale — 25% Off Sitewide
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.06]">
              {timer.isFinalDay
                ? "Last Call For Gifts With Attitude."
                : "Boring Gifts Have Had Enough Chances."}
            </h1>

            <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl">
              {timer.isFinalDay
                ? "Your gift list is still waiting for a personality. The sale ends tonight at 11:59 p.m. PT."
                : "Funny mugs, sarcastic shirts, and gifts for people with actual personalities. Your entire gift list just got more interesting."}
            </p>

            {/* Fixed-Deadline Live Countdown Timer */}
            <div className="rounded-2xl bg-white/[0.05] border border-white/15 p-4 max-w-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#ef5350]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Sale Ends In:</span>
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">
                    Deadline: Monday, Nov 30, 2026 at 11:59 p.m. PT
                  </p>
                </div>
                <div
                  aria-live="off"
                  className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white bg-black/80 border border-white/20 px-4 py-2 rounded-xl shadow-inner"
                >
                  {timer.formattedHhMmSs}
                </div>
              </div>
            </div>

            {/* One Primary CTA */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/collections")}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] text-white font-black text-base sm:text-lg px-8 py-4 shadow-lg transition-all"
              >
                <span>{timer.isFinalDay ? "Shop Before Time Runs Out" : "Shop 25% Off"}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Customer-Facing Primary Terms */}
            <p className="text-xs text-white/65 leading-relaxed max-w-xl">
              25% off sitewide through November 30, 2026, at 11:59 p.m. PT. Discount applied automatically at checkout. Shipping and taxes calculated at checkout.{" "}
              <button
                type="button"
                onClick={scrollToOfferDetails}
                className="underline hover:text-white font-semibold"
              >
                See offer details
              </button>{" "}
              for promotional combination rules.
            </p>
          </div>

          {/* Right Column: Three Actual Store Products */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HERO_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                onClick={() => navigate(prod.href)}
                className="group cursor-pointer rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 overflow-hidden flex flex-col transition-all"
              >
                <div className="relative aspect-square bg-black/40 overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-[#C62828] px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow">
                    25% OFF
                  </span>
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#ef5350]">
                      {prod.recipient}
                    </p>
                    <h2 className="text-sm font-extrabold text-white line-clamp-2 mt-0.5 group-hover:text-[#ef5350] transition-colors">
                      {prod.title}
                    </h2>
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-white">{prod.bfcmPrice}</span>
                    <span className="text-xs text-white/50 line-through">{prod.regularPrice}</span>
                    <span className="text-[10px] font-bold text-emerald-400 ml-auto">Auto-Applied</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const BfcmGiftShortcuts = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-background border-b border-border/60">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#C62828]">
            GIFT SHORTCUTS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">
            Who Are We Shopping For?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Your gift list could use better jokes. Pick a shortcut and knock a name off your list.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {GIFT_SHORTCUTS.map((item) => (
            <div
              key={item.href}
              onClick={() => navigate(item.href)}
              className="group cursor-pointer rounded-2xl border border-border bg-card hover:border-[#C62828]/60 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 rounded-full bg-[#111111]/90 text-white px-3 py-1 text-[11px] font-black uppercase tracking-wider">
                  {item.tag}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xl font-black tracking-tight group-hover:text-[#C62828] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  {item.note && (
                    <p className="text-[11px] text-muted-foreground/80 mt-1 italic">{item.note}</p>
                  )}
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#C62828]">
                  <span>Explore {item.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BfcmFeaturedGiftPicks = () => {
  const navigate = useNavigate();
  const timer = useBfcmTimer();

  return (
    <section id="bfcm-gift-picks" className="py-12 md:py-16 bg-muted/20 border-b border-border/60">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C62828]/15 text-[#ef5350] border border-[#C62828]/30 px-3 py-1 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Gift Picks
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Good Gifts. Questionable Attitude.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            A few strong contenders for your favorite humans—and the ones you drew in Secret Santa.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURED_GIFT_PICKS.map((item) => (
            <div
              key={item.title}
              onClick={() => navigate(item.href)}
              className="group cursor-pointer rounded-2xl border border-border bg-card hover:border-[#C62828]/60 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative aspect-square bg-muted overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 rounded-full bg-[#111111]/90 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  GIFT PICK
                </span>
                {timer.isActive && (
                  <span className="absolute top-2.5 right-2.5 rounded-full bg-[#C62828] text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    25% OFF
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#ef5350]">
                    {item.recipient}
                  </p>
                  <h3 className="text-sm sm:text-base font-extrabold text-foreground line-clamp-2 mt-0.5 group-hover:text-[#ef5350] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                </div>
                <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-border/60">
                  {timer.isActive ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-black text-foreground">
                        {item.salePrice}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {item.regularPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base sm:text-lg font-black text-foreground">
                      {item.regularPrice}
                    </span>
                  )}
                  <span className="text-xs font-bold text-[#ef5350] group-hover:translate-x-0.5 transition-transform">
                    View →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BfcmSecondaryOfferBanner = () => {
  const navigate = useNavigate();

  const scrollToOfferDetails = () => {
    const el = document.getElementById("bfcm-offer-details");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-10 md:py-14 bg-background border-b border-border/60">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#111111] text-white border border-white/15 p-6 sm:p-10 shadow-xl">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1F5C43] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white">
                <Gift className="h-3.5 w-3.5" />
                Buy 3, Get 1 Free — Mix And Match Across The Store
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Four Gifts. Three You Pay For.
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                A mug for your work bestie. A shirt for your favorite smartass. Something for yourself. Mix and match across the store—including tees, hoodies, mugs, hardcover journals, desk mats, totes, and greeting cards—with our Buy 3, Get 1 Free offer.
              </p>
              <p className="text-xs text-white/60">
                Mix and match across the store.{" "}
                <button
                  type="button"
                  onClick={scrollToOfferDetails}
                  className="underline hover:text-white font-semibold"
                >
                  See offer details.
                </button>
              </p>
            </div>
            <div className="md:col-span-4 flex md:justify-end">
              <button
                type="button"
                onClick={() => navigate("/collections")}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#111111] hover:bg-white/90 font-black text-sm sm:text-base px-6 py-3.5 shadow-md transition-colors"
              >
                <span>Build Your Gift Haul</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const BfcmSaleFaqSection = () => {
  return (
    <section id="bfcm-offer-details" className="py-12 md:py-16 bg-muted/30 border-t border-border/60">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#C62828] mb-1">
            <HelpCircle className="h-4 w-4" />
            <span>Sale FAQ &amp; Offer Details</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gifts With Attitude Sale — Offer Terms &amp; FAQ
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Clear pricing, automatic checkout discounts, and verified promotional combination rules.
          </p>
        </div>

        <div className="grid gap-4">
          {BFCM_FAQS.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <h3 className="text-base sm:text-lg font-black text-foreground">
                {item.q}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1.5">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
