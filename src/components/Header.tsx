import { ShoppingCart, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-black tracking-tighter text-foreground">
            SNARKY A$$ <span className="text-primary">THREADS</span>
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a 
            href="#products" 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            SHOP
          </a>
          <a href="/new-arrivals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            NEW ARRIVALS
          </a>
          <a href="/collections" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            COLLECTIONS
          </a>
          <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            ABOUT
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground font-bold">
              0
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};
