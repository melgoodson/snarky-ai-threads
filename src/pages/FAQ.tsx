import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseFAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
}

const seoDraftFaqs = [
  // Priority AEO audit questions — always included in FAQPage schema
  {
    q: "How is my photo handled when I upload it for a custom design?",
    a: "We're Snarky, Not Shady. Your photo is used strictly to create your custom design. It is not stored in our databases, sold, or shared with third parties.",
  },
  {
    q: "How long will production and shipping take?",
    a: "All items are printed on demand in US facilities. Production takes 2 to 5 business days, and domestic US shipping takes 3 to 5 business days.",
  },
  {
    q: "What is your return policy for custom apparel?",
    a: "Because items are custom-printed on demand, we provide free replacements for items that arrive damaged, defective, or misprinted. Contact support@snarkyhumans.com for assistance.",
  },
  // Existing SEO draft FAQs
  {
    q: "What is Snarky Humans?",
    a: "Snarky Humans is a print-on-demand service that turns ordinary mugs, t-shirts, and hardcover journals into snarky, conversation-starting merch. We handle design, printing, and shipping so you can focus on selling.",
  },
  {
    q: "How do I upload a photo for custom printing?",
    a: "Simply use our online upload tool on the product page. Drag and drop your image, adjust the placement, and preview the final design before adding to cart.",
  },
  {
    q: "Is my photo stored or shared after upload?",
    a: "We're Snarky, Not Shady. Your photo is not stored, sold, or shared. It is used only for the specific order you place and is deleted from our servers once the print is complete.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major credit cards, PayPal, and Apple Pay. All transactions are processed through a secure, PCI-compliant gateway.",
  },
  {
    q: "Can I cancel or modify my order after it's placed?",
    a: "Once an order is placed, it moves into production. We can't cancel or modify orders after that point. Please double-check your design and quantities before confirming.",
  },
] as const;

const FAQ = () => {
  const [databaseFaqs, setDatabaseFaqs] = useState<DatabaseFAQ[]>([]);

  useEffect(() => {
    fetchDatabaseFaqs();
  }, []);

  const fetchDatabaseFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setDatabaseFaqs((data as DatabaseFAQ[]) || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  // Static FAQ data for backwards compatibility
  const staticFaqData: Record<string, Array<{ q: string; a: string }>> = {
    "Sizing & Fit": [
      {
        q: "How do your sizes run (and do you have up to 4XL)?",
        a: "Our tees run true to size using standard US sizing from S to 4XL. We provide a detailed size chart on each product page with chest width and length measurements."
      },
      {
        q: "What's the best way to pick a size for gifts?",
        a: "Check the recipient's current favorite tee tag or go one size up if unsure. Our relaxed fits are forgiving and most people prefer a slightly looser fit for graphic tees."
      },
      {
        q: "Do you offer heavyweight blanks and relaxed fits?",
        a: "Yes, we use 6.1oz heavyweight cotton blanks with a relaxed unisex fit. This ensures durability and comfort that lasts through countless washes."
      },
      {
        q: "Can I get measurements for specific styles?",
        a: "Every product page includes a size guide with exact chest, length, and sleeve measurements. Use the size chart link near the size selector for detailed specs."
      }
    ],
    "Shipping & Delivery": [
      {
        q: "How long does print-to-order take vs in-stock items?",
        a: "Print-to-order items ship within 3-5 business days, while in-stock designs ship within 24 hours. Product pages clearly indicate which items are ready to ship immediately."
      },
      {
        q: "Do you offer rush shipping for events or bachelor/ette trips?",
        a: "Yes, select expedited shipping at checkout for delivery within 2-3 business days. For group orders of 5+ tees with tight deadlines, contact support for priority processing."
      },
      {
        q: "Do you ship internationally and show duties/taxes upfront?",
        a: "We ship to over 50 countries with duties and taxes calculated at checkout. International orders typically arrive within 7-14 business days depending on customs clearance."
      },
      {
        q: "What carriers do you use for shipping?",
        a: "We primarily use USPS, UPS, and FedEx for domestic shipments. You'll receive tracking information via email within 24 hours of shipment."
      },
      {
        q: "Can I track my order after it ships?",
        a: "Absolutely, you'll receive a tracking number via email as soon as your order ships. Use this to monitor your package's journey in real-time."
      }
    ],
    "Returns & Exchanges": [
      {
        q: "What's your return window, and are exchanges free?",
        a: "You have 30 days from delivery to request a return or exchange. Exchanges for different sizes are free; refunds require return shipping at customer cost."
      },
      {
        q: "Can I exchange a gift without the buyer seeing the receipt?",
        a: "Yes, contact support with your order number and we'll process the exchange discreetly. We never send confirmation emails to the original purchaser for gift exchanges."
      },
      {
        q: "What if my order arrives late for an event?",
        a: "Contact us immediately if your order is delayed for a time-sensitive event. We'll work with you on expedited replacement or rush reprint options when possible."
      },
      {
        q: "Are custom or sale items returnable?",
        a: "Standard designs are fully returnable within 30 days. Custom orders and deeply discounted sale items (50%+ off) are final sale only."
      }
    ],
    "Spicy Meter & Content": [
      {
        q: "What do Mild, Medium, and Nuclear mean?",
        a: "Mild is workplace-adjacent (subtle snark), Medium is party-ready (obvious jokes), Nuclear is adults-only (explicit humor). Each product displays its Spicy Meter rating clearly."
      },
      {
        q: "Where do I find the spicier designs if your ads are PG-13?",
        a: "Use the Spicy Meter filter on our Collections page to view Medium and Nuclear designs. Social media ads showcase Mild designs to comply with platform policies."
      },
      {
        q: "Can I filter out NSFW content?",
        a: "Yes, the Collections page filter lets you select Mild only if you prefer tamer humor. All product thumbnails are safe for work but hover previews may show spicier variants."
      },
      {
        q: "Who decides what's Mild vs Nuclear?",
        a: "Our team rates designs based on explicitness, profanity level, and social appropriateness. When in doubt, we err on the spicier side to set proper expectations."
      },
      {
        q: "Are there designs offensive to specific groups?",
        a: "We avoid punching down—no racism, sexism, homophobia, or ableism. Our humor targets universal human absurdity and celebrates irreverence without cruelty."
      }
    ],
    "Gifting & Bundles": [
      {
        q: "Do you have bundle discounts for groups (5+ tees)?",
        a: "Yes, buy 5+ tees and save 15% automatically at checkout. Perfect for bachelor parties, team gifts, or friend group matching chaos."
      },
      {
        q: "Do you offer gift wrap or 'open last' cards?",
        a: "We include free discrete packaging for all orders. Add a note at checkout if you want a custom gift message included with the shipment."
      },
      {
        q: "What are the most popular gag-gift safe picks?",
        a: "Our Mild and Medium Spicy Meter designs in the Party Instigator collection are bestsellers. Think obvious jokes that get laughs without HR violations."
      },
      {
        q: "Can I create a custom bundle for a group event?",
        a: "For orders of 10+ shirts with mixed designs, contact support for a custom quote. We'll create a shareable order link for easy group checkout."
      }
    ],
    "Materials & Care": [
      {
        q: "What fabric and print methods do you use?",
        a: "We use 100% ring-spun cotton or cotton blends with direct-to-garment (DTG) printing. This produces vibrant colors with soft hand-feel that doesn't crack or peel."
      },
      {
        q: "How should I wash to keep prints sharp?",
        a: "Wash inside-out in cold water and tumble dry low or hang dry. Avoid bleach and ironing directly on the print to maximize design longevity."
      },
      {
        q: "Are your inks and processes eco-considerate?",
        a: "Yes, we use water-based inks and print-on-demand to eliminate overproduction waste. Our blanks are ethically sourced from certified suppliers."
      },
      {
        q: "Do the shirts shrink after washing?",
        a: "Expect 2-3% shrinkage after the first wash when following care instructions. Pre-shrunk cotton blanks minimize this, but some natural settling occurs."
      }
    ],
    "Payments & Security": [
      {
        q: "Which payment methods do you accept (PayPal/cards/wallets)?",
        a: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are encrypted and PCI-DSS compliant."
      },
      {
        q: "Do you support installments, and what are the terms?",
        a: "Yes, orders over $50 qualify for Shop Pay installments (4 interest-free payments). Terms are displayed at checkout with automatic approvals for most customers."
      },
      {
        q: "Is my data secure when I shop with you?",
        a: "Absolutely, we never store payment details and use industry-standard SSL encryption. Payment processing is handled by trusted third-party providers."
      }
    ],
    "Policies & Ethics": [
      {
        q: "How do you handle hate speech or harassment in designs?",
        a: "We have a zero-tolerance policy for hate speech, harassment, or discriminatory content. Designs that cross the line are rejected and removed immediately."
      },
      {
        q: "Do you license pop-culture references or rely on parody?",
        a: "Our designs are original parody and commentary protected under fair use. We avoid direct trademark infringement while celebrating pop-culture absurdity."
      },
      {
        q: "Are your tees appropriate for workplaces or family events?",
        a: "Mild Spicy Meter designs are generally workplace-adjacent. For family events, stick with Mild; for adults-only gatherings, Medium and Nuclear shine."
      }
    ]
  };

  // Group database FAQs by category
  const groupedDbFaqs = databaseFaqs.reduce((acc, faq) => {
    const category = faq.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ q: faq.question, a: faq.answer });
    return acc;
  }, {} as Record<string, Array<{ q: string; a: string }>>);

  // Merge database FAQs at the top, then static FAQs
  const allFaqData = { ...groupedDbFaqs };
  Object.entries(staticFaqData).forEach(([category, questions]) => {
    if (allFaqData[category]) {
      // Append static to database FAQs for same category
      allFaqData[category] = [...allFaqData[category], ...questions];
    } else {
      allFaqData[category] = questions;
    }
  });

  const faqEntities = Object.entries(allFaqData).flatMap(([, questions]) =>
    questions.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": a
      }
    }))
  );

  const seoDraftEntities = seoDraftFaqs.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": a
    }
  }));

  const dedupedEntities = Array.from(
    new Map(
      [...seoDraftEntities, ...faqEntities].map((item) => [
        item.name.trim().toLowerCase(),
        item,
      ])
    ).values()
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": dedupedEntities
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>FAQ &amp; Shipping Info | Snarky Apparel</title>
        <meta name="description" content="Get answers to shipping times, sizing charts, returns, and AI custom apparel creation. Everything you need to know before buying from Snarky." />
        <link rel="canonical" href="https://www.snarkyhumans.com/faq" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      <Header />
      <main className="flex-1">
        <section className="container px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-center">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Everything you need to know about ordering, sizing, shipping, and our Spicy Meter rating system.
            </p>

            <div className="space-y-8">
              {Object.entries(allFaqData).map(([category, questions]) => (
                <div key={category}>
                  <h2 className="text-2xl font-bold mb-4 text-primary">{category}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {questions.map((item, index) => (
                      <AccordionItem key={index} value={`${category}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
