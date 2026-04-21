import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

// Review images from /snarkyazz - website reviews/WEBSITE REVIEWS/
const REVIEW_IMAGES = [
    "/snarkyazz - website reviews/WEBSITE REVIEWS/1.jpg",
    "/snarkyazz - website reviews/WEBSITE REVIEWS/2.jpg",
    "/snarkyazz - website reviews/WEBSITE REVIEWS/3.jpg",
    "/snarkyazz - website reviews/WEBSITE REVIEWS/4.jpg",
    "/snarkyazz - website reviews/WEBSITE REVIEWS/5.jpg",
    "/snarkyazz - website reviews/WEBSITE REVIEWS/6.jpg",
    "/snarkyazz - website reviews/WEBSITE REVIEWS/7.jpg",
];

export const WebsiteReviews = () => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Duplicate the list for a seamless infinite loop
    const allImages = [...REVIEW_IMAGES, ...REVIEW_IMAGES];

    return (
        <section className="py-16 md:py-24 overflow-hidden relative bg-background">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <div className="container px-4 mb-10 relative z-10 text-center">
                <span className="text-sm font-bold text-primary uppercase tracking-widest">
                    ★ Verified Customers
                </span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight mt-3 mb-4">
                    THEY <span className="text-primary">BOUGHT IT.</span>
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
                    Real reviews from real snarky humans. No cap, no filter.
                </p>

                {/* Star row */}
                <div className="flex items-center justify-center gap-1 mt-5">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className="h-6 w-6 text-yellow-400 fill-yellow-400"
                        />
                    ))}
                    <span className="ml-3 text-muted-foreground font-semibold text-sm">
                        5.0 · 100+ reviews
                    </span>
                </div>
            </div>

            {/* Gradient edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />

            {/* Marquee track */}
            <div
                className="flex gap-6 reviews-marquee"
                ref={trackRef}
                style={{ animationPlayState: isPaused ? "paused" : "running" }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {allImages.map((src, idx) => (
                    <div
                        key={idx}
                        className="flex-shrink-0 w-[300px] md:w-[340px] group select-none"
                    >
                        <div className="relative rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)] hover:-translate-y-1">
                            <img
                                src={src}
                                alt={`Customer review ${(idx % REVIEW_IMAGES.length) + 1}`}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                draggable={false}
                                loading="lazy"
                            />
                            {/* Verified badge */}
                            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
                                ✓ Verified
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .reviews-marquee {
                    animation: marquee-scroll 40s linear infinite;
                    width: max-content;
                }
                @keyframes marquee-scroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
            `}</style>
        </section>
    );
};
