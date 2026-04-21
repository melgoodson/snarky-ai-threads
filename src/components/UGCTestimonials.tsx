import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import tshirtVideo from "@/assets/ads_tshirt_snarkyazz_ugc.mp4";
import tumblerVideo from "@/assets/ads_tumbler_snarkyazz_ugc landscape.mp4";

const TESTIMONIALS = [
    {
        video: tshirtVideo,
        product: "Snarky Tee",
        aspect: "aspect-[9/16]",
        key: "old-tee"
    },
    {
        video: "/snarkyazz - website reviews/WEBSITE REVIEWS/snarkyazzshirt1.mp4",
        product: "Snarky Shirt 1",
        aspect: "aspect-[9/16]",
        key: "new-shirt-1"
    },
    {
        video: "/snarkyazz - website reviews/WEBSITE REVIEWS/snarkyazzmugs1.mp4",
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
        video: "/snarkyazz - website reviews/WEBSITE REVIEWS/snarkyazzshirt2.mp4",
        product: "Snarky Shirt 2",
        aspect: "aspect-[9/16]",
        key: "new-shirt-2"
    },
    {
        video: "/snarkyazz - website reviews/WEBSITE REVIEWS/snarkyazztote1.mp4",
        product: "Snarky Tote",
        aspect: "aspect-[9/16]",
        key: "tote-1"
    },
    {
        video: "/snarkyazz - website reviews/WEBSITE REVIEWS/snarkyazzmugs2.mp4",
        product: "More Mugs",
        aspect: "aspect-[9/16]",
        key: "mug-2"
    },
];

function VideoCard({ testimonial }: { testimonial: typeof TESTIMONIALS[0] }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <div className="flex-shrink-0 w-[300px] md:w-[340px] group select-none">
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
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                            <Play className="h-7 w-7 text-primary-foreground ml-1" />
                        </div>
                    </div>
                )}

                {/* Mute toggle */}
                {isPlaying && (
                    <button
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMute();
                        }}
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
    const [isPaused, setIsPaused] = useState(false);

    return (
        <section className="py-16 md:py-24 bg-card/50 overflow-hidden">
            <div className="container px-4">
                <div className="text-center mb-12 relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                        REAL HUMANS. <span className="text-primary">REAL SNARK.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        See what our community is saying — unfiltered, unscripted, unapologetically snarky.
                    </p>
                </div>
            </div>

            <div 
                className="flex gap-6 ugc-marquee items-center"
                style={{ animationPlayState: isPaused ? "paused" : "running" }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, idx) => (
                    <VideoCard key={`${testimonial.key}-${idx}`} testimonial={testimonial} />
                ))}
            </div>

            <style>{`
                .ugc-marquee {
                    animation: marquee-scroll 50s linear infinite;
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
