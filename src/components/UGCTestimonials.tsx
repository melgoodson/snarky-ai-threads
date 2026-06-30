import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import tshirtVideo from "@/assets/ads_tshirt_snarkyazz_ugc.mp4";
import tumblerVideo from "@/assets/ads_tumbler_snarkyazz_ugc landscape.mp4";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

const TESTIMONIALS = [
    {
        video: tshirtVideo,
        product: "Snarky Tee",
        aspect: "aspect-[9/16]",
        key: "old-tee"
    },
    {
        video: "/snarkyazz%20-%20website%20reviews/WEBSITE%20REVIEWS/snarkyazzshirt1.mp4",
        product: "Snarky Shirt 1",
        aspect: "aspect-[9/16]",
        key: "new-shirt-1"
    },
    {
        video: "/snarkyazz%20-%20website%20reviews/WEBSITE%20REVIEWS/snarkyazzmugs1.mp4",
        product: "Snarky Mug",
        aspect: "aspect-[9/16]",
        key: "mug-1"
    },
    {
        video: tumblerVideo,
        product: "Snarky Tumbler",
        aspect: "aspect-video",
        key: "old-tumbler"
    },
    {
        video: "/snarkyazz%20-%20website%20reviews/WEBSITE%20REVIEWS/snarkyazzshirt2.mp4",
        product: "Snarky Shirt 2",
        aspect: "aspect-[9/16]",
        key: "new-shirt-2"
    },
    {
        video: "/snarkyazz%20-%20website%20reviews/WEBSITE%20REVIEWS/snarkyazztote1.mp4",
        product: "Snarky Tote",
        aspect: "aspect-[9/16]",
        key: "tote-1"
    },
    {
        video: "/snarkyazz%20-%20website%20reviews/WEBSITE%20REVIEWS/snarkyazzmugs2.mp4",
        product: "More Mugs",
        aspect: "aspect-[9/16]",
        key: "mug-2"
    },
];

function VideoCard({ testimonial }: { testimonial: typeof TESTIMONIALS[0] }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const togglePlay = (e: React.MouseEvent) => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <div className="w-full group select-none">
            {/* Video container */}
            <div
                className={`relative w-full ${testimonial.aspect} rounded-xl overflow-hidden border border-border bg-black cursor-pointer shadow-md`}
                onClick={togglePlay}
            >
                <video
                    ref={videoRef}
                    src={testimonial.video}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    onEnded={() => setIsPlaying(false)}
                />

                {/* Play/pause overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                            <Play className="h-7 w-7 text-primary-foreground ml-1" />
                        </div>
                    </div>
                )}

                {/* Mute toggle */}
                {isPlaying && (
                    <button
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                        onClick={toggleMute}
                    >
                        {isMuted ? (
                            <VolumeX className="h-4 w-4 text-white" />
                        ) : (
                            <Volume2 className="h-4 w-4 text-white" />
                        )}
                    </button>
                )}

                {/* Product badge */}
                <span className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-lg">
                    {testimonial.product}
                </span>
            </div>
        </div>
    );
}

export const UGCTestimonials = () => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };

        api.on("select", onSelect);
        api.on("reInit", onSelect);

        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api]);

    return (
        <section className="py-16 md:py-24 bg-card/50 overflow-hidden">
            <div className="container px-4">
                <div className="text-center mb-12 relative z-10">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-4">
                        REAL HUMANS. <span className="text-primary">REAL SNARK.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        See what our community is saying — unfiltered, unscripted, unapologetically snarky.
                    </p>
                </div>

                <div className="relative w-full max-w-5xl mx-auto px-4 md:px-12">
                    <Carousel
                        setApi={setApi}
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4 items-center">
                            {TESTIMONIALS.map((testimonial) => (
                                <CarouselItem
                                    key={testimonial.key}
                                    className="pl-4 shrink-0 grow-0 basis-[240px] sm:basis-[280px] md:basis-[300px] lg:basis-[320px]"
                                >
                                    <div className="p-1">
                                        <VideoCard testimonial={testimonial} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        
                        {/* Navigation controls */}
                        <CarouselPrevious className="absolute left-2 md:-left-6 lg:-left-12 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background backdrop-blur-sm border-border shadow-lg z-20 h-10 w-10" />
                        <CarouselNext className="absolute right-2 md:-right-6 lg:-right-12 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background backdrop-blur-sm border-border shadow-lg z-20 h-10 w-10" />
                    </Carousel>

                    {/* Pagination indicators */}
                    {count > 1 && (
                        <div className="flex justify-center gap-2 mt-8 z-10">
                            {Array.from({ length: count }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => api?.scrollTo(idx)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        idx === current
                                            ? "bg-primary w-6"
                                            : "bg-muted-foreground/30 hover:bg-muted-foreground/60 w-2.5"
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
