import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PRODUCT_CATEGORIES = [
    {
        title: "SNARKY",
        highlight: "SHIRTS",
        tagline: "Heavyweight cotton tees that say everything you're thinking — so you don't have to.",
        cta: "Shop Shirts",
        href: "/shirts",
        emoji: "👕",
        gradient: "from-red-500/10 to-orange-500/10",
    },
    {
        title: "COZY",
        highlight: "HOODIES",
        tagline: "Warm, bold, and dripping with attitude. Pull it on, hood up, mic drop.",
        cta: "Shop Hoodies",
        href: "/hoodies",
        emoji: "🧥",
        gradient: "from-blue-500/10 to-indigo-500/10",
    },
    {
        title: "CUSTOM PHOTO",
        highlight: "BLANKETS",
        tagline: "Your memories, printed edge-to-edge on premium fleece. The gift that actually means something.",
        cta: "Shop Blankets",
        href: "/blankets",
        emoji: "🛏️",
        gradient: "from-purple-500/10 to-pink-500/10",
    },
    {
        title: "SNARKY",
        highlight: "TOTE BAGS",
        tagline: "Carry your attitude everywhere. Durable, roomy, and judging everyone at the grocery store.",
        cta: "Shop Tote Bags",
        href: "/tote-bags",
        emoji: "👜",
        gradient: "from-green-500/10 to-emerald-500/10",
    },
    {
        title: "MOOD",
        highlight: "MUGS",
        tagline: "Start your morning with a hot take. Ceramic, dishwasher-safe, and brutally honest.",
        cta: "Shop Mugs",
        href: "/mugs",
        emoji: "☕",
        gradient: "from-amber-500/10 to-yellow-500/10",
    },
    {
        title: "SNARKY",
        highlight: "GREETING CARDS",
        tagline: "For when Hallmark is too wholesome. 5×7, coated, and guaranteed to get a reaction.",
        cta: "Shop Cards",
        href: "/greeting-cards",
        emoji: "💌",
        gradient: "from-pink-500/10 to-rose-500/10",
    },
];

export const ProductShowcase = () => {
    const navigate = useNavigate();

    return (
        <section className="py-16 md:py-24">
            <div className="container px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                        SHOP BY <span className="text-primary">PRODUCT</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        From shirts to mugs — every product is a canvas for your attitude.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PRODUCT_CATEGORIES.map((category, index) => (
                        <div
                            key={category.href}
                            className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${category.gradient} hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)] cursor-pointer`}
                            onClick={() => navigate(category.href)}
                        >
                            <div className="p-8 md:p-10 flex flex-col justify-between min-h-[280px]">
                                <div>
                                    <span className="text-6xl mb-4 block">{category.emoji}</span>
                                    <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                                        {category.title}{" "}
                                        <span className="text-primary">{category.highlight}</span>
                                    </h3>
                                    <p className="text-muted-foreground text-sm md:text-base mt-3 leading-relaxed max-w-sm">
                                        {category.tagline}
                                    </p>
                                </div>
                                <div className="mt-6">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 font-bold"
                                    >
                                        {category.cta}
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
