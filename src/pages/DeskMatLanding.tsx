import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, MousePointer, Layers, CheckCircle2, Star, Flame, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";
import { ImageCarousel } from "@/components/ImageCarousel";
import { AiCustomGiftCTA } from "@/components/AiCustomGiftCTA";

const HERO_IMAGES = [
    "/images/deskmat-mockup-snarky-1.jpg",
    "/images/deskmat-mockup-rbf-2.jpg",
    "/images/deskmat-mockup-overthinking-3.jpg",
    "/images/desk-mat-lifestyle-1.jpg",
    "/images/desk-mat-lifestyle-2.jpg",
    "/images/desk-mat-mockup.png",
];

const OCCASIONS = [
    { emoji: "💻", title: "WFH Command Center", desc: "Upgrade your daily grind with a desk surface that speaks your mind during Zoom calls." },
    { emoji: "🎮", title: "Battlestations & Gaming", desc: "Ultra-smooth micro-weave surface for pixel-perfect mouse tracking and zero stutter." },
    { emoji: "☕", title: "Coffee Spill Defense", desc: "3mm thick dense neoprene absorbs minor spills and keeps your timber desk spotless." },
    { emoji: "🤫", title: "Passive-Aggressive Office Gift", desc: "The ultimate gift for the coworker who needs everyone to know they're busy." },
    { emoji: "🎁", title: "White Elephant Winner", desc: "The high-utility gift under $25 everyone will actively fight to steal at the party." },
    { emoji: "🎨", title: "100% Custom AI Art", desc: "Turn inside jokes, pet snark, or custom AI artwork into a massive desk centerpiece." },
];

const SIZES = [
    {
        size: "12\" × 18\"",
        label: "Compact Setup",
        badge: "Everyday Essential",
        desc: "Ideal for compact desks, laptop setups, or dedicated mouse glide areas.",
        price: "$21.99",
        originalPrice: "$29.99",
        popular: false
    },
    {
        size: "12\" × 22\"",
        label: "Standard Desk",
        badge: "⭐ Most Popular",
        desc: "Fits a full-size keyboard and mouse with room to spare. The sweet spot.",
        price: "$25.99",
        originalPrice: "$34.99",
        popular: true
    },
    {
        size: "16\" × 32\"",
        label: "Extended Battlestation",
        badge: "Full Desk Domination",
        desc: "Generous edge-to-edge desk coverage for ultimate gaming and workstation comfort.",
        price: "$31.99",
        originalPrice: "$42.99",
        popular: false
    },
];

const REVIEWS = [
    {
        name: "Marcus T.",
        role: "Senior Software Engineer",
        rating: 5,
        title: "Protected my desk and warned my manager",
        content: "Got the 16x32 extended size with custom snark. Stitching along the edges is top tier and mouse glide is super smooth. 10/10 recommend.",
    },
    {
        name: "Sarah K.",
        role: "Creative Director",
        rating: 5,
        title: "Colors are insanely vibrant",
        content: "Was worried about the sublimation print on fabric, but the resolution came out crystal sharp. The non-slip rubber bottom doesn't budge at all.",
    },
    {
        name: "Dave R.",
        role: "Product Manager",
        rating: 5,
        title: "Best coworker gift of the year",
        content: "Ordered 3 for our team secret santa. Everyone was asking where we bought them. Heavyweight, thick, and very high quality.",
    },
];

const DeskMatLanding = () => {
    const navigate = useNavigate();

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Custom Desk Mat & Gaming Mouse Pad",
        "image": "https://www.snarkyhumans.com/images/desk-mat-mockup.png",
        "description": "Custom printed neoprene desk mats and extended gaming mouse pads with anti-slip rubber backing and hemmed edges. Available in 3 sizes.",
        "brand": {
            "@type": "Brand",
            "name": "Snarky Humans"
        },
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": "21.99",
            "highPrice": "31.99",
            "offerCount": "3"
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Helmet>
                <title>Custom Desk Mats &amp; Gaming Mouse Pads | Snarky Humans</title>
                <meta name="description" content="Design custom neoprene desk mats and extended gaming mouse pads. 3mm cushioning, anti-fray hemmed edges, non-slip rubber base. Featured Item of the Month!" />
                <link rel="canonical" href="https://www.snarkyhumans.com/desk-mats" />
                <meta property="og:title" content="Custom Desk Mats & Extended Mouse Pads | Snarky Humans" />
                <meta property="og:description" content="Shop or design custom 3mm neoprene desk mats. Hemmed anti-fray edges and vibrant edge-to-edge printing." />
                <meta property="og:image" content="https://www.snarkyhumans.com/images/desk-mat-mockup.png" />
                <meta property="og:url" content="https://www.snarkyhumans.com/desk-mats" />
                <meta property="og:type" content="product" />
                <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
            </Helmet>
            <Header />

            {/* Featured Item Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-2 px-4 text-center font-bold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2">
                <Flame className="h-4 w-4 animate-bounce" />
                <span>OFFICIAL FEATURED ITEM OF THE MONTH: CUSTOM DESK MATS ON SALE NOW</span>
                <Flame className="h-4 w-4 animate-bounce" />
            </div>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-16 md:py-28 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1)_0%,transparent_70%)]" />
                    <div className="container px-4 relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black uppercase tracking-widest mb-4">
                                    <Trophy className="h-3.5 w-3.5" />
                                    Featured Item of the Month
                                </div>
                                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mt-1 mb-6 uppercase leading-tight">
                                    CUSTOM <span className="text-primary">DESK MATS</span>
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground font-medium mb-8 leading-relaxed">
                                    Transform your boring desk setup into an unapologetic statement piece. 3mm ultra-cushioned neoprene, hemmed anti-fray edges, and vibrant edge-to-edge prints.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <Button variant="hero" size="xl" className="group text-lg" onClick={() => navigate('/custom-design?product=deskmat')}>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        DESIGN YOUR DESK MAT
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <Button variant="outline" size="xl" className="text-lg" onClick={() => navigate('/designs')}>
                                        BROWSE DESIGNS
                                    </Button>
                                </div>
                                <div className="mt-6 flex items-center gap-3">
                                    <p className="text-3xl font-black">Starting at <span className="text-primary">$21.99</span></p>
                                    <span className="text-lg text-muted-foreground line-through">$29.99</span>
                                    <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md border border-primary/20">SAVE 27%</span>
                                </div>
                                <div className="mt-6 flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> 3 Sizes</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Hemmed Anti-Fray Edges</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Non-Slip Grip</span>
                                </div>
                            </div>
                            <div className="max-w-lg mx-auto w-full">
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card p-2 sm:p-4">
                                    <ImageCarousel images={HERO_IMAGES} alt="Custom Snarky Desk Mat Collection" interval={4000} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <AiCustomGiftCTA location="desk_mat_page" variant="compact" />

                {/* Specs / Features Grid */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Built For Daily Abuse</span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 mb-4">
                                PREMIUM <span className="text-primary">SPECIFICATIONS</span>
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg">
                                Not all desk mats are created equal. We built ours with heavy-duty materials designed to survive long hours and furious typing.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {[
                                {
                                    icon: Layers,
                                    title: "3mm Dense Neoprene",
                                    desc: "Plush, ergonomic cushioning that relieves wrist fatigue during marathon work or gaming sessions.",
                                },
                                {
                                    icon: Shield,
                                    title: "Hemmed Anti-Fray Stitching",
                                    desc: "Durable edge stitching prevents peeling, rolling, and fraying over years of daily mouse movement.",
                                },
                                {
                                    icon: MousePointer,
                                    title: "Micro-Weave Speed Top",
                                    desc: "Ultra-low friction fabric optimized for optical and laser mouse sensors for razor-sharp precision.",
                                },
                                {
                                    icon: Sparkles,
                                    title: "4K Edge-to-Edge Sublimation",
                                    desc: "Deep-fiber thermal infusion ensures rich, vibrant colors that won't fade, crack, or wash out.",
                                },
                            ].map((item) => (
                                <div key={item.title} className="bg-card border border-border rounded-xl p-6 text-center space-y-3 hover:border-primary/50 transition-all duration-300">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-black">{item.title}</h3>
                                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3 Sizes Section */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Choose Your Fit</span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 mb-4">
                                THREE DESK-DOMINATING <span className="text-primary">SIZES</span>
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg">
                                From compact laptop desks to sprawling battlestations, we have the exact footprint you need.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {SIZES.map((item) => (
                                <div
                                    key={item.size}
                                    className={`relative bg-card rounded-2xl p-8 text-center flex flex-col justify-between transition-all duration-300 border ${
                                        item.popular
                                            ? "border-primary shadow-[0_0_35px_hsl(var(--primary)/0.25)] scale-105 z-10"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                >
                                    {item.popular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow">
                                            {item.badge}
                                        </div>
                                    )}
                                    <div>
                                        {!item.popular && (
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">{item.badge}</span>
                                        )}
                                        <h3 className="text-3xl font-black text-foreground mb-1">{item.size}</h3>
                                        <p className="text-sm font-bold text-primary mb-4">{item.label}</p>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">{item.desc}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-6">
                                            <span className="text-3xl font-black text-foreground">{item.price}</span>
                                            <span className="text-base text-muted-foreground line-through">{item.originalPrice}</span>
                                        </div>
                                        <Button
                                            variant={item.popular ? "hero" : "outline"}
                                            className="w-full font-bold"
                                            onClick={() => navigate('/custom-design?product=deskmat')}
                                        >
                                            SELECT SIZE
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Occasions / Use Cases Grid */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
                                WHY YOUR DESK <span className="text-primary">NEEDS THIS</span>
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg">
                                More than just a mouse pad — it is a mood stabilizer for work, play, and everything in between.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {OCCASIONS.map((occ) => (
                                <div key={occ.title} className="p-6 bg-card border border-border rounded-xl hover:border-primary/40 transition-all space-y-2">
                                    <div className="text-3xl mb-2">{occ.emoji}</div>
                                    <h3 className="text-lg font-black">{occ.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{occ.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* AI / Live Mockup Preview Section */}
                <section className="py-16 md:py-24">
                    <div className="container px-4">
                        <div className="max-w-2xl mx-auto text-center mb-10">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Interactive Studio</span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 mb-4">
                                PREVIEW ON A <span className="text-primary">DESK MAT</span>
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg">
                                Upload your favorite funny graphic, meme, or company logo to see it rendered directly on a desk mat canvas.
                            </p>
                        </div>
                        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
                            <AIMockupGenerator
                                productImage="/images/desk-mat-mockup.png"
                                productTitle="Custom Desk Mat & Gaming Mouse Pad"
                            />
                        </div>
                    </div>
                </section>

                {/* Social Proof / Reviews */}
                <section className="py-16 md:py-24 bg-card/50">
                    <div className="container px-4">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Customer Verified</span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 mb-4">
                                REAL SNARK, <span className="text-primary">REAL REVIEWS</span>
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {REVIEWS.map((rev) => (
                                <div key={rev.name} className="p-6 bg-card border border-border rounded-xl space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <div className="flex gap-1 text-amber-500">
                                            {[...Array(rev.rating)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-amber-500" />
                                            ))}
                                        </div>
                                        <h3 className="font-black text-base">{rev.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">"{rev.content}"</p>
                                    </div>
                                    <div className="pt-2 border-t border-border/50 text-xs">
                                        <span className="font-bold text-foreground block">{rev.name}</span>
                                        <span className="text-muted-foreground">{rev.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="py-16 md:py-20 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/20">
                    <div className="container px-4 text-center max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                            READY TO UPGRADE YOUR DESK?
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Claim this month's featured item with promotional pricing starting at just $21.99.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button variant="hero" size="xl" className="text-lg" onClick={() => navigate('/custom-design?product=deskmat')}>
                                <Sparkles className="mr-2 h-5 w-5" />
                                CUSTOMIZE NOW
                            </Button>
                            <Button variant="outline" size="xl" className="text-lg" onClick={() => navigate('/collections')}>
                                EXPLORE ALL MERCH
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default DeskMatLanding;
