import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HeroUGCVideo } from "@/components/HeroUGCVideo";
import { ProductShowcase } from "@/components/ProductShowcase";
import { UGCTestimonials } from "@/components/UGCTestimonials";
import { WebsiteReviews } from "@/components/WebsiteReviews";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { EmailCapture } from "@/components/EmailCapture";

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
        <HeroUGCVideo />
        <ProductShowcase />
        <UGCTestimonials />
        <WebsiteReviews />
        {/* Email capture — placed after social proof, before product grid for max conversion */}
        <EmailCapture variant="homepage" source="homepage_banner" />
        <div id="products">
          <ProductGrid />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
