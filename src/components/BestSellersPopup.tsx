import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sparkles, ArrowRight, Flame, Star } from "lucide-react";

const BEST_SELLERS = [
  {
    id: "shirt",
    label: "🔥 H-A-W-T Right Now",
    title: "Custom Unisex Tee",
    tagline: "Your design. Their jaw on the floor.",
    badge: "BEST SELLER",
    price: "$29.99",
    emoji: "👕",
    href: "/custom-design?product=tee",
    color: "from-red-600 to-rose-500",
  },
  {
    id: "hoodie",
    label: "❄️ New Drop",
    title: "Custom Hoodie",
    tagline: "Cozy chaos. Exclusively yours.",
    badge: "NEW",
    price: "$49.99",
    emoji: "🧥",
    href: "/custom-design?product=hoodie",
    color: "from-violet-600 to-purple-500",
  },
  {
    id: "mug",
    label: "☕ Morning Essential",
    title: "Custom Mug 15oz",
    tagline: "Because basic mugs are for basic people.",
    badge: "POPULAR",
    price: "$19.99",
    emoji: "☕",
    href: "/custom-design?product=mug",
    color: "from-amber-500 to-orange-400",
  },
  {
    id: "card",
    label: "💌 Say It Snarky",
    title: "Custom Greeting Card",
    tagline: "Cards that say what you ACTUALLY mean.",
    badge: "NEW",
    price: "$7.99",
    emoji: "💌",
    href: "/custom-design?product=card",
    color: "from-pink-500 to-rose-400",
  },
];

const STORAGE_KEY = "snarky_popup_last_shown";
const COOLDOWN_MS = 1000 * 60 * 60 * 4; // 4 hours between shows

export const BestSellersPopup = () => {
  const [visible, setVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const last = Number(localStorage.getItem(STORAGE_KEY) || "0");
    const now = Date.now();
    if (now - last < COOLDOWN_MS) return;

    // Show after 6 seconds on the page
    const timer = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-cycle through items
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(
      () => setActiveIdx((i) => (i + 1) % BEST_SELLERS.length),
      3000
    );
    return () => clearInterval(interval);
  }, [visible]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleShop = (href: string) => {
    close();
    navigate(href);
  };

  if (!visible) return null;

  const active = BEST_SELLERS[activeIdx];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={close}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute -top-3 -right-3 z-10 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white rounded-full p-1.5 transition-colors shadow-xl"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {/* Header bar */}
            <div className={`bg-gradient-to-r ${active.color} px-5 py-3 flex items-center gap-2`}>
              <Flame className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-black uppercase tracking-widest">
                {active.label}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <Star className="h-3 w-3 text-white fill-white" />
                <Star className="h-3 w-3 text-white fill-white" />
                <Star className="h-3 w-3 text-white fill-white" />
                <Star className="h-3 w-3 text-white fill-white" />
                <Star className="h-3 w-3 text-white fill-white" />
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Product highlight */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${active.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}
                >
                  {active.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${active.color} text-white`}
                    >
                      {active.badge}
                    </span>
                  </div>
                  <h3 className="text-white font-black text-lg leading-tight">
                    {active.title}
                  </h3>
                  <p className="text-zinc-400 text-sm mt-0.5">{active.tagline}</p>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Starting from</p>
                  <p className="text-white text-3xl font-black">{active.price}</p>
                </div>
                <button
                  onClick={() => handleShop(active.href)}
                  className={`flex items-center gap-2 bg-gradient-to-r ${active.color} hover:opacity-90 text-white font-black px-5 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
                >
                  <Sparkles className="h-4 w-4" />
                  Customize It
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Carousel dots */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1.5">
                  {BEST_SELLERS.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeIdx
                          ? `w-6 bg-gradient-to-r ${active.color}`
                          : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                      }`}
                      aria-label={`View ${item.title}`}
                    />
                  ))}
                </div>
                <button
                  onClick={close}
                  className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
