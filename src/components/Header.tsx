import { Search, Menu, Shield, User, X, ChevronDown, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cart } from "@/components/Cart";
import { SearchModal } from "@/components/SearchModal";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const SHOP_CATEGORIES = [
  { label: "Shirts", to: "/shirts", emoji: "👕" },
  { label: "Hoodies", to: "/hoodies", emoji: "🧥" },
  { label: "Blankets", to: "/blankets", emoji: "🛏️" },
  { label: "Tote Bags", to: "/tote-bags", emoji: "👜" },
  { label: "Mugs", to: "/mugs", emoji: "☕" },
  { label: "Greeting Cards", to: "/greeting-cards", emoji: "💌" },
  { label: "All Designs", to: "/designs", emoji: "🎨" },
  { label: "Collections", to: "/collections", emoji: "📦" },
];

export const Header = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  const NavLinks = ({ onClose, isMobile = false }: { onClose?: () => void; isMobile?: boolean }) => {
    const [shopOpen, setShopOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click (desktop)
    useEffect(() => {
      if (!shopOpen || isMobile) return;
      const handleClick = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setShopOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [shopOpen, isMobile]);

    return (
      <>
        {/* SHOP dropdown */}
        {isMobile ? (
          <>
            <button
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 w-full text-left"
              onClick={() => setShopOpen(!shopOpen)}
            >
              SHOP
              <ChevronDown className={`h-4 w-4 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
            </button>
            {shopOpen && (
              <div className="pl-4 flex flex-col gap-3">
                {SHOP_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.to}
                    to={cat.to}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    onClick={onClose}
                  >
                    <span>{cat.emoji}</span> {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              onClick={() => setShopOpen(!shopOpen)}
            >
              SHOP
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
            </button>
            {shopOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 z-50">
                <div className="bg-card border border-border rounded-xl shadow-lg py-2">
                  {SHOP_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.to}
                      to={cat.to}
                      className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      onClick={() => setShopOpen(false)}
                    >
                      <span className="mr-2">{cat.emoji}</span>{cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
  };

  return (
    <>
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
                  <NavLinks isMobile={true} />
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
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
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
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};