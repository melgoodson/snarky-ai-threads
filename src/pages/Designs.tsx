import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sparkles, User } from "lucide-react";
import { toast } from "sonner";

interface Design {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

interface UserDesign {
  id: string;
  image_url: string;
  prompt_text: string;
  created_at: string;
}

const Designs = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [userDesigns, setUserDesigns] = useState<UserDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDesignsLoading, setUserDesignsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDesigns();
    checkAuthAndFetchUserDesigns();
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

  const checkAuthAndFetchUserDesigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoggedIn(false);
        setUserDesignsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data, error } = await supabase
        .from("ai_generated_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserDesigns(data || []);
    } catch (error) {
      console.error("Error fetching user designs:", error);
    } finally {
      setUserDesignsLoading(false);
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


          {/* Your Designs Section */}
          {isLoggedIn && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Your Designs</h2>
              </div>
              
              {userDesignsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <Skeleton className="aspect-square w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userDesigns.length === 0 ? (
                <Card className="p-6 text-center bg-muted/50">
                  <p className="text-muted-foreground mb-2">You haven't created any designs yet</p>
                  <Button variant="outline" onClick={() => navigate('/custom-design')}>
                    Create Your First Design
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {userDesigns.map((design) => (
                    <Card
                      key={design.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow group"
                      onClick={() => navigate('/custom-design', { state: { existingDesign: design } })}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                          <img
                            src={design.image_url}
                            alt={design.prompt_text}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {design.prompt_text}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Our Designs Section */}
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
