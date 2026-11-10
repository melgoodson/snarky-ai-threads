import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sparkles, ArrowRight, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpotlightItem {
  id: string;
  tabLabel: string;
  label: string;
  title: string;
  tagline: string;
  badge: string;
  price: string;
  originalPrice: string;
  image: string;
  shopHref: string;
  customHref: string;
  specs: string;
}

const BEST_SELLERS: SpotlightItem[] = [
  {
    id: "shirt",
    tabLabel: "Graphic Tees",
    label: "Buy 3, Get 1 Free • Sale",
    title: "Heavyweight Snarky Tee",
    tagline: "100% preshrunk cotton tees with bold new graphics. Buy any 3 items, get the 4th item FREE in cart!",
    badge: "BUY 3 GET 1 FREE",
    price: "$15.69",
    originalPrice: "$35.69",
    image: "/images/designs/1.jpeg",
    shopHref: "/shirts",
    customHref: "/custom-design?product=tee",
    specs: "Gildan® 5000 • S–5XL • DTG Print",
  },
  {
    id: "hoodie",
    tabLabel: "Hoodies",
    label: "Fan Favorite",
    title: "Cozy Snarky Hoodie",
    tagline: "Fleece-lined warmth dripping with attitude. Pull it on, hood up, mic drop.",
    badge: "SAVE $20",
    price: "$39.99",
    originalPrice: "$59.99",
    image: "/images/carousel/hoodie-hero-1.jpg",
    shopHref: "/hoodies",
    customHref: "/custom-design?product=hoodie",
    specs: "Heavy Blend™ Fleece • Double-Lined Hood",
  },
  {
    id: "deskmat",
    tabLabel: "Desk Mats",
    label: "Item of the Month",
    title: "Custom Snarky Desk Mat",
    tagline: "3mm cushioned neoprene with anti-fray stitched edges. Upgrade your battlestation.",
    badge: "NEW DROP",
    price: "$21.99",
    originalPrice: "$29.99",
    image: "/images/deskmat-mockup-snarky-1.jpg",
    shopHref: "/desk-mats",
    customHref: "/custom-design?product=deskmat",
    specs: "3 Sizes • Non-Slip Rubber Base",
  },
  {
    id: "mug",
    tabLabel: "Mood Mugs",
    label: "Office Essential",
    title: "Brutally Honest Mug",
    tagline: "Start your morning with a hot take. Dishwasher-safe ceramic built for the 9-to-5.",
    badge: "POPULAR",
    price: "$14.99",
    originalPrice: "$34.99",
    image: "/images/carousel/mug-hero-1.jpg",
    shopHref: "/mugs",
    customHref: "/custom-design?product=mug",
    specs: "11oz & 15oz • Glossy Ceramic",
  },
];

const STORAGE_KEY = "snarky_popup_v2_last_shown";
const COOLDOWN_MS = 1000 * 60 * 60 * 4; // 4 hours between shows

export const BestSellersPopup = () => {
  const [visible, setVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const last = Number(localStorage.getItem(STORAGE_KEY) || "0");
    const now = Date.now();
    if (now - last < COOLDOWN_MS) return;

    // Show after 3.5 seconds on the page
    const timer = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-cycle through items unless hovered
  useEffect(() => {
    if (!visible || isPaused) return;
    const interval = setInterval(
      () => setActiveIdx((i) => (i + 1) % BEST_SELLERS.length),
      4000
    );
    return () => clearInterval(interval);
  }, [visible, isPaused]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleNavigate = (href: string) => {
    close();
    navigate(href);
  };

  if (!visible) return null;

  const active = BEST_SELLERS[activeIdx];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 animate-in fade-in duration-300"
        onClick={close}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-xl pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Card */}
          <div className="relative bg-card border border-border/90 rounded-2xl overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85),0_0_40px_hsl(var(--primary)/0.18)]">
            {/* Close Button */}
            <button
              onClick={close}
              className="absolute top-3.5 right-3.5 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white/80 hover:text-white rounded-full p-2 transition-all duration-200 shadow-lg"
              aria-label="Close popup"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Split Grid: Product Photo on Left, Details on Right */}
            <div className="grid sm:grid-cols-[220px_1fr]">
              {/* Left: Real Product Image */}
              <div
                className="relative aspect-[16/10] sm:aspect-auto sm:h-full bg-muted overflow-hidden cursor-pointer group"
                onClick={() => handleNavigate(active.shopHref)}
              >
                <img
                  key={active.image}
                  src={active.image}
                  alt={active.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-card/40" />

                {/* Floating Discount Badge */}
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                  {active.badge}
                </span>

                {/* Bottom rating pill on image */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className="h-3 w-3 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-white ml-1">
                    4.9 / 5
                  </span>
                </div>
              </div>

              {/* Right: Content */}
              <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div>
                  {/* Eyebrow label */}
                  <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary mb-1.5">
                    <Flame className="h-3.5 w-3.5 fill-primary" />
                    <span>{active.label}</span>
                  </div>

                  {/* Product Title */}
                  <h3 className="text-foreground font-black text-xl sm:text-2xl tracking-tight leading-tight">
                    {active.title}
                  </h3>

                  {/* Specs pill */}
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mt-1">
                    {active.specs}
                  </p>

                  {/* Tagline */}
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mt-2.5">
                    {active.tagline}
                  </p>
                </div>

                {/* Price + Dual Action Buttons */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      From
                    </span>
                    <span className="text-foreground text-2xl sm:text-3xl font-black tracking-tight">
                      {active.price}
                    </span>
                    <span className="text-muted-foreground text-sm line-through font-semibold">
                      {active.originalPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="hero"
                      size="default"
                      className="flex-1 font-black group"
                      onClick={() => handleNavigate(active.shopHref)}
                    >
                      Shop Now
                      <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      className="font-bold px-3.5"
                      onClick={() => handleNavigate(active.customHref)}
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Interactive Category Tabs + Dismiss */}
            <div className="bg-secondary/50 border-t border-border px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {BEST_SELLERS.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
                      i === activeIdx
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {item.tabLabel}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={close}
                className="text-muted-foreground hover:text-foreground text-xs font-medium whitespace-nowrap transition-colors pl-2"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
