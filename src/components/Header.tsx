import { Search, Menu, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cart } from "@/components/Cart";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      const { data: roles } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roles);
    } catch (error) {
      console.error("Admin check error:", error);
      setIsAdmin(false);
      setIsLoggedIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Top Banner */}
      <div className="border-b border-border bg-background">
        <div className="container px-4 py-3">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-center">
            <span className="text-primary">SNARKY A$$ HUMANS</span>{" "}
            <span className="text-foreground">PRESENTS SNARKY A$$</span>{" "}
            <span className="text-primary">APPAREL</span>
          </h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="container relative flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="hidden md:block" /> {/* Spacer for desktop */}
        
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link to="/#products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            SHOP
          </Link>
          <Link to="/custom-design" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            CUSTOMIZE
          </Link>
          <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            BLOG
          </Link>
          <Link to="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            ABOUT
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <Shield className="h-4 w-4" />
              ADMIN
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Cart />
          {isLoggedIn ? (
            <Button variant="outline" onClick={() => window.location.href = '/profile'}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          ) : (
            <Button variant="outline" onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
