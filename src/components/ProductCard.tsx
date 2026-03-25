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
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
            {badge}
          </span>
        )}

        <Button
          size="icon"
          variant="default"
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-2">
        {category && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {category}
          </span>
        )}
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        {price > 0 && (
          <p className="text-2xl font-black text-foreground">${price.toFixed(2)}</p>
        )}
      </div>
    </Card>
  );
};
