import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ArrowRight, Clock } from "lucide-react";
import { useBfcmTimer } from "@/lib/bfcmConfig";

const STORAGE_KEY = "snarky_bfcm26_popup_dismissed_at";
const COOLDOWN_MS = 1000 * 60 * 60 * 24; // Suppress for 24 hours after dismissal
const SHOW_DELAY_MS = 8000; // Show after approximately 8 seconds

const POPUP_PRODUCTS = [
  {
    title: "Caution: Choking Hazard — Tee",
    image: "/images/designs/1.jpeg",
    salePrice: "$11.77",
    regularPrice: "$15.69",
    href: "/product/caution-choking-hazard",
  },
  {
    title: "Brutally Honest Office Mug",
    image: "/images/carousel/mug-hero-1.jpg",
    salePrice: "$11.24",
    regularPrice: "$14.99",
    href: "/mugs",
  },
];

export const BestSellersPopup = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const timer = useBfcmTimer();

  const isExcludedRoute =
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/order-") ||
    location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!timer.isActive || isExcludedRoute) {
      setVisible(false);
      return;
    }

    const lastDismissed = Number(localStorage.getItem(STORAGE_KEY) || "0");
    if (Date.now() - lastDismissed < COOLDOWN_MS) return;

    const timeout = setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [timer.isActive, isExcludedRoute]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  const handlePrimaryCta = () => {
    close();
    if (location.pathname === "/") {
      const el = document.getElementById("bfcm-gift-picks") || document.getElementById("products");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate("/collections");
  };

  const handleOfferDetails = () => {
    close();
    if (location.pathname === "/") {
      const el = document.getElementById("bfcm-offer-details");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate("/#bfcm-offer-details");
  };

  if (!visible || !timer.isActive || isExcludedRoute) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bfcm-popup-headline"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none"
      >
        <div
          className="relative w-full max-w-lg pointer-events-auto rounded-2xl border border-white/15 bg-[#111111] text-white shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Accent Strip */}
          <div className="h-1.5 w-full bg-[#C62828]" />

          {/* Obvious Close Control */}
          <button
            type="button"
            onClick={close}
            aria-label="Close sale announcement"
            className="absolute top-3.5 right-3.5 z-20 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C62828]"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-5 sm:p-7 space-y-4">
            {/* Brand + Sticker Offer Badge */}
            <div className="flex flex-wrap items-center gap-2 pr-8">
              <span className="text-xs font-black tracking-widest uppercase text-white/70">
                SNARKY HUMANS
              </span>
              <span className="text-white/30">•</span>
              <span className="inline-flex items-center rounded-full bg-[#C62828] px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
                {timer.isFinalDay ? "BLACK FRIDAY SALE: FINAL HOURS" : "BLACK FRIDAY SALE"}
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1.5">
              <h2
                id="bfcm-popup-headline"
                className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-none"
              >
                {timer.isFinalDay ? "Last Call For Gifts With Attitude." : "25% Off Sitewide"}
              </h2>
              {timer.isFinalDay ? (
                <p className="text-sm sm:text-base font-bold text-[#ef5350]">
                  Take 25% off sitewide before the sale ends tonight.
                </p>
              ) : (
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  Your gift list needs a personality. We can help.{" "}
                  <span className="text-white font-semibold">
                    Funny gifts. Sarcastic favorites. Personalized attitude.
                  </span>
                </p>
              )}
            </div>

            {/* Live Fixed-Deadline Countdown Box */}
            <div className="rounded-xl bg-white/[0.06] border border-white/15 px-3.5 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
                <Clock className="h-4 w-4 text-[#ef5350] shrink-0" />
                <span>Sale Ends In:</span>
              </div>
              <div
                aria-live="off"
                className="font-mono text-base sm:text-lg font-black tracking-wider text-white bg-black/60 border border-white/15 px-3 py-1 rounded-lg"
              >
                {timer.formattedHhMmSs}
              </div>
            </div>

            {/* Two Actual Product Thumbnails */}
            <div className="grid grid-cols-2 gap-2.5">
              {POPUP_PRODUCTS.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    close();
                    navigate(item.href);
                  }}
                  className="group flex items-center gap-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 p-2 text-left transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-12 w-12 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-[#ef5350] transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs font-black text-[#ef5350] mt-0.5">
                      {item.salePrice}{" "}
                      <span className="text-[10px] text-white/50 line-through font-normal">
                        {item.regularPrice}
                      </span>
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Primary CTA + Dismissal Link */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] text-white font-black text-sm sm:text-base py-3 px-5 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span>{timer.isFinalDay ? "Shop Before It Ends" : "Shop 25% Off"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                <button
                  type="button"
                  onClick={close}
                  className="text-xs font-semibold text-white/70 hover:text-white underline underline-offset-4 transition-colors"
                >
                  No Thanks, I’m Still Browsing
                </button>
                <span className="text-[11px] text-white/60">
                  {timer.isFinalDay
                    ? "Ends tonight at 11:59 p.m. PT."
                    : "Ends November 30 at 11:59 p.m. PT."}{" "}
                  <button
                    type="button"
                    onClick={handleOfferDetails}
                    className="underline hover:text-white"
                  >
                    See offer details.
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
