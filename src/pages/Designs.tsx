import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Design {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

const Designs = () => {
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
        .order("created_at");

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      console.error("Error fetching designs:", error);
      toast.error("Failed to load designs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Shop Designs</h1>
          <p className="text-muted-foreground mb-8">
            Choose from our collection or create your own custom design
          </p>

          {/* Custom Design CTA */}
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Create Your Own Design</h2>
                  <p className="text-muted-foreground">Use AI to generate a unique custom design</p>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate('/custom-design')}
                className="w-full md:w-auto"
              >
                Start Creating
              </Button>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-4">Our Designs</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="aspect-square w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {designs.map((design) => (
                <Card
                  key={design.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/designs/${design.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                      <img
                        src={design.image_url}
                        alt={design.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{design.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {design.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Designs;
