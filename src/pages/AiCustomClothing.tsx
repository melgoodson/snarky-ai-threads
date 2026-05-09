import { useEffect, useRef } from "react";
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
  Package,
  PawPrint,
  Shield,
  Shirt,
  ShoppingBag,
  Sparkles,
  Truck,
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

const heroProducts = [
  {
    src: "/images/shirt-mockup.png",
    alt: "AI custom shirt mockup for a one-of-one gift",
    label: "Shirts",
  },
  {
    src: "/images/mug-mockup.png",
    alt: "Custom mug mockup for a personalized joke gift",
    label: "Mugs",
  },
  {
    src: "/images/tote-mockup.png",
    alt: "Custom tote bag mockup with a personalized design",
    label: "Totes",
  },
  {
    src: "/images/greeting-card-mockup.png",
    alt: "Custom greeting card mockup for a personal gift",
    label: "Cards",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Bring the idea",
    description: "Start with a trend, pet photo, inside joke, work rant, roast, or rough prompt.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "AI helps shape the design",
    description: "Turn the thought into a design direction that fits the person and the product.",
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
    image: "/images/shirt-mockup.png",
    alt: "Blank shirt mockup for AI custom t-shirts",
    icon: Shirt,
  },
  {
    title: "Custom Hoodies",
    description: "Make the idea warmer, louder, and easier to gift.",
    to: `${CUSTOMIZER_PATH}&product=hoodie`,
    image: "/images/hoodie-mockup.png",
    alt: "Blank hoodie mockup for a custom AI clothing gift",
    icon: Shirt,
  },
  {
    title: "Funny Mugs",
    description: "For meeting haters, caffeine loyalists, and people with opinions.",
    to: "/mugs",
    image: "/images/mug-mockup.png",
    alt: "Custom mug mockup for funny personalized gifts",
    icon: Coffee,
  },
  {
    title: "Custom Photo Blankets",
    description: "Turn a family photo, pet face, or birthday memory into a cozy gift.",
    to: "/blankets",
    image: "/images/carousel/blanket-hero-1.jpg",
    alt: "Custom photo blanket gift example",
    icon: Image,
  },
  {
    title: "Tote Bags",
    description: "For the friend who brings snacks, drama, and a reusable bag.",
    to: "/tote-bags",
    image: "/images/tote-mockup.png",
    alt: "Custom tote bag mockup for a personalized gift",
    icon: ShoppingBag,
  },
  {
    title: "Greeting Cards",
    description: "Make the card as specific as the gift and twice as memorable.",
    to: "/greeting-cards",
    image: "/images/greeting-card-mockup.png",
    alt: "Custom greeting card mockup for personal messages",
    icon: Gift,
  },
  {
    title: "Pet Gifts",
    description: "Put the pet's face, side-eye, or chaos energy where it belongs.",
    to: `${CUSTOMIZER_PATH}&prompt=${encodeURIComponent("Make a custom pet gift from my pet photo.")}`,
    image: "/images/mug-mockup.png",
    alt: "Mug mockup for custom pet photo gifts",
    icon: PawPrint,
  },
  {
    title: "Coworker Gifts",
    description: "Make the meeting joke, desk drama, or office survival gift official.",
    to: "/category/funny-coworker-gifts",
    image: "/images/carousel/mug-hero-1.jpg",
    alt: "Funny coworker mug gift idea",
    icon: Briefcase,
  },
];

const promptExamples = [
  "Make a shirt from my dog's judgmental face.",
  "Turn our group chat joke into a birthday gift.",
  "Make a mug for someone who hates meetings.",
  "Create a blanket from this family photo but make it funny.",
  "Make a tote bag for the friend who brings chaos everywhere.",
  "Create a white elephant gift people actually fight over.",
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
      "You can use your own ideas, photos, jokes, and original prompts. Do not upload copyrighted logos, characters, celebrity likenesses, trademarked artwork, or designs you do not have rights to use.",
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
    "Turn trends, inside jokes, pet photos, and wild ideas into one-of-one AI-designed shirts, mugs, blankets, totes, greeting cards, and personalized gifts.",
};

function promptDestination(prompt: string) {
  return `${CUSTOMIZER_PATH}&prompt=${encodeURIComponent(prompt)}`;
}

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
          content="Turn trends, inside jokes, pet photos, and wild ideas into one-of-one AI-designed shirts, mugs, blankets, totes, greeting cards, and personalized gifts."
        />
        <link rel="canonical" href="https://www.snarkyazzhumans.com/ai-custom-clothing" />
        <meta property="og:title" content="AI Custom Clothing & One-of-One Gifts | Snarky Azz Humans" />
        <meta
          property="og:description"
          content="Turn trends, inside jokes, pet photos, and wild ideas into one-of-one AI-designed shirts, mugs, blankets, totes, greeting cards, and personalized gifts."
        />
        <meta property="og:url" content="https://www.snarkyazzhumans.com/ai-custom-clothing" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header brandAsHeading={false} />

      <main className="flex-1 pb-24 md:pb-0">
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />
          <div className="container relative z-10 px-4">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div className="max-w-[20rem] sm:max-w-3xl">
                <span className="block max-w-xs text-sm font-bold uppercase tracking-widest text-primary sm:max-w-none">
                  AI custom clothing and personalized gifts
                </span>
                <h1 className="mt-4 max-w-full break-words text-3xl font-black leading-tight tracking-normal sm:text-4xl md:text-6xl lg:text-7xl">
                  <span className="block sm:inline">Make a One-of-One Gift</span>{" "}
                  <span className="block sm:inline">From the Thing</span>{" "}
                  <span className="block sm:inline">Everyone Is Talking About</span>
                </h1>
                <p className="mt-6 max-w-full text-base font-medium leading-relaxed text-muted-foreground md:text-xl">
                  Turn a trend, inside joke, pet photo, work rant, birthday roast, or wild idea into AI-designed clothing and gifts made for exactly one person.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button asChild variant="hero" size="xl" className="group min-w-0 w-full whitespace-normal px-3 text-center text-sm sm:w-auto sm:px-10 sm:text-lg">
                    <Link
                      to={CUSTOMIZER_PATH}
                      aria-label="Create your one-of-one custom gift"
                      onClick={() => trackCtaClick("hero_primary")}
                    >
                      <span className="min-w-0">Create Your One-of-One Gift</span>
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="xl" className="min-w-0 w-full px-4 text-base sm:w-auto sm:px-10 sm:text-lg">
                    <a
                      href="#gift-ideas"
                      aria-label="See AI custom clothing gift ideas"
                      onClick={() => trackEvent("ai_custom_clothing_cta_click", { page: PAGE_KEY, placement: "hero_secondary" })}
                    >
                      See Gift Ideas
                    </a>
                  </Button>
                </div>
                <ul className="mt-5 grid gap-2 text-sm font-semibold text-muted-foreground sm:grid-cols-3">
                  <li className="rounded-lg border border-border bg-card/60 px-3 py-2">
                    Use your own ideas and photos
                  </li>
                  <li className="rounded-lg border border-border bg-card/60 px-3 py-2">
                    AI-assisted design help
                  </li>
                  <li className="rounded-lg border border-border bg-card/60 px-3 py-2">
                    Original prompts only
                  </li>
                </ul>
              </div>

              <div className="relative mx-auto w-full max-w-[20rem] md:max-w-lg">
                <div className="absolute -inset-4 rounded-lg bg-primary/10 blur-2xl" />
                <div className="relative rounded-lg border border-border bg-card/90 p-4 shadow-2xl">
                  <div className="grid grid-cols-2 gap-3">
                    {heroProducts.map((item) => (
                      <div key={item.label} className="min-w-0 overflow-hidden rounded-lg border border-border bg-background">
                        <img src={item.src} alt={item.alt} className="aspect-square w-full min-w-0 object-cover" loading="eager" />
                        <div className="border-t border-border px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-primary/20 bg-background/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Idea in</p>
                    <p className="mt-1 text-lg font-black">"My dog looks like he pays rent here."</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest text-primary">Gift out</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A shirt, mug, tote, or card that feels suspiciously specific.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="grid gap-10 md:grid-cols-[1fr_0.8fr] md:items-center">
              <div>
                <span className="text-sm font-bold uppercase tracking-widest text-primary">Trend to shirt story</span>
                <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                  From "That Would Be Hilarious" to "I Need That on a Shirt"
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                  <p>
                    Someone sees a trend, joke, pet moment, or personal idea and immediately pictures the friend who would lose it.
                  </p>
                  <p>
                    Then the idea becomes bigger than a text. It could be a shirt, mug, blanket, tote, card, or gift that makes the moment real.
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
