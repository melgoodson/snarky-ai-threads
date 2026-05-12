import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Briefcase,
  Coffee,
  Gift,
  Heart,
  Image,
  Moon,
  Package,
  PawPrint,
  Shield,
  Shirt,
  ShoppingBag,
  Sparkles,
  Sun,
  Truck,
  Zap,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/utils/ga4";
import ugcVideo from "@/assets/ugc_440.mp4";

const PAGE_KEY = "ai_custom_clothing";
const CUSTOMIZER_PATH = "/custom-design?source=ai-custom-clothing";
const VIDEO_POSTER = "/images/carousel/shirt-hero-new-1.jpg";
const HERO_SCREENSHOT = "/images/ai-custom-clothing/hero-idea-screenshot.jpeg";
const HERO_SHIRT_MOCKUP = "/images/ai-custom-clothing/pile4-shirt-mockup.png";
const MEME_SHIRT_PROMPT = "Turn this trending roommate dishes meme idea into an original funny shirt design.";

const GEN_STEPS = [
  { src: "/images/ai-custom-clothing/hero-idea-screenshot.jpeg", label: "Original" },
  { src: "/images/ai-custom-clothing/gen-step-2.jpeg", label: "Draft" },
  { src: "/images/ai-custom-clothing/gen-step-3.jpeg", label: "Refined" },
  { src: "/images/ai-custom-clothing/gen-step-4.jpeg", label: "✨ Final" },
];

const howItWorks = [
  {
    step: "01",
    title: "Spot the trend",
    description: "Start with the meme-worthy moment, group chat joke, pet face, work rant, or rough prompt.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Make it yours",
    description: "AI helps turn the spark into an original design direction that fits the person and the product.",
    icon: Image,
  },
  {
    step: "03",
    title: "Pick the product",
    description: "Choose the shirt, hoodie, mug, blanket, tote, card, or gift format that lands best.",
    icon: Gift,
  },
  {
    step: "04",
    title: "We print and ship it",
    description: "Your custom product is made for the moment and sent out for gifting.",
    icon: Truck,
  },
];

const productPathways: Array<{
  title: string;
  description: string;
  to: string;
  image: string;
  alt: string;
  icon: LucideIcon;
}> = [
  {
    title: "AI Custom T-Shirts",
    description: "Turn the joke, trend, or roast into a wearable main character moment.",
    to: `${CUSTOMIZER_PATH}&product=tee`,
    image: "/images/carousel/snarky-humans-1.png",
    alt: "Snarky Azz Humans custom t-shirt with a bold printed design",
    icon: Shirt,
  },
  {
    title: "Custom Hoodies",
    description: "Make the idea warmer, louder, and easier to gift.",
    to: `${CUSTOMIZER_PATH}&product=hoodie`,
    image: "/images/carousel/hoodie-hero-2.jpg",
    alt: "Custom hoodie with Snarky Humans artwork",
    icon: Shirt,
  },
  {
    title: "Funny Mugs",
    description: "For meeting haters, caffeine loyalists, and people with opinions.",
    to: "/mugs",
    image: "/images/carousel/mug-hero-2.jpg",
    alt: "Funny Snarky Humans mug with a printed design",
    icon: Coffee,
  },
  {
    title: "Tote Bags",
    description: "For the friend who brings snacks, drama, and a reusable bag.",
    to: "/tote-bags",
    image: "/images/carousel/tote-hero-2.jpg",
    alt: "Custom tote bag with a printed caffeine and spite design",
    icon: ShoppingBag,
  },
  {
    title: "Greeting Cards",
    description: "Make the card as specific as the gift and twice as memorable.",
    to: "/greeting-cards",
    image: "/images/carousel/greeting-card-hero-1.jpg",
    alt: "Assorted custom greeting cards with funny designs",
    icon: Gift,
  },
  {
    title: "Pet Gifts",
    description: "Put the pet's face, side-eye, or chaos energy where it belongs.",
    to: `${CUSTOMIZER_PATH}&prompt=${encodeURIComponent("Make a custom pet gift from my pet photo.")}`,
    image: "/images/carousel/mug-hero-2.jpg",
    alt: "Custom printed mug for personalized pet gifts",
    icon: PawPrint,
  },
  {
    title: "Coworker Gifts",
    description: "Make the meeting joke, desk drama, or office survival gift official.",
    to: "/category/funny-coworker-gifts",
    image: "/images/carousel/rbf-champion-1.png",
    alt: "Funny coworker gift — RBF Champion snarky design",
    icon: Briefcase,
  },
];

const promptExamples = [
  "Turn a trending roommate dishes joke into a funny shirt.",
  "Make a meme-inspired tee from this chaos moment.",
  "Make a shirt from my dog's judgmental face.",
  "Turn our group chat joke into a birthday gift.",
  "Make a mug for someone who hates meetings.",
  "Make a tote bag for the friend who brings chaos everywhere.",
];

const trustCards = [
  {
    title: "Your idea stays personal",
    description: "Your photo or idea is used to create your custom design. Use your own photos, jokes, and original prompts.",
    icon: Shield,
  },
  {
    title: "Made for real gifting",
    description: "The best custom gift feels like it could only be for that person, that moment, and that exact joke.",
    icon: Gift,
  },
  {
    title: "Designed to feel intentional",
    description: "AI helps shape the rough spark into a product direction that feels less random and more made-for-them.",
    icon: Heart,
  },
];

const faqItems = [
  {
    question: "What is AI custom clothing?",
    answer:
      "AI custom clothing is apparel personalized from your own idea, photo, joke, or prompt. AI helps turn that input into a design concept you can place on a shirt, hoodie, or gift.",
  },
  {
    question: "How do AI custom shirts work?",
    answer:
      "Start with your idea or image, use AI to shape the design, choose the shirt or product, then review the custom item before ordering.",
  },
  {
    question: "Can I make a shirt from an inside joke?",
    answer:
      "Yes. Inside jokes, original phrases, birthday roasts, work rants, and group chat ideas are exactly the kind of personal moments that make custom gifts land.",
  },
  {
    question: "Can I create custom pet gifts?",
    answer:
      "Yes. You can use your own pet photo or pet-inspired idea to create custom shirts, mugs, totes, cards, and other gift concepts.",
  },
  {
    question: "What products can I personalize?",
    answer:
      "You can start with shirts, hoodies, mugs, blankets, tote bags, greeting cards, pet gifts, coworker gifts, and other personalized gift ideas.",
  },
  {
    question: "Can I use copyrighted characters, logos, celebrities, or memes?",
    answer:
      "You can make original, meme-inspired jokes from your own ideas, photos, and prompts. Do not upload copyrighted logos, characters, celebrity likenesses, trademarked artwork, or designs you do not have rights to use.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const pageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AI Custom Clothing & One-of-One Gifts",
  url: "https://www.snarkyazzhumans.com/ai-custom-clothing",
  description:
    "Turn trending meme-worthy moments, inside jokes, pet photos, and wild ideas into one-of-one AI-designed shirts, mugs, blankets, totes, greeting cards, and personalized gifts.",
};

function promptDestination(prompt: string) {
  return `${CUSTOMIZER_PATH}&prompt=${encodeURIComponent(prompt)}`;
}

// ─── Hero Section Component ────────────────────────────────────────────────
function HeroSection({
  trackCtaClick,
  trackEvent,
  pageKey,
  memeShirtPrompt,
  promptDestination,
}: {
  trackCtaClick: (placement: string) => void;
  trackEvent: (event: string, props: Record<string, string>) => void;
  pageKey: string;
  memeShirtPrompt: string;
  promptDestination: (prompt: string) => string;
}) {
  const [visible, setVisible] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  // Cycle through generation steps: each step shows for 2s, then 0.6s shimmer before next
  useEffect(() => {
    const advance = () => {
      setGenerating(true);
      setTimeout(() => {
        setGenStep(prev => (prev + 1) % GEN_STEPS.length);
        setGenerating(false);
      }, 600);
    };
    const id = setInterval(advance, 2600);
    return () => clearInterval(id);
  }, []);

  const fadeLeft: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : "translateX(-28px)",
    transition: "opacity 0.65s ease, transform 0.65s ease",
  };
  const fadeRight: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : "translateX(28px)",
    transition: "opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s",
  };

  return (
    <section className="relative overflow-hidden border-y border-border bg-[#09090b]">
      <div className="grid lg:grid-cols-2" style={{ height: "calc(100dvh - 130px)", minHeight: 480 }}>

        {/* ── LEFT: Phone mockup ── */}
        <div
          className="relative flex flex-col items-center justify-between gap-3 bg-[#09090b] px-8 py-6 overflow-hidden"
          style={{ height: "100%" }}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <div className="h-80 w-80 rounded-full bg-orange-500/8 blur-3xl" />
          </div>

          {/* Top text */}
          <div className="relative z-10 w-full text-center" style={fadeLeft}>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-orange-400">
              <Moon className="h-3 w-3" />
              Midnight scroll
            </span>
            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              You saw it on TikTok at midnight.
            </h1>
            <p className="mt-1 text-xs font-medium text-white/50">
              Too good to leave trapped on your screen.
            </p>
          </div>

          {/* Phone — dominant visual */}
          <div
            className="relative z-10 flex-1 flex items-center justify-center w-full"
            style={fadeLeft}
          >
            <div
              className="relative rounded-[2.4rem] p-[3px]"
              style={{
                maxWidth: 220,
                width: "100%",
                background: "linear-gradient(145deg, #555, #1c1c1c)",
                boxShadow: "0 28px 80px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            >
              {/* Notch */}
              <div className="absolute left-1/2 top-[10px] z-20 h-[14px] w-[56px] -translate-x-1/2 rounded-full bg-black" />
              <div className="overflow-hidden rounded-[2.1rem] bg-black">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pb-1 pt-5 text-[0.6rem] font-semibold text-white/50">
                  <span>9:41</span>
                  <span>▪▪▪</span>
                </div>
                {/* TikTok nav */}
                <div className="flex justify-center gap-5 pb-1 text-[0.6rem] font-black uppercase text-white/40">
                  <span>Following</span>
                  <span className="border-b-[1.5px] border-white text-white">For You</span>
                </div>
                {/* Screenshot */}
                <div className="relative" style={{ aspectRatio: "9/14" }}>
                  <img
                    src={HERO_SCREENSHOT}
                    alt="Original meme screenshot — Roommate's Favorite Game: Sink Isn't Full Yet"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                  />
                  {/* Viral badge */}
                  <div
                    className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[0.55rem] font-black uppercase text-white"
                    style={{ background: "linear-gradient(135deg,#ff0050,#ff4080)", boxShadow: "0 0 10px rgba(255,0,80,0.5)" }}
                  >
                    🔥 VIRAL
                  </div>
                  {/* Bottom overlay */}
                  <div
                    className="absolute inset-x-0 bottom-0 px-3 py-2"
                    style={{ background: "linear-gradient(to top,rgba(0,0,0,0.9) 60%,transparent)" }}
                  >
                    <p className="text-[0.6rem] font-bold text-white">@snarkyazzhumans</p>
                    <div className="mt-1 flex gap-2 text-[0.55rem] font-semibold text-white/70">
                      <span>❤️ 2.4M</span><span>💬 18K</span><span>↗ 94K</span>
                    </div>
                  </div>
                </div>
                {/* Bottom bar */}
                <div className="flex justify-around py-2 text-[0.7rem] text-white/30">
                  <span>🏠</span><span>🔍</span><span>＋</span><span>💬</span><span>👤</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Design progression + shirt ── */}
        <div
          className="relative flex flex-col items-center justify-between gap-3 bg-[#0d0d0f] px-8 py-6 overflow-hidden"
          style={{ height: "100%" }}
        >
          {/* Mobile zap */}
          <div
            className="absolute -top-5 left-1/2 z-20 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-xl lg:hidden"
            style={{ background: "#f97316", boxShadow: "0 0 20px rgba(249,115,22,0.7)" }}
          >
            <Zap className="h-6 w-6 fill-current" />
          </div>

          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl" />
          </div>

          {/* Top: label + headline */}
          <div className="relative z-10 w-full text-center" style={fadeRight}>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-orange-400">
              <Sun className="h-3 w-3" />
              Morning drop
            </span>
            <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              Now it's on your shirt by morning.
            </h2>
            <p className="mt-1 text-xs font-medium text-white/50">
              Be the first one wearing the punchline.
            </p>
          </div>

          {/* Progression strip */}
          <div className="relative z-10 w-full" style={fadeRight}>
            <p className="mb-3 text-center text-[0.6rem] font-black uppercase tracking-widest text-orange-400/80">
              ✦ AI refines your idea in seconds ✦
            </p>
            <div className="flex items-end justify-center gap-3">
              {GEN_STEPS.map((step, i) => {
                const isActive = i === genStep;
                const isHovered = hoveredStep === i;
                return (
                  <React.Fragment key={step.src}>
                    <div className="flex flex-col items-center gap-1">
                      {/* Fixed-size outer shell — overflow visible so scale doesn't clip */}
                      <div
                        style={{ width: 72, height: 72, flexShrink: 0, position: "relative", zIndex: isHovered ? 30 : 1 }}
                        onMouseEnter={() => setHoveredStep(i)}
                        onMouseLeave={() => setHoveredStep(null)}
                      >
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 12,
                            overflow: "hidden",
                            border: isActive
                              ? "2.5px solid #f97316"
                              : isHovered
                              ? "2.5px solid rgba(249,115,22,0.7)"
                              : "2px solid rgba(255,255,255,0.1)",
                            boxShadow: isHovered
                              ? "0 0 0 3px rgba(249,115,22,0.25), 0 0 24px rgba(249,115,22,0.7)"
                              : isActive
                              ? "0 0 16px rgba(249,115,22,0.55)"
                              : "none",
                            transform: isHovered ? "scale(1.55)" : "scale(1)",
                            transformOrigin: "center bottom",
                            transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, box-shadow 0.2s",
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={step.src}
                            alt={step.label}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            loading="lazy"
                          />
                          {/* Generating shimmer */}
                          {generating && i === (genStep + 1) % GEN_STEPS.length && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)" }}>
                              <div style={{ display: "flex", gap: 4 }}>
                                {[0, 1, 2].map(d => (
                                  <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c", animation: `sahDot 0.8s ease-in-out ${d * 0.15}s infinite` }} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Label — sits outside the scale area, always readable */}
                      <p
                        style={{
                          fontSize: "0.48rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: isActive || isHovered ? "#fb923c" : "rgba(255,255,255,0.4)",
                          transition: "color 0.2s",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {step.label}
                      </p>
                    </div>
                    {i < GEN_STEPS.length - 1 && (
                      <ArrowRight className="h-3 w-3 flex-shrink-0 text-orange-500/40 mb-5" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Shirt mockup */}
          <div className="relative z-10 flex-1 flex items-center justify-center w-full" style={fadeRight}>
            <div className="relative" style={{ maxWidth: 240, width: "100%" }}>
              {/* NEW DROP badge */}
              <div
                className="absolute -right-2 -top-3 z-20 rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase text-white"
                style={{ background: "hsl(0 84% 55%)", boxShadow: "0 0 16px hsl(0 84% 55%/0.65)", animation: "sahPulse 2.2s ease-in-out infinite" }}
              >
                🔥 NEW DROP
              </div>
              <div
                style={{ transform: "rotate(-1.5deg)", transition: "transform 0.3s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "rotate(0deg) scale(1.02)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "rotate(-1.5deg) scale(1)")}
              >
                <img
                  src={HERO_SHIRT_MOCKUP}
                  alt="Roommate's Favorite Game — AI-designed shirt"
                  className="w-full drop-shadow-2xl"
                  loading="eager"
                />
              </div>
              <p className="mt-1.5 text-center text-[0.6rem] font-bold text-white/35">
                ✓ Premium tee · Printed on demand · Ships 3–5 days
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="relative z-10 flex w-full max-w-sm flex-col gap-2 sm:flex-row" style={fadeRight}>
            <Button asChild variant="hero" size="lg" className="group min-w-0 flex-1 whitespace-normal px-4 text-center text-sm">
              <Link
                to={promptDestination(memeShirtPrompt)}
                aria-label="Make a meme-inspired custom shirt"
                onClick={() => trackCtaClick("hero_primary")}
              >
                <span className="min-w-0">Make a Meme-Inspired Shirt</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-0 w-full px-4 text-sm sm:w-auto sm:px-6">
              <a
                href="#gift-ideas"
                aria-label="See AI custom clothing gift ideas"
                onClick={() => trackEvent("ai_custom_clothing_cta_click", { page: pageKey, placement: "hero_secondary" })}
              >
                See Gift Ideas
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Desktop lightning bolt divider ── */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-20 -translate-x-1/2 lg:block">
        <div
          className="h-full w-full"
          style={{
            background: "#f97316",
            clipPath: "polygon(48% 0,78% 0,56% 42%,86% 42%,36% 100%,50% 56%,18% 56%)",
            filter: "drop-shadow(0 0 18px rgba(249,115,22,0.8)) drop-shadow(0 0 40px rgba(249,115,22,0.4))",
            animation: "sahBoltPulse 2.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes sahPulse {
          0%,100%{box-shadow:0 0 16px hsl(0 84% 55%/0.6);}
          50%{box-shadow:0 0 28px hsl(0 84% 55%/0.35);}
        }
        @keyframes sahBoltPulse {
          0%,100%{filter:drop-shadow(0 0 18px rgba(249,115,22,0.8)) drop-shadow(0 0 40px rgba(249,115,22,0.4));}
          50%{filter:drop-shadow(0 0 28px rgba(249,115,22,1)) drop-shadow(0 0 60px rgba(249,115,22,0.6));}
        }
        @keyframes sahDot {
          0%,100%{transform:translateY(0);opacity:0.4;}
          50%{transform:translateY(-4px);opacity:1;}
        }
        @keyframes sahFadeDown {
          from{opacity:0;transform:translateX(-50%) translateY(-6px);}
          to{opacity:1;transform:translateX(-50%) translateY(0);}
        }
      `}</style>
    </section>
  );
}
// ────────────────────────────────────────────────────────────────────────────

const AiCustomClothing = () => {
  const videoPlayedRef = useRef(false);

  useEffect(() => {
    trackEvent("landing_page_view", { page: PAGE_KEY });
  }, []);

  const trackCtaClick = (placement: string) => {
    trackEvent("ai_custom_clothing_cta_click", { page: PAGE_KEY, placement });
    trackEvent("customizer_start", { page: PAGE_KEY, source: placement });
  };

  const handleVideoPlay = () => {
    if (videoPlayedRef.current) return;
    videoPlayedRef.current = true;
    trackEvent("video_play", { page: PAGE_KEY, video: "ugc_440" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>AI Custom Clothing & One-of-One Gifts | Snarky Azz Humans</title>
        <meta
          name="description"
          content="Turn trending meme-worthy moments, inside jokes, pet photos, and wild ideas into one-of-one AI-designed shirts, mugs, blankets, totes, greeting cards, and personalized gifts."
        />
        <link rel="canonical" href="https://www.snarkyazzhumans.com/ai-custom-clothing" />
        <meta property="og:title" content="AI Custom Clothing & One-of-One Gifts | Snarky Azz Humans" />
        <meta
          property="og:description"
          content="Turn trending meme-worthy moments, inside jokes, pet photos, and wild ideas into one-of-one AI-designed shirts, mugs, blankets, totes, greeting cards, and personalized gifts."
        />
        <meta property="og:url" content="https://www.snarkyazzhumans.com/ai-custom-clothing" />
        <meta property="og:image" content="https://www.snarkyazzhumans.com/images/ai-custom-clothing/roommate-sink-design.jpeg" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header brandAsHeading={false} />

      <main className="flex-1 pb-24 md:pb-0">
        <HeroSection trackCtaClick={trackCtaClick} trackEvent={trackEvent} pageKey={PAGE_KEY} memeShirtPrompt={MEME_SHIRT_PROMPT} promptDestination={promptDestination} />

        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="grid gap-10 md:grid-cols-[1fr_0.8fr] md:items-center">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-primary">Trend to shirt story</span>
                <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                  From "Send This to the Group Chat" to "I Need That on a Shirt"
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                  <p>
                    Someone sees a trend, joke, pet moment, or chaotic roommate behavior and immediately pictures the friend who would lose it.
                  </p>
                  <p>
                    Then the idea becomes bigger than a text. It could be a shirt, mug, blanket, tote, card, or gift that turns the moment into proof.
                  </p>
                  <p>
                    Snarky Azz Humans helps turn that spark into a custom product built around the person, the moment, and the joke.
                  </p>
                </div>
              </div>

              <figure className="mx-auto w-full max-w-sm">
                <div className="overflow-hidden rounded-lg border border-border bg-black shadow-2xl">
                  <video
                    src={ugcVideo}
                    poster={VIDEO_POSTER}
                    className="aspect-[9/16] w-full object-contain"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    aria-label="Snarky Azz Humans product idea video"
                    onPlay={handleVideoPlay}
                  />
                </div>
                <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                  Product ideas work best when they feel personal, specific, and impossible to buy off a shelf.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-card/50 py-16 md:py-24 scroll-mt-24">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                How It <span className="text-primary">Works</span>
              </h2>
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                Four steps from rough idea to custom gift.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-4">
              {howItWorks.map((item) => (
                <Card key={item.step} className="p-6 text-center transition-all duration-300 hover:border-primary/50">
                  <div className="text-5xl font-black text-primary/20">{item.step}</div>
                  <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Product <span className="text-primary">Pathways</span>
              </h2>
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                Start with the gift format that makes the idea hit hardest.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {productPathways.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Explore ${item.title}`}
                  onClick={() => {
                    trackEvent("product_pathway_click", { page: PAGE_KEY, pathway: item.title, destination: item.to });
                    if (item.to.startsWith("/custom-design")) {
                      trackEvent("customizer_start", { page: PAGE_KEY, source: `product_pathway_${item.title}` });
                    }
                  }}
                >
                  <Card className="h-full overflow-hidden transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_24px_hsl(var(--primary)/0.18)]">
                    <div className="aspect-square overflow-hidden bg-background">
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-black group-hover:text-primary">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="gift-ideas" className="bg-card/50 py-16 md:py-24 scroll-mt-24">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Prompt Idea <span className="text-primary">Examples</span>
              </h2>
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                The best prompts sound like something only your people would understand.
              </p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promptExamples.map((prompt) => (
                <Link
                  key={prompt}
                  to={promptDestination(prompt)}
                  className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Start custom gift from prompt: ${prompt}`}
                  onClick={() => {
                    trackEvent("prompt_example_click", { page: PAGE_KEY, prompt });
                    trackEvent("customizer_start", { page: PAGE_KEY, source: "prompt_example" });
                  }}
                >
                  <Card className="h-full p-6 transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card/80">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-lg font-bold leading-snug">{prompt}</p>
                    <span className="mt-5 inline-flex items-center text-sm font-bold text-primary">
                      Start this idea
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-8 text-center md:p-12">
              <Package className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
                One-of-One, Because the Joke Has a Target Audience
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Not mass-produced. Not another boring gift. Built from the moment, the person, and the joke so it feels made for exactly one human.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card/50 py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Trust, Privacy, and <span className="text-primary">Quality</span>
              </h2>
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                Custom does not need to feel complicated, careless, or generic.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {trustCards.map((item) => (
                <Card key={item.title} className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                  AI Custom Clothing <span className="text-primary">FAQ</span>
                </h2>
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  Clear answers before you turn the moment into merch.
                </p>
              </div>
              <FAQAccordion items={faqItems} className="mt-10" />
            </div>
          </div>
        </section>

        <section className="bg-primary py-16 text-center text-primary-foreground md:py-20">
          <div className="container px-4">
            <h2 className="text-3xl font-black tracking-tight md:text-6xl">Turn the Moment Into the Gift</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium opacity-90 md:text-lg">
              Start with the idea everyone keeps bringing up. Make it something they can actually open.
            </p>
            <Button asChild size="xl" variant="secondary" className="mt-8 min-w-0 w-full max-w-md whitespace-normal px-4 text-center text-base font-black sm:w-auto sm:px-10 sm:text-lg">
              <Link
                to={CUSTOMIZER_PATH}
                aria-label="Create your one-of-one AI custom gift"
                onClick={() => trackCtaClick("final_cta")}
              >
                <span className="min-w-0">Create Your One-of-One Gift</span>
                <ArrowRight className="h-5 w-5 shrink-0" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur md:hidden">
        <Button asChild variant="hero" size="lg" className="w-full">
          <Link
            to={CUSTOMIZER_PATH}
            aria-label="Create your gift"
            onClick={() => trackCtaClick("sticky_mobile")}
          >
            Create Your Gift
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="pb-24 md:pb-0">
        <Footer />
      </div>
    </div>
  );
};

export default AiCustomClothing;
