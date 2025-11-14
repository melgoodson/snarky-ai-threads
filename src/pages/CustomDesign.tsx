import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Check, Sparkles } from "lucide-react";

interface Product {
  id: string;
  title: string;
  printify_product_id: string;
  brand: string;
  model: string;
  category: string;
  description: string;
  images: string[];
  template_image_url: string;
  price: number;
  retail_price: number;
}

export default function CustomDesign() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingMockup, setGeneratingMockup] = useState(false);
  const [mockupImage, setMockupImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map((p) => {
        const imagesArray = Array.isArray(p.images) 
          ? p.images.map(img => typeof img === 'string' ? img : String(img))
          : [];
        
        return {
          id: p.id,
          title: p.title,
          printify_product_id: p.printify_product_id,
          brand: p.brand || "",
          model: p.model || "",
          category: p.category || "",
          description: p.description || "",
          images: imagesArray,
          template_image_url: p.template_image_url || "",
          price: Number(p.price) || 0,
          retail_price: Number(p.retail_price) || 0,
        };
      });

      setProducts(formattedProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUserImage(base64);
        setMockupImage(null);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const generateMockup = async () => {
    if (!selectedProduct || !userImage) {
      toast.error("Please select a product and upload your image");
      return;
    }

    setGeneratingMockup(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-user-mockup", {
        body: {
          userImage,
          productImage: selectedProduct.template_image_url,
          productTitle: selectedProduct.title,
        },
      });

      if (error) throw error;

      if (data?.mockupUrl) {
        setMockupImage(data.mockupUrl);
        toast.success("Mockup generated! See how it looks on you!");
      } else {
        throw new Error("No mockup image returned");
      }
    } catch (error: any) {
      console.error("Mockup generation error:", error);
      toast.error(error.message || "Failed to generate mockup");
    } finally {
      setGeneratingMockup(false);
    }
  };

  const proceedToCheckout = () => {
    if (!selectedProduct || !mockupImage) {
      toast.error("Please complete all steps before checkout");
      return;
    }

    localStorage.setItem(
      "customDesign",
      JSON.stringify({
        productId: selectedProduct.id,
        mockupUrl: mockupImage,
        artworkUrl: userImage,
      })
    );

    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Step 1: Select Product */}
          <section>
            <h2 className="text-3xl font-black text-foreground mb-2">
              Step 1: Choose Your Product
            </h2>
            <p className="text-muted-foreground mb-8">
              Select the product you'd like to personalize
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden ${
                    selectedProduct?.id === product.id
                      ? "ring-4 ring-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => {
                    setSelectedProduct(product);
                    setMockupImage(null);
                  }}
                >
                  <div className="relative aspect-square bg-secondary">
                    <img
                      src={product.template_image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedProduct?.id === product.id && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-2">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-lg text-foreground line-clamp-2">
                      {product.title}
                    </h3>
                    {product.brand && (
                      <p className="text-sm text-muted-foreground">
                        {product.brand} {product.model && `• ${product.model}`}
                      </p>
                    )}
                    <p className="text-2xl font-black text-foreground">
                      ${product.retail_price.toFixed(2)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Step 2: Upload Image */}
          {selectedProduct && (
            <section className="border-t border-border pt-12">
              <h2 className="text-3xl font-black text-foreground mb-2">
                Step 2: Upload Your Photo
              </h2>
              <p className="text-muted-foreground mb-8">
                Upload a photo to see how the product looks on you or with you
              </p>

              <div className="max-w-2xl mx-auto">
                <Card className="p-8">
                  {!userImage ? (
                    <label className="flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:bg-secondary/50 transition-colors border-2 border-dashed border-border rounded-lg">
                      <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                      <span className="text-lg font-semibold text-foreground mb-2">
                        Click to upload your photo
                      </span>
                      <span className="text-sm text-muted-foreground">
                        PNG, JPG up to 10MB
                      </span>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <img
                        src={userImage}
                        alt="Your uploaded image"
                        className="w-full rounded-lg"
                      />
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setUserImage(null);
                            setMockupImage(null);
                          }}
                          className="flex-1"
                        >
                          Upload Different Photo
                        </Button>
                        <Button
                          onClick={generateMockup}
                          disabled={generatingMockup}
                          className="flex-1"
                        >
                          {generatingMockup ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Mockup
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </section>
          )}

          {/* Step 3: Preview Mockup */}
          {mockupImage && (
            <section className="border-t border-border pt-12">
              <h2 className="text-3xl font-black text-foreground mb-2">
                Step 3: Preview Your Design
              </h2>
              <p className="text-muted-foreground mb-8">
                Here's how your personalized product looks!
              </p>

              <div className="max-w-3xl mx-auto">
                <Card className="p-8">
                  <img
                    src={mockupImage}
                    alt="Product mockup"
                    className="w-full rounded-lg mb-6"
                  />
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setMockupImage(null)}
                      className="flex-1"
                    >
                      Try Different Image
                    </Button>
                    <Button onClick={proceedToCheckout} className="flex-1">
                      Proceed to Checkout →
                    </Button>
                  </div>
                </Card>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
