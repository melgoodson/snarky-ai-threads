import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Sparkles, Gift, ShoppingBag, Heart, Camera, PartyPopper, Users, Baby, Shirt } from "lucide-react";

// SEO-optimized collection structure — 3 main silos
const SNARKY_COLLECTIONS = [
  { name: "Snarky T-Shirts", slug: "/shirts", emoji: "👕", description: "Bold, sarcastic tees for people who speak their mind", keywords: "snarky t shirts, sarcastic t-shirt, funny quote shirt" },
  { name: "Snarky Mugs", slug: "/mugs", emoji: "☕", description: "Coffee mugs with attitude — perfect office gifts", keywords: "snarky coffee mug, funny mug gift" },
  { name: "Snarky Greeting Cards", slug: "/greeting-cards", emoji: "💌", description: "Funny sarcastic cards for birthdays and holidays", keywords: "snarky birthday cards, funny sarcastic greeting cards" },
  { name: "Snarky Hoodies", slug: "/hoodies", emoji: "🧥", description: "Cozy hoodies with snarky attitude", keywords: "snarky hoodie, sarcastic hoodie" },
  { name: "Snarky Tote Bags", slug: "/tote-bags", emoji: "👜", description: "Carry your attitude everywhere you go", keywords: "snarky tote bag, funny tote" },
  { name: "All Snarky Designs", slug: "/designs", emoji: "🎨", description: "Browse every design — print on any product", keywords: "snarky designs, sarcastic apparel" },
];

const PERSONALIZED_COLLECTIONS = [
  { name: "Personalized Photo Blankets", slug: "/product/personalization-blanket", emoji: "📸", description: "Upload your photos — custom fleece & sherpa blankets", keywords: "personalized blanket, personalized gifts with photo, custom photo blanket" },
  { name: "Gifts for Him", slug: "/designs", emoji: "👨", description: "Personalized gifts for boyfriend, husband, or dad", keywords: "personalized gifts for him, personalized gifts for boyfriend, personalized gifts for men" },
  { name: "Gifts for Her", slug: "/designs", emoji: "👩", description: "Custom gifts for girlfriend, wife, or mom", keywords: "personalized gifts for her, personalized gifts for girlfriend" },
  { name: "Gifts for Mom", slug: "/designs", emoji: "💝", description: "Thoughtful personalized gifts she'll actually love", keywords: "personalized gifts for mom, personalized gifts to mom" },
  { name: "Photo Gifts", slug: "/blankets", emoji: "🖼️", description: "Custom photo blankets, mugs & more", keywords: "personalized gifts with photo, personalized gifts with pictures, personalized gifts using photos" },
  { name: "Christmas Gifts", slug: "/designs", emoji: "🎄", description: "Custom personalized holiday gifts", keywords: "personalized christmas gifts, personalized gifts christmas, personalized gifts xmas" },
];

const SHOP_BY_PRODUCT = [
  { name: "T-Shirts", slug: "/shirts", emoji: "👕", description: "Premium cotton tees with bold DTG prints", keywords: "personalized t shirts, custom t shirt printing for sarcastic designs" },
  { name: "Hoodies", slug: "/hoodies", emoji: "🧥", description: "Cozy pullover and zip-up custom hoodies", keywords: "personalized hoodie, custom hoodie" },
  { name: "Blankets", slug: "/blankets", emoji: "🛏️", description: "Fleece & sherpa blankets with your photos", keywords: "personalization blanket, personalized blanket" },
  { name: "Tote Bags", slug: "/tote-bags", emoji: "👜", description: "Custom canvas tote bags", keywords: "personalized tote bags" },
  { name: "Mugs", slug: "/mugs", emoji: "☕", description: "Ceramic mugs in 11oz and 15oz", keywords: "personalized coffee mug, snarky coffee mug" },
  { name: "Greeting Cards", slug: "/greeting-cards", emoji: "💌", description: "5×7 coated cards for every occasion", keywords: "snarky birthday cards, funny sarcastic greeting cards" },
];

const CollectionSilo = ({
  title,
  subtitle,
  collections,
  accentColor = "primary",
}: {
  title: string;
  subtitle: string;
  collections: typeof SNARKY_COLLECTIONS;
  accentColor?: string;
}) => (
  <div className="mb-16">
    <div className="mb-8">
      <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
        {title}
      </h2>
      <p className="text-muted-foreground text-base font-medium max-w-xl">
        {subtitle}
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.map((collection) => (
        <Link key={collection.name} to={collection.slug}>
          <Card className="p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group h-full">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{collection.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold group-hover:text-primary transition-colors leading-tight">
                  {collection.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {collection.description}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  </div>
);

const Collections = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container px-4">
            {/* Page Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                SHOP BY <span className="text-primary">COLLECTION</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Snarky apparel, personalized photo gifts, and custom products — all made to order and shipped to your door.
              </p>
            </div>

            {/* Silo 1: Snarky Collection */}
            <CollectionSilo
              title="🔥 Snarky Collection"
              subtitle="Bold, sarcastic, and attitude-packed. Our signature snarky gear for people who don't hold back."
              collections={SNARKY_COLLECTIONS}
            />

            {/* Silo 2: Personalized Gifts */}
            <CollectionSilo
              title="🎁 Personalized Gifts"
              subtitle="Custom photo gifts and personalized presents for him, her, mom, and everyone on your list."
              collections={PERSONALIZED_COLLECTIONS}
            />

            {/* Silo 3: Shop by Product */}
            <CollectionSilo
              title="🛍️ Shop by Product"
              subtitle="Browse by product type — shirts, hoodies, blankets, mugs, totes, and greeting cards."
              collections={SHOP_BY_PRODUCT}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
