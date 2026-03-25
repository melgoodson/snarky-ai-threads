import { useState, useRef } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import ugcVideo from "@/assets/ugc_440.mp4";

export const HeroUGCVideo = () => {
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

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    return (
        <section className="py-10 md:py-16 bg-background">
            <div className="container px-4">
                <div
                    className="relative max-w-sm mx-auto aspect-[9/16] rounded-2xl overflow-hidden border border-border bg-black cursor-pointer shadow-2xl"
                    onClick={togglePlay}
                >
                    <video
                        ref={videoRef}
                        src={ugcVideo}
                        className="w-full h-full object-contain"
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        onEnded={() => setIsPlaying(false)}
                    />

                    {/* Play overlay */}
                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
                            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                                <Play className="h-9 w-9 text-primary-foreground ml-1" />
                            </div>
                        </div>
                    )}

                    {/* Mute toggle */}
                    {isPlaying && (
                        <button
                            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                            onClick={toggleMute}
                        >
                            {isMuted ? (
                                <VolumeX className="h-5 w-5 text-white" />
                            ) : (
                                <Volume2 className="h-5 w-5 text-white" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};
