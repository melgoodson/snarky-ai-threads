import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
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
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">SHOP</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Best Sellers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Collections
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">SUPPORT</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">LEGAL</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Admin Dashboard
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Snarky A$$ Apparel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
