import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  category?: string;
  badge?: string;
  showOnShirt?: boolean;
  priceLabel?: string;
  href?: string;
}

export const ProductCard = ({
  id,
  title,
  price,
  originalPrice,
  image,
  hoverImage,
  category,
  badge,
  showOnShirt = false,
  priceLabel,
  href,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const isPng = image.toLowerCase().endsWith(".png");
  const isDesignHover = hoverImage?.includes("/designs/");
  const targetPath = href || `/designs/${id}`;

  return (
    <Card
      className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_24px_hsl(var(--primary)/0.22)] cursor-pointer flex flex-col"
      onClick={() => navigate(targetPath)}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {showOnShirt ? (
          <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.52] origin-[50%_42%]">
            <img
              src="/images/shirt-mockup.png"
              alt={`${title} T-Shirt`}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-[22%] left-[28%] w-[44%] h-[44%] flex items-center justify-center pointer-events-none">
              <img
                src={image}
                alt={title}
                className="max-w-full max-h-full object-contain"
                style={{
                  mixBlendMode: isPng ? "normal" : "multiply",
                  filter: isPng
                    ? "drop-shadow(0px 1px 2px rgba(0,0,0,0.12))"
                    : "none",
                  opacity: isPng ? 0.96 : 0.92,
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <img
              src={image}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-500 ${
                hoverImage
                  ? "group-hover:opacity-0 group-hover:scale-105"
                  : "group-hover:scale-108"
              }`}
            />
            {hoverImage && (
              <img
                src={hoverImage}
                alt={`${title} alternate view`}
                className={`absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white ${
                  isDesignHover
                    ? "object-contain p-7 pt-10 scale-95 group-hover:scale-100"
                    : "object-cover scale-105 group-hover:scale-100"
                }`}
              />
            )}
          </>
        )}

        {!isDesignHover && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}

        {badge && (
          <span className="absolute top-2.5 left-2.5 bg-primary text-primary-foreground text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md z-10">
            {badge}
          </span>
        )}

        <Button
          size="icon"
          variant="default"
          className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-y-2 sm:group-hover:translate-y-0 h-8 w-8 sm:h-9 sm:w-9 z-10 shadow-md"
        >
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
      <div className="p-2.5 sm:p-3.5 space-y-1 flex-1 flex flex-col justify-between">
        <div>
          {category && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
              {category}
            </span>
          )}
          <h3 className="font-bold text-xs sm:text-sm md:text-[15px] text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {title}
          </h3>
        </div>
        {price > 0 ? (
          <div className="flex items-baseline gap-2 pt-0.5">
            {priceLabel && (
              <span className="text-[11px] font-medium text-muted-foreground">
                {priceLabel}
              </span>
            )}
            <p className="text-sm sm:text-lg font-black text-foreground">
              ${price.toFixed(2)}
            </p>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through font-medium">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        ) : priceLabel ? (
          <p className="text-xs sm:text-sm font-bold text-primary pt-0.5">
            {priceLabel}
          </p>
        ) : null}
      </div>
    </Card>
  );
};
