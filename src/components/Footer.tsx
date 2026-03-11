import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roles);
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tighter">
              SNARKY A$$ <span className="text-primary">APPAREL</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Attitude-packed apparel for people who speak their mind.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/p/Snarky-Humans-61568754866840/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/snarkyhumans/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/SnarkyHumans" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@snarkyhumans" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tiktok">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@snarkyhumans" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">SHOP</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/new-arrivals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/designs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All Designs
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/shirts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Shirts
                </Link>
              </li>
              <li>
                <Link to="/hoodies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link to="/blankets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blankets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">SUPPORT</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">LEGAL</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Snarky A$$ Apparel. All rights reserved.</p>
        </div>
      </div>
    </footer >
  );
};
