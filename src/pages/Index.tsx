import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductShowcase } from "@/components/ProductShowcase";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="bg-primary text-primary-foreground py-3 px-4 text-center">
        <p className="text-sm md:text-base font-medium">
          Snarky customizations not found anywhere else, try CUSTOMIZE in the menu and use the power of AI to craft your own Snarky designs!
        </p>
      </div>
      <main className="flex-1">
        <Hero />
        <ProductShowcase />
        <div id="products">
          <ProductGrid />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
