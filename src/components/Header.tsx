import { Search, Menu, Shield, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cart } from "@/components/Cart";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export const Header = () => {
  const navigate = useNavigate();
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

  const NavLinks = ({ onClose }: { onClose?: () => void }) => (
    <>
      <Link 
        to="/#products" 
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClose}
      >
        SHOP
      </Link>
      <Link 
        to="/custom-design" 
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClose}
      >
        CUSTOMIZE
      </Link>
      <Link 
        to="/blog" 
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClose}
      >
        BLOG
      </Link>
      <Link 
        to="/faq" 
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClose}
      >
        FAQ
      </Link>
      <Link 
        to="/about" 
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClose}
      >
        ABOUT
      </Link>
      {isAdmin && (
        <Link 
          to="/admin" 
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          onClick={onClose}
        >
          <Shield className="h-4 w-4" />
          ADMIN
        </Link>
      )}
    </>
  );

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
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-background">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks />
              </nav>
              <div className="mt-8 pt-4 border-t border-border">
                {isLoggedIn ? (
                  <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                ) : (
                  <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Sign In
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Desktop spacer */}
        <div className="hidden md:block w-[100px]" />
        
        {/* Desktop Navigation - centered */}
        <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Cart />
          <div className="hidden md:block">
            {isLoggedIn ? (
              <Button variant="outline" onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};