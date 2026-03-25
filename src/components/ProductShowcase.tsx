import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface ProductCategory {
    title: string;
    highlight: string;
    tagline: string;
    cta: string;
    href: string;
    images: string[];
    gradient: string;
    badge?: string;
}

const PRODUCT_CATEGORIES: ProductCategory[] = [
    {
        title: "SNARKY",
        highlight: "SHIRTS",
        tagline: "Heavyweight cotton tees that say everything you're thinking — so you don't have to.",
        cta: "Shop Shirts",
        href: "/shirts",
        images: [
            "/images/carousel/shirt-hero-new-1.jpg",
            "/images/carousel/shirt-hero-new-2.jpg",
            "/images/carousel/shirt-hero-new-3.png",
        ],
        gradient: "from-red-500/10 to-orange-500/10",
        badge: "🔥 Bestseller",
    },
    {
        title: "COZY",
        highlight: "HOODIES",
        tagline: "Warm, bold, and dripping with attitude. Pull it on, hood up, mic drop.",
        cta: "Shop Hoodies",
        href: "/hoodies",
        images: [
            "/images/carousel/hoodie-hero-1.jpg",
            "/images/carousel/hoodie-hero-2.jpg",
        ],
        gradient: "from-blue-500/10 to-indigo-500/10",
    },
    /* HIDDEN: investigating print quality
    {
        title: "CUSTOM PHOTO",
        highlight: "BLANKETS",
        tagline: "Your memories, printed edge-to-edge on premium fleece. The gift that actually means something.",
        cta: "Shop Blankets",
        href: "/blankets",
        images: ["/images/carousel/blanket-hero-1.jpg"],
        gradient: "from-purple-500/10 to-pink-500/10",
    },
    */
    {
        title: "SNARKY",
        highlight: "TOTE BAGS",
        tagline: "Carry your attitude everywhere. Durable, roomy, and judging everyone at the grocery store.",
        cta: "Shop Tote Bags",
        href: "/tote-bags",
        images: [
            "/images/carousel/tote-hero-1.jpg",
            "/images/carousel/tote-hero-2.jpg",
        ],
        gradient: "from-green-500/10 to-emerald-500/10",
    },
    {
        title: "MOOD",
        highlight: "MUGS",
        tagline: "Start your morning with a hot take. Ceramic, dishwasher-safe, and brutally honest.",
        cta: "Shop Mugs",
        href: "/mugs",
        images: [
            "/images/carousel/mug-hero-1.jpg",
            "/images/carousel/mug-hero-2.jpg",
        ],
        gradient: "from-amber-500/10 to-yellow-500/10",
        badge: "⭐ Popular",
    },
    {
        title: "SNARKY",
        highlight: "GREETING CARDS",
        tagline: "For when Hallmark is too wholesome. 5×7, coated, and guaranteed to get a reaction.",
        cta: "Shop Cards",
        href: "/greeting-cards",
        images: ["/images/carousel/greeting-card-hero-1.jpg"],
        gradient: "from-pink-500/10 to-rose-500/10",
    },
];

const CategoryCard = ({ category }: { category: ProductCategory }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const hasMultiple = category.images.length > 1;

    // Auto-rotate every 4 seconds for multi-image cards
    useEffect(() => {
        if (!hasMultiple) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % category.images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [hasMultiple, category.images.length]);

    const goTo = useCallback(
        (e: React.MouseEvent, idx: number) => {
            e.stopPropagation();
            setCurrentIndex(idx);
        },
        []
    );

    const prev = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setCurrentIndex((i) => (i - 1 + category.images.length) % category.images.length);
        },
        [category.images.length]
    );

    const next = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setCurrentIndex((i) => (i + 1) % category.images.length);
        },
        [category.images.length]
    );

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${category.gradient} hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)] cursor-pointer`}
            onClick={() => navigate(category.href)}
        >
            {/* Product Photo / Carousel */}
            <div className="aspect-[4/3] overflow-hidden relative">
                {/* Images */}
                <div className="relative w-full h-full">
                    {category.images.map((img, idx) => (
                        <img
                            key={img}
                            src={img}
                            alt={`${category.title} ${category.highlight} — snarky product ${idx + 1}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                                idx === currentIndex
                                    ? "opacity-100 scale-100"
                                    : "opacity-0 scale-105"
                            } group-hover:scale-105`}
                        />
                    ))}
                </div>

                {/* Badge */}
                {category.badge && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg z-10">
                        {category.badge}
                    </span>
                )}

                {/* Carousel controls (only for multi-image) */}
                {hasMultiple && (
                    <>
                        {/* Prev / Next arrows */}
                        <button
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>

                        {/* Dot indicators */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                            {category.images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => goTo(e, idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        idx === currentIndex
                                            ? "bg-white w-4"
                                            : "bg-white/50 hover:bg-white/80"
                                    }`}
                                    aria-label={`Go to image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Info */}
            <div className="p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                    {category.title}{" "}
                    <span className="text-primary">{category.highlight}</span>
                </h3>
                <p className="text-muted-foreground text-sm md:text-base mt-3 leading-relaxed max-w-sm">
                    {category.tagline}
                </p>
                <div className="mt-5">
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
    );
};

export const ProductShowcase = () => {
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
                    {PRODUCT_CATEGORIES.map((category) => (
                        <CategoryCard key={category.href} category={category} />
                    ))}
                </div>
            </div>
        </section>
    );
};
