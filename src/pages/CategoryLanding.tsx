import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { AiCustomGiftCTA } from "@/components/AiCustomGiftCTA";
import { FAQAccordion } from "@/components/FAQAccordion";

interface CategoryInfo {
  title: string;
  subtitle: string;
  description: string;
  metaDesc: string;
  copyText1: string;
  copyText2: string;
  keywords: string;
  faqs?: { question: string; answer: string; }[];
}

const CATEGORY_DATA: Record<string, CategoryInfo> = {
  "funny-gifts": {
    title: "Funny Gifts",
    subtitle: "Hilarious gifts for any occasion",
    description: "Shop our collection of funny gifts guaranteed to get a laugh. From snarky mugs to sarcastic t-shirts.",
    metaDesc: "Shop the best funny gifts and sarcastic apparel at Snarky A$$ Apparel. Unique, hilarious gifts for birthdays, holidays, and just because.",
    copyText1: "Finding the perfect gift shouldn't be boring. Our funny gifts are designed to bypass the small talk and deliver pure, unfiltered humor. Whether you're shopping for a friend with a sharp tongue or treating yourself, we've got you covered.",
    copyText2: "Every product is made to order with high-quality printing. Choose from our catalog or design your own funny gift using our AI mockup generator.",
    keywords: "funny gifts, hilarious gifts, best funny gifts online",
    faqs: [
      { question: "What makes a good funny gift?", answer: "A great funny gift is something relatable, unexpected, and customized to the recipient's sense of humor. Standard novelty gifts are boring, but specific, attitude-driven apparel is memorable." },
      { question: "Do you print these on demand?", answer: "Yes! Every single order is printed fresh just for you. This reduces waste and allows us to customize designs easily." }
    ]
  },
  "gag-gifts": {
    title: "Gag Gifts",
    subtitle: "Prank gifts and funny stuff",
    description: "The ultimate destination for gag gifts that toe the line between inappropriate and hilarious.",
    metaDesc: "Find the funniest gag gifts and prank items online. Perfect for white elephant parties, coworkers, and friends with a dark sense of humor.",
    copyText1: "Our gag gifts aren't just cheap plastic toys—they're premium snark printed on high-quality apparel and accessories. Give a gift that will actually be used (and laughed at) long after the party is over.",
    copyText2: "Need something specific? Use our AI customization tools to craft the exact offensive gag gift you've been dreaming of.",
    keywords: "gag gifts, prank gifts, funny gag gifts for adults",
    faqs: [
      { question: "Are these appropriate for all audiences?", answer: "We calibrate our jokes using the Spicy Meter. Some items are mild and safe for family outings, while others are nuclear and strictly for close friends." }
    ]
  },
  "white-elephant-gifts": {
    title: "White Elephant Gifts",
    subtitle: "The most stolen gifts at your holiday party",
    description: "Win the office holiday party with these hilarious white elephant gifts.",
    metaDesc: "Shop the best white elephant gifts under $25 and $50. Funny, snarky, and sarcastic presents that everyone will fight over.",
    copyText1: "The secret to winning a white elephant exchange is bringing something everyone desperately wants to steal. Our snarky mugs, customized blankets, and sarcastic tees are proven crowd-pleasers.",
    copyText2: "Browse our top-rated white elephant gifts that won't just end up in the trash next week.",
    keywords: "white elephant gifts, white elephant gifts under 25, funny holiday exchange",
    faqs: [
      { question: "What are the best white elephant gifts under $25?", answer: "Sarcastic coffee mugs and lightweight tote bags are the best choices. They are functional, funny, and fit comfortably within standard budget constraints." },
      { question: "Will my order arrive before the holidays?", answer: "For Christmas delivery, we recommend ordering by December 10th. All items ship from our facility within 5-7 business days." }
    ]
  },
  "funny-coworker-gifts": {
    title: "Funny Gifts for Coworkers",
    subtitle: "Survive the office with snark",
    description: "Office-approved (mostly) sarcastic gifts for your work besties.",
    metaDesc: "Discover funny gifts for coworkers, boss day gifts, and office gag gifts. Snarky mugs and desk accessories to survive the 9-to-5.",
    copyText1: "Let's be honest, half your meetings could have been an email. Help your favorite coworker survive the corporate grind with our snarky mugs and apparel.",
    copyText2: "These funny gifts for coworkers are the perfect way to build office camaraderie without alerting HR.",
    keywords: "funny gifts for coworkers, office gifts, sarcastic coworker mug",
    faqs: [
      { question: "Are these coworker gifts appropriate for the office?", answer: "Yes. Most designs are passive-aggressive rather than offensive. They reference common office situations (like meetings that should have been emails) which resonate with anyone in a 9-to-5." },
      { question: "What is the best farewell or going-away gift for a work bestie?", answer: "A custom mug or t-shirt roasting their time at the company or celebrating their 'escape' is a memorable and hilarious send-off." }
    ]
  },
  "sarcastic-coworker-gifts": {
    title: "Sarcastic Coworker Gifts",
    subtitle: "Say what you're thinking (without HR getting involved)",
    description: "Funny and sarcastic coworker gifts. Mugs, shirts, and office essentials to survive the daily grind.",
    metaDesc: "Shop unique sarcastic coworker gifts. Sarcastic office shirts, funny colleague mugs, and hilarious farewell gifts for your work friends.",
    copyText1: "Make the corporate grind tolerable. Our sarcastic coworker gifts are perfect for secret Santa, office promotions, retirement, or farewell parties.",
    copyText2: "Each item features high-quality prints that show you understand their daily struggles.",
    keywords: "sarcastic coworker gifts, funny coworker gifts, office humor, colleague farewell gift",
    faqs: [
      { question: "Can I send it directly to my coworker?", answer: "Yes! Simply put their office or home address as the shipping destination. We do not include pricing info on the packing slips." }
    ]
  },
  "funny-teacher-shirts": {
    title: "Funny Teacher Shirts & Gifts",
    subtitle: "Attitude-packed apparel for the classroom",
    description: "Humorous and sarcastic shirts for teachers. Built to survive grading, parent-teacher conferences, and lesson plans.",
    metaDesc: "Shop the best funny teacher shirts and sarcastic gifts for educators. High-quality graphic tees perfect for casual Fridays and teacher appreciation.",
    copyText1: "Teaching is hard work, and sometimes a sense of humor is the only way to get through grading papers. Our funny teacher shirts feature clever wordplay, coffee appreciation, and gentle classroom sarcasm.",
    copyText2: "Printed on premium cotton blanks using high-density DTG, these tees are soft enough for all-day comfort and durable enough for the wash cycle.",
    keywords: "funny teacher shirts, teacher appreciation gifts, sarcastic teacher tee, educator gag gifts",
    faqs: [
      { question: "Are these shirts school-appropriate?", answer: "Yes, our teacher collection ranges from mild, clever wordplay to gentle classroom humor. They are designed to be funny without violating dress codes." },
      { question: "How do I choose the correct size for a teacher?", answer: "Our shirts are classic, standard unisex cuts. Check the size chart on the product page for detailed lay-flat chest measurements. If they prefer an oversized look, we recommend sizing up one size." }
    ]
  },
  "snarky-mom-gifts": {
    title: "Snarky Mom Gifts",
    subtitle: "Gifts for the mom who has earned her attitude",
    description: "Sarcastic shirts, custom mugs, and hilarious gifts for moms, mother figures, and grandmas who tell it like it is.",
    metaDesc: "Shop funny and snarky mom gifts. Sarcastic mom shirts, personalized coffee mugs, and hilarious Mother's Day ideas that will get a real laugh.",
    copyText1: "Ditch the boring flowers and basic candles. Celebrate mom life with gifts that actually reflect her personality—caffeine-fueled, chaotic, and wonderfully sarcastic.",
    copyText2: "Whether you are celebrating Mother's Day, her birthday, or just sending a reminder of who her favorite child is, we have the perfect custom print product.",
    keywords: "snarky mom gifts, custom mothers day gifts, funny gifts for mom, sarcastic mom shirt",
    faqs: [
      { question: "What are some unique personalized gifts for moms who have everything?", answer: "Ditch the generic flowers and candles. A sarcastic 'mom life' shirt or a custom mug roasting her favorite (or least favorite) child is guaranteed to get a real laugh and be used daily." },
      { question: "Can I customize the text on these gifts?", answer: "Yes! Use our AI Custom Gift tool in the menu to describe the exact quote, joke, or design you want, and generate a customized item instantly." }
    ]
  },
  "sarcastic-christmas-gifts": {
    title: "Sarcastic Christmas Gifts",
    subtitle: "Unapologetic holiday gear and funny stocking stuffers",
    description: "The #1 destination for holiday gag gifts, funny Secret Santa swaps, and sarcastic stocking stuffers under $25.",
    metaDesc: "Shop sarcastic Christmas gifts and funny holiday gag gifts. Find the perfect Secret Santa, White Elephant, and stocking stuffers for adults.",
    copyText1: "Don't be the person who brings a generic gift card. Bring the item everyone fights to steal at the White Elephant exchange. Our sarcastic Christmas collection features holiday-themed snark.",
    copyText2: "Every item is printed with premium materials and ships quickly to ensure it lands under the tree on time.",
    keywords: "sarcastic christmas gifts, funny holiday gifts, secret santa ideas, white elephant gifts under 25",
    faqs: [
      { question: "What are the best funny gifts for Secret Santa and White Elephant?", answer: "Mugs and shirts with dry, sarcastic quotes under $25 are always the most highly contested items in holiday gift swaps. They are universally funny and useful." },
      { question: "What is the holiday order deadline?", answer: "For delivery by Christmas Eve, we recommend ordering by December 10th to account for high seasonal shipping volumes." }
    ]
  },
  "funny-gifts-under-25": {
    title: "Funny Gifts Under $25",
    subtitle: "Cheap but hilarious gifts on a budget",
    description: "Premium snark that won't ruin your budget.",
    metaDesc: "Shop funny gag gifts and snarky apparel under $25. Cheap but high-quality humorous presents for any occasion.",
    copyText1: "You don't need to spend a fortune to be the funniest person in the room. Our collection under $25 includes high-quality mugs, greeting cards, and tote bags.",
    copyText2: "Every item is printed on demand with premium materials—proving that cheap gag gifts don't have to look cheap.",
    keywords: "funny gifts under 25, cheap gag gifts, affordable funny presents",
    faqs: [
      { question: "What's the best item under $25?", answer: "Our 11oz ceramic mugs and eco-friendly tote bags are top choices under $25. They have high-density prints that last." }
    ]
  },
  "funny-gifts-under-50": {
    title: "Funny Gifts Under $50",
    subtitle: "Premium snark without breaking the bank",
    description: "High-quality sarcastic hoodies, blankets, and more under $50.",
    metaDesc: "Find premium funny gifts under $50. Shop high-quality sarcastic hoodies, personalized photo blankets, and snarky apparel.",
    copyText1: "Step up your gifting game. Our under $50 collection features premium hoodies, oversized custom blankets, and heavyweight graphic tees.",
    copyText2: "These make perfect main event gifts for birthdays, anniversaries, or just to show someone you aggressively care about them.",
    keywords: "funny gifts under 50, premium gag gifts, sarcastic hoodies",
    faqs: [
      { question: "What premium items can I get for under $50?", answer: "Our Gildan heavyweight custom hoodies and customized apparel are available under $50, offering premium comfort and bold statements." }
    ]
  },
  "custom-gifts-for-men": {
    title: "Custom Gifts For Men",
    subtitle: "Funny & personalized gifts for guys who want nothing",
    description: "Shop unique, snarky, and custom gifts for men, dads, husbands, and boyfriends.",
    metaDesc: "Struggling to find custom gifts for men? Shop personalized funny gifts, sarcastic shirts, and premium mugs for the guys in your life.",
    copyText1: "Men are famously impossible to shop for. Instead of getting him another boring tie or expensive tech gadget he won't use, get him something that actually matches his personality.",
    copyText2: "Our custom snarky t-shirts and personalized mugs are the perfect custom gifts for men with a chaotic sense of humor.",
    keywords: "custom gifts for men, personalized gifts for guys, funny gifts for dad",
    faqs: [
      { question: "What's a good gift for a guy who says he wants nothing?", answer: "A custom shirt roasting a favorite inside joke or a design celebrating his unique hobby is much better than another generic wallet or belt." }
    ]
  },
  "custom-mothers-day-gifts": {
    title: "Custom Mother's Day Gifts",
    subtitle: "Because she deserves more than a generic card",
    description: "Personalized Mother's Day gifts for moms with a sense of humor and a lot of patience.",
    metaDesc: "Shop custom Mother's Day gifts that are actually funny. Ditch the boring flowers for personalized photo blankets, snarky mom shirts, and custom mugs.",
    copyText1: "Being a mom requires surviving on caffeine, chaos, and a sharp sense of humor. Celebrate her survival skills with our premium custom Mother's Day gifts.",
    copyText2: "From personalized photo blankets featuring her favorite (or least favorite) children, to sarcastic coffee mugs, we have exactly what she wants.",
    keywords: "custom mothers day gifts, funny gifts for mom, personalized mom blanket",
    faqs: [
      { question: "What is the best custom gift for Mother's Day?", answer: "Our snarky custom mugs or customized family photo blankets are absolute hits for moms who appreciate humor." }
    ]
  },
  "personalized-blanket-gifts": {
    title: "Personalized Blanket Gifts",
    subtitle: "Warm, cozy, and completely custom",
    description: "Design your own custom photo blankets and personalized fleece throws.",
    metaDesc: "Create the ultimate personalized blanket gifts. Custom photo blankets printed edge-to-edge on premium sherpa and fleece. Easy to design online.",
    copyText1: "Nothing says 'I put effort into this' quite like a personalized blanket gift. Whether you're plastering an embarrassing photo of your best friend across 60 inches of fleece, or making a heartfelt pet memorial throw.",
    copyText2: "Our custom blankets use premium sublimation printing so the colors stay vibrant wash after wash.",
    keywords: "personalized blanket gifts, custom photo blankets, custom throw blanket",
    faqs: [
      { question: "What sizes are available for custom blankets?", answer: "We offer classic throw size (50\"x60\") and full size (60\"x80\"). They feature premium fleece fronts and soft sherpa backing." }
    ]
  }
};

const AI_CTA_LOCATIONS: Record<string, string> = {
  "funny-gifts": "funny_gifts_category",
  "gag-gifts": "gag_gifts_category",
  "funny-gifts-under-25": "gifts_under_25_category",
};

const CategoryLanding = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  
  const category = categorySlug ? CATEGORY_DATA[categorySlug] : undefined;
  const aiCtaLocation = categorySlug ? AI_CTA_LOCATIONS[categorySlug] : undefined;

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

        {aiCtaLocation && (
          <AiCustomGiftCTA location={aiCtaLocation} variant="compact" />
        )}

        {/* Product Grid */}
        <section className="container mx-auto px-4 py-12">
          <ProductGrid categorySlug={categorySlug} />
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

            {category.faqs && category.faqs.length > 0 && (
              <div className="pt-10 border-t border-border mt-10">
                <h3 className="text-2xl font-black mb-6 uppercase">Frequently Asked Questions</h3>
                <FAQAccordion items={category.faqs} />
              </div>
            )}

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
