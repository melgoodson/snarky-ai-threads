import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Design {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

export const ProductGrid = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

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
