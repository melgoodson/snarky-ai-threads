import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const COLLECTIONS = [
  { name: "ATTITUDE", count: 1, description: "For those with backbone" },
  { name: "SARCASM", count: 1, description: "Because subtle is overrated" },
  { name: "ALIENS", count: 1, description: "Out of this world humor" },
  { name: "HUMOR", count: 1, description: "Classic funny stuff" },
  { name: "ADULT HUMOR", count: 1, description: "Not for the easily offended" },
  { name: "FATHERS", count: 1, description: "Dad jokes with attitude" },
  { name: "DARK", count: 1, description: "For the bold and brave" },
  { name: "SNARKY HUMANS", count: 1, description: "Our signature collection" },
];

const Collections = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                OUR <span className="text-primary">COLLECTIONS</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Browse our curated categories of snarky greatness
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {COLLECTIONS.map((collection) => (
                <Link key={collection.name} to="/">
                  <Card className="p-8 hover:shadow-lg transition-all cursor-pointer group">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">{collection.description}</p>
                    <p className="text-sm font-medium">{collection.count} Product{collection.count !== 1 ? 's' : ''}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
