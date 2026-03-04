import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Star } from "lucide-react";
import tshirtVideo from "@/assets/ads_tshirt_snarkyazz_ugc.mp4";
import tumblerVideo from "@/assets/ads_tumbler_snarkyazz_ugc landscape.mp4";

const TESTIMONIALS = [
    {
        video: tshirtVideo,
        name: "Jake M.",
        location: "Texas",
        quote: "Wore this to a family BBQ. My uncle laughed so hard he dropped his beer. Best purchase I've made all year.",
        product: "Snarky Tee",
        rating: 5,
        aspect: "aspect-[9/16]",
    },
    {
        video: tumblerVideo,
        name: "Sarah K.",
        location: "Florida",
        quote: "The quality is insane for the price. My coworkers keep asking where I got it. I just smile and sip.",
        product: "Snarky Tumbler",
        rating: 5,
        aspect: "aspect-video",
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
        <div className="group">
            {/* Video container */}
            <div
                className={`relative ${testimonial.aspect} max-h-[500px] rounded-xl overflow-hidden border border-border bg-black cursor-pointer`}
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

            {/* Review content */}
            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{testimonial.quote}"
                </p>
                <p className="text-sm font-bold">
                    {testimonial.name} <span className="text-muted-foreground font-normal">• {testimonial.location}</span>
                </p>
            </div>
        </div>
    );
}

export const UGCTestimonials = () => {
    return (
        <section className="py-16 md:py-24 bg-card/50">
            <div className="container px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                        REAL HUMANS. <span className="text-primary">REAL SNARK.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        See what our community is saying — unfiltered, unscripted, unapologetically snarky.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
                    {TESTIMONIALS.map((testimonial) => (
                        <VideoCard key={testimonial.name} testimonial={testimonial} />
                    ))}
                </div>
            </div>
        </section>
    );
};
