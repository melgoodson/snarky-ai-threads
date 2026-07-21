import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  category?: string;
  badge?: string;
}

export const ProductCard = ({ id, title, price, image, category, badge }: ProductCardProps) => {
  const navigate = useNavigate();
  return (
    <Card
      className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] cursor-pointer"
      onClick={() => navigate(`/designs/${id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {badge && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg z-10">
            {badge}
          </span>
        )}

        <Button
          size="icon"
          variant="default"
          className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-y-2 sm:group-hover:translate-y-0 h-8 w-8 sm:h-10 sm:w-10"
        >
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
      <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
        {category && (
          <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider block">
            {category}
          </span>
        )}
        <h3 className="font-bold text-sm sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {title}
        </h3>
        {price > 0 && (
          <p className="text-lg sm:text-2xl font-black text-foreground">${price.toFixed(2)}</p>
        )}
      </div>
    </Card>
  );
};
