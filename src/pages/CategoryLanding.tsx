import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";

const CATEGORY_DATA: Record<string, { title: string; subtitle: string; description: string; metaDesc: string; copyText1: string; copyText2: string; keywords: string; }> = {
  "funny-gifts": {
    title: "Funny Gifts",
    subtitle: "Hilarious gifts for any occasion",
    description: "Shop our collection of funny gifts guaranteed to get a laugh. From snarky mugs to sarcastic t-shirts.",
    metaDesc: "Shop the best funny gifts and sarcastic apparel at Snarky A$$ Apparel. Unique, hilarious gifts for birthdays, holidays, and just because.",
    copyText1: "Finding the perfect gift shouldn't be boring. Our funny gifts are designed to bypass the small talk and deliver pure, unfiltered humor. Whether you're shopping for a friend with a sharp tongue or treating yourself, we've got you covered.",
    copyText2: "Every product is made to order with high-quality printing. Choose from our catalog or design your own funny gift using our AI mockup generator.",
    keywords: "funny gifts, hilarious gifts, best funny gifts online"
  },
  "gag-gifts": {
    title: "Gag Gifts",
    subtitle: "Prank gifts and funny stuff",
    description: "The ultimate destination for gag gifts that toe the line between inappropriate and hilarious.",
    metaDesc: "Find the funniest gag gifts and prank items online. Perfect for white elephant parties, coworkers, and friends with a dark sense of humor.",
    copyText1: "Our gag gifts aren't just cheap plastic toys—they're premium snark printed on high-quality apparel and accessories. Give a gift that will actually be used (and laughed at) long after the party is over.",
    copyText2: "Need something specific? Use our AI customization tools to craft the exact offensive gag gift you've been dreaming of.",
    keywords: "gag gifts, prank gifts, funny gag gifts for adults"
  },
  "white-elephant-gifts": {
    title: "White Elephant Gifts",
    subtitle: "The most stolen gifts at your holiday party",
    description: "Win the office holiday party with these hilarious white elephant gifts.",
    metaDesc: "Shop the best white elephant gifts under $25 and $50. Funny, snarky, and sarcastic presents that everyone will fight over.",
    copyText1: "The secret to winning a white elephant exchange is bringing something everyone desperately wants to steal. Our snarky mugs, customized blankets, and sarcastic tees are proven crowd-pleasers.",
    copyText2: "Browse our top-rated white elephant gifts that won't just end up in the trash next week.",
    keywords: "white elephant gifts, white elephant gifts under 25, funny holiday exchange"
  },
  "funny-coworker-gifts": {
    title: "Funny Gifts for Coworkers",
    subtitle: "Survive the office with snark",
    description: "Office-approved (mostly) sarcastic gifts for your work besties.",
    metaDesc: "Discover funny gifts for coworkers, boss day gifts, and office gag gifts. Snarky mugs and desk accessories to survive the 9-to-5.",
    copyText1: "Let's be honest, half your meetings could have been an email. Help your favorite coworker survive the corporate grind with our snarky mugs and apparel.",
    copyText2: "These funny gifts for coworkers are the perfect way to build office camaraderie without alerting HR.",
    keywords: "funny gifts for coworkers, office gifts, sarcastic coworker mug"
  },
  "funny-gifts-under-25": {
    title: "Funny Gifts Under $25",
    subtitle: "Cheap but hilarious gifts on a budget",
    description: "Premium snark that won't ruin your budget.",
    metaDesc: "Shop funny gag gifts and snarky apparel under $25. Cheap but high-quality humorous presents for any occasion.",
    copyText1: "You don't need to spend a fortune to be the funniest person in the room. Our collection under $25 includes high-quality mugs, greeting cards, and tote bags.",
    copyText2: "Every item is printed on demand with premium materials—proving that cheap gag gifts don't have to look cheap.",
    keywords: "funny gifts under 25, cheap gag gifts, affordable funny presents"
  },
  "funny-gifts-under-50": {
    title: "Funny Gifts Under $50",
    subtitle: "Premium snark without breaking the bank",
    description: "High-quality sarcastic hoodies, blankets, and more under $50.",
    metaDesc: "Find premium funny gifts under $50. Shop high-quality sarcastic hoodies, personalized photo blankets, and snarky apparel.",
    copyText1: "Step up your gifting game. Our under $50 collection features premium hoodies, oversized custom blankets, and heavyweight graphic tees.",
    copyText2: "These make perfect main event gifts for birthdays, anniversaries, or just to show someone you aggressively care about them.",
    keywords: "funny gifts under 50, premium gag gifts, sarcastic hoodies"
  }
};

const CategoryLanding = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  
  const category = categorySlug ? CATEGORY_DATA[categorySlug] : undefined;

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-4xl font-black mb-4">Category Not Found</h1>
          <Button onClick={() => navigate('/collections')}>Browse All Collections</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{category.title} | Snarky A$$ Apparel</title>
        <meta name="description" content={category.metaDesc} />
        <meta name="keywords" content={category.keywords} />
        <link rel="canonical" href={`https://snarkyazzhumans.com/category/${categorySlug}`} />
      </Helmet>
      
      <Header />
      <main className="flex-1">
        {/* Commercial Hero Section */}
        <section className="bg-muted py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 uppercase">
              {category.title}
            </h1>
            <p className="text-xl md:text-2xl text-primary font-bold mb-6">
              {category.subtitle}
            </p>
            <p className="text-lg text-muted-foreground font-medium">
              {category.description}
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="container mx-auto px-4 py-12">
          <ProductGrid />
        </section>

        {/* SEO Text Block at Bottom */}
        <section className="bg-card/50 py-16 px-4 border-t border-border">
          <div className="max-w-4xl mx-auto text-left space-y-6">
            <h2 className="text-2xl font-black mb-4">Why Shop {category.title} with Us?</h2>
            <p className="text-muted-foreground leading-relaxed">
              {category.copyText1}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {category.copyText2}
            </p>
            <div className="pt-8">
              <Button onClick={() => navigate('/collections')} variant="outline">
                Back to All Collections
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryLanding;
