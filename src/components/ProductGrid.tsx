import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import personalizationBlanket from "@/assets/personalization-blanket.png";

interface Design {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

export const ProductGrid = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      console.error("Error fetching designs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="products" className="py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              FEATURED <span className="text-primary">DESIGNS</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Our most popular snarky shirts. Because normal is boring.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 md:py-24">
      <div className="container px-4">
        {/* Featured Personalization Blanket Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">NEW • HIGH DEMAND</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 mt-2">
              PERSONALIZATION <span className="text-primary">BLANKETS</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The #1 personalized gift — upload your photos and create a custom blanket. Perfect for birthdays, holidays, and every "just because" moment.
            </p>
          </div>
          <div 
            className="max-w-md mx-auto cursor-pointer group"
            onClick={() => navigate("/product/personalization-blanket")}
          >
            <div className="relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
              <div className="aspect-square overflow-hidden">
                <img
                  src={personalizationBlanket}
                  alt="Personalization Blanket – Custom Photo Blanket with your pictures"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 text-center">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Personalized Gifts</span>
                <h3 className="font-bold text-xl text-foreground mt-2 group-hover:text-primary transition-colors">
                  Custom Photo Blanket
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Upload your photos • Made to order</p>
                <p className="text-2xl font-black text-foreground mt-2">$49.99</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            FEATURED <span className="text-primary">DESIGNS</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Our most popular snarky shirts. Because normal is boring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {designs.map((design) => (
            <ProductCard
              key={design.id}
              id={design.id}
              title={design.title}
              price={0}
              image={design.image_url}
              category=""
            />
          ))}
        </div>
      </div>
    </section>
  );
};
