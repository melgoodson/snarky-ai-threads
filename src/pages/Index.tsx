import { Helmet } from "react-helmet-async";
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
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Snarky A$$ Apparel",
    "url": "https://snarkyassthreads.com",
    "logo": "https://snarkyassthreads.com/images/snarky-logo.png",
    "sameAs": [
      "https://twitter.com/SnarkyApparel",
      "https://instagram.com/snarkyapparel"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Snarky A$$ Apparel",
    "url": "https://snarkyassthreads.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://snarkyassthreads.com/collections?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Snarky A$$ Apparel | Funny Graphic Tees & Sarcastic Gifts</title>
        <meta name="description" content="Shop the best collection of funny graphic t-shirts, sarcastic hoodies, gag gifts, and Snarky A$$ apparel. Perfect for coworkers, white elephant gifts, and snarky souls." />
        <link rel="canonical" href="https://snarkyassthreads.com/" />
        <meta property="og:title" content="Snarky A$$ Apparel | Funny Graphic Tees & Sarcastic Gifts" />
        <meta property="og:description" content="Shop the best collection of funny graphic t-shirts, sarcastic hoodies, gag gifts, and Snarky A$$ apparel." />
        <meta property="og:url" content="https://snarkyassthreads.com/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      </Helmet>
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
        
        {/* Commercial Intent SEO Section */}
        <section className="container px-4 py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black mb-4 tracking-tight">Funny Gifts & Sarcastic Apparel</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">Looking for the perfect <a href="/collections" className="text-primary hover:underline font-semibold">gag gifts</a> or <a href="/shirts" className="text-primary hover:underline font-semibold">funny t-shirts</a>? Snarky A$$ Apparel delivers premium, unapologetic designs that speak your mind so you don't have to. Great for birthdays, holidays, or just surviving the work week.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 text-left">
              <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                <h3 className="text-xl font-bold mb-3 text-foreground">Funny Gifts for Coworkers</h3>
                <p className="text-muted-foreground text-sm">Need a subtle way to say "this meeting could have been an email"? Our <a href="/mugs" className="text-primary hover:underline">snarky mugs</a> and <a href="/shirts" className="text-primary hover:underline">sarcastic shirts</a> are the ultimate <a href="/collections" className="text-primary hover:underline">funny gifts for coworkers</a> who share your pain.</p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                <h3 className="text-xl font-bold mb-3 text-foreground">White Elephant Gifts</h3>
                <p className="text-muted-foreground text-sm">Be the hero of the holiday party. Our collection features hilarious <a href="/collections" className="text-primary hover:underline">white elephant gifts</a> under $25 and $50, guaranteed to be the most stolen item in the exchange.</p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border shadow-sm md:col-span-2 lg:col-span-1">
                <h3 className="text-xl font-bold mb-3 text-foreground">Sarcastic Shirts</h3>
                <p className="text-muted-foreground text-sm">We use high-quality DTG printing on premium cotton tees to ensure your snark outlasts countless washes. From classic witty quotes to dark humor, these are the best <a href="/shirts" className="text-primary hover:underline">sarcastic shirts</a> on the internet.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
