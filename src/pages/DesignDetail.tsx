import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Design {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

interface Product {
  id: string;
  title: string;
  printify_product_id: string;
  price: number | null;
  images: any;
  variants: any;
}

const DesignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [design, setDesign] = useState<Design | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchDesignAndProducts();
    }
  }, [id]);

  const fetchDesignAndProducts = async () => {
    try {
      // Fetch the design
      const { data: designData, error: designError } = await supabase
        .from("designs")
        .select("*")
        .eq("id", id)
        .single();

      if (designError) throw designError;
      setDesign(designData);

      // Fetch all 5 linked Printify products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .not("printify_product_id", "is", null)
        .order("title");

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load design details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariant || !design) {
      toast.error("Please select a product and variant");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    addItem({
      productId: product.id,
      title: `${design.title} - ${product.title}`,
      price: product.price || 0,
      size: selectedVariant.title || "Default",
      image: design.image_url,
      printifyProductId: product.printify_product_id,
      variantId: selectedVariant.id,
    });

    toast.success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p>Design not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/designs")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Designs
          </Button>

          {/* Design Preview */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={design.image_url}
                alt={design.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold mb-4">{design.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">
                {design.description}
              </p>
              <p className="text-sm text-muted-foreground">
                Choose a product below to print this design on
              </p>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Select a Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all ${
                    selectedProduct === product.id
                      ? "ring-2 ring-primary"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => {
                    setSelectedProduct(product.id);
                    if (product.variants && product.variants.length > 0) {
                      setSelectedVariant(product.variants[0]);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0].src}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">
                            No preview
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">
                      {product.title.replace("– Placeholder Design", "").trim()}
                    </h3>
                    <p className="text-lg font-bold">
                      ${(product.price || 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Variant Selection */}
          {selectedProduct && selectedVariant && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Select Options</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {products
                  .find((p) => p.id === selectedProduct)
                  ?.variants?.map((variant: any) => (
                    <Button
                      key={variant.id}
                      variant={
                        selectedVariant.id === variant.id ? "default" : "outline"
                      }
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.title}
                    </Button>
                  ))}
              </div>
              <Button size="lg" onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DesignDetail;
