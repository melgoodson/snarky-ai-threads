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
    "url": "https://snarkyazzhumans.com",
    "logo": "https://snarkyazzhumans.com/images/snarky-logo.png",
    "sameAs": [
      "https://twitter.com/SnarkyApparel",
      "https://instagram.com/snarkyapparel"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Snarky A$$ Apparel",
    "url": "https://snarkyazzhumans.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://snarkyazzhumans.com/collections?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Snarky A$$ Apparel | Sarcastic Tees, Gag Gifts & Snarky Blankets</title>
        <meta name="description" content="Shop premium sarcastic tees, funny coworker mugs, high-quality gag gifts, and custom photo blankets. Unapologetic humor printed on demand." />
        <link rel="canonical" href="https://www.snarkyazzhumans.com/" />
        <meta property="og:title" content="Snarky A$$ Apparel | Sarcastic Tees, Gag Gifts & Snarky Blankets" />
        <meta property="og:description" content="Shop premium sarcastic tees, funny coworker mugs, high-quality gag gifts, and custom photo blankets." />
        <meta property="og:url" content="https://www.snarkyazzhumans.com/" />
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
              <h2 className="text-3xl font-black mb-4 tracking-tight uppercase">Premium Sarcasm & Unapologetic Gifts</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                We design high-quality <a href="/shirts" className="text-primary hover:underline font-semibold">sarcastic t-shirts</a> and <a href="/collections" className="text-primary hover:underline font-semibold">premium gag gifts</a> for people who refuse to filter themselves. Whether you're shopping for yourself or trying to find the perfect insult for a friend, we print it on demand and ship it directly to your door.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 text-left">
              <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                <h3 className="text-xl font-black mb-3 text-foreground tracking-wide">FUNNY COWORKER MUGS</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Surviving the 9-to-5 requires caffeine and a thick skin. Our <a href="/mugs" className="text-primary hover:underline">snarky office mugs</a> and apparel make the ultimate <a href="/category/funny-coworker-gifts" className="text-primary hover:underline">funny coworker gifts</a>. Say what you're thinking without getting called into HR.</p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                <h3 className="text-xl font-black mb-3 text-foreground tracking-wide">WHITE ELEPHANT WINNERS</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Don't be the person who brings cheap plastic junk to the holiday party. Our <a href="/category/white-elephant-gifts" className="text-primary hover:underline">white elephant gifts</a> under $25 and $50 are items people will actually fight to steal.</p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border shadow-sm md:col-span-2 lg:col-span-1">
                <h3 className="text-xl font-black mb-3 text-foreground tracking-wide">PREMIUM SARCASTIC TEES</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Cheap gag shirts shrink and crack. We print our <a href="/shirts" className="text-primary hover:underline">sarcastic shirts</a> and <a href="/hoodies" className="text-primary hover:underline">snarky hoodies</a> on premium, heavyweight materials using top-tier DTG printing. Comfort meets attitude.</p>
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
