import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
    images: string[];
    alt: string;
    autoPlay?: boolean;
    interval?: number;
}

export const ImageCarousel = ({
    images,
    alt,
    autoPlay = true,
    interval = 5000,
}: ImageCarouselProps) => {
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        if (!autoPlay || images.length <= 1) return;
        const timer = setInterval(next, interval);
        return () => clearInterval(timer);
    }, [autoPlay, interval, next, images.length]);

    if (images.length === 0) return null;
    if (images.length === 1) {
        return (
            <img
                src={images[0]}
                alt={alt}
                className="w-full rounded-lg border border-border"
            />
        );
    }

    return (
        <div className="relative group">
            <div className="overflow-hidden rounded-lg border border-border">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt={`${alt} - view ${i + 1}`}
                            className="w-full flex-shrink-0 object-cover"
                        />
                    ))}
                </div>
            </div>

            {/* Arrows */}
            <Button
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg"
                onClick={prev}
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg"
                onClick={next}
            >
                <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${i === current
                                ? "bg-primary w-6"
                                : "bg-foreground/40 hover:bg-foreground/60"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
