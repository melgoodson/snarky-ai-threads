import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";
import rbfChampion from "@/assets/rbf-champion.png";

const PRODUCT_DATA = {
  "rbf-champion": {
    title: "RBF Champion",
    subtitle: "(I'm coming for you bitch)",
    category: "ATTITUDE",
    price: 21.36,
    image: rbfChampion,
    description: `Meet the uniform of the undefeated scowl. Our RBF Champion tee is a heavyweight, snark-approved classic that survives side-eye, small talk, and the spin cycle.

Why you'll love it
Classic, unisex crewneck built on the proven Gildan® 5000 block

Heavyweight 100% cotton (soft, sturdy, not see-through)

Durable details: seamless double-needle collar, double-needle sleeves & hem

Taped neck & shoulders for long-term shape and fewer "why is this twisted?" moments

Clean white canvas that makes the RBF graphic pop`,
    fit: `Relaxed, true-to-size everyday fit (S–5XL)

Size up for extra slouch; check the chart below if you're between sizes`,
    care: `Cold wash with like colours. Tumble dry low or hang dry. Don't iron directly on the print (the RBF does not like heat).

TL;DR

Snarky graphic. Bomb-proof basics. A perfect gift for the RBFer in your life—or for the mirror.`,
    sizeChart: {
      cm: [
        { size: "S", length: "71.1", chest: "45.7" },
        { size: "M", length: "73.7", chest: "50.8" },
        { size: "L", length: "76.2", chest: "55.9" },
        { size: "XL", length: "78.7", chest: "61" },
        { size: "2XL", length: "81.3", chest: "66" },
        { size: "3XL", length: "83.8", chest: "71.1" },
        { size: "4XL", length: "86", chest: "76" },
        { size: "5XL", length: "89", chest: "81" },
      ],
      inches: [
        { size: "S", length: "28", chest: "18" },
        { size: "M", length: "29", chest: "20" },
        { size: "L", length: "30", chest: "22" },
        { size: "XL", length: "31", chest: "24" },
        { size: "2XL", length: "32", chest: "26" },
        { size: "3XL", length: "33", chest: "28" },
        { size: "4XL", length: "33.9", chest: "29.9" },
        { size: "5XL", length: "35", chest: "31.9" },
      ],
    },
  },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCT_DATA[id as keyof typeof PRODUCT_DATA];

  if (!product) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <img
              src={product.image}
              alt={product.title}
              className="w-full rounded-lg border border-border"
            />
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-4xl font-black text-foreground mt-2">
                {product.title}
              </h1>
              <p className="text-2xl font-bold text-foreground mt-1">
                {product.subtitle}
              </p>
              <p className="text-3xl font-black text-foreground mt-4">
                ${product.price.toFixed(2)}
              </p>
            </div>

            <Button size="xl" className="w-full group">
              <ShoppingCart className="mr-2 h-5 w-5" />
              ADD TO CART
            </Button>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="size">Size Chart</TabsTrigger>
                <TabsTrigger value="care">Care</TabsTrigger>
                <TabsTrigger value="tryit">Try It On</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  {product.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-muted-foreground whitespace-pre-line">
                      {para}
                    </p>
                  ))}
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-foreground mb-2">Fit</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {product.fit}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="size" className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-foreground mb-3">Centimeters (garment lay-flat)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-2 text-sm font-semibold">Size</th>
                            <th className="text-left p-2 text-sm font-semibold">Length (A)</th>
                            <th className="text-left p-2 text-sm font-semibold">Half Chest (B)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.sizeChart.cm.map((row) => (
                            <tr key={row.size} className="border-b border-border">
                              <td className="p-2 text-sm">{row.size}</td>
                              <td className="p-2 text-sm">{row.length}</td>
                              <td className="p-2 text-sm">{row.chest}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground mb-3">Inches (garment lay-flat)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-2 text-sm font-semibold">Size</th>
                            <th className="text-left p-2 text-sm font-semibold">Length (A)</th>
                            <th className="text-left p-2 text-sm font-semibold">Half Chest (B)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.sizeChart.inches.map((row) => (
                            <tr key={row.size} className="border-b border-border">
                              <td className="p-2 text-sm">{row.size}</td>
                              <td className="p-2 text-sm">{row.length}</td>
                              <td className="p-2 text-sm">{row.chest}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="care">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {product.care}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="tryit">
                <AIMockupGenerator productImage={product.image} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
