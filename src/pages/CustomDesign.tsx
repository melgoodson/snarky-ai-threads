import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";

const productTypes = [
  { id: "tshirt", name: "T-Shirt", image: "/placeholder.svg" },
  { id: "hoodie", name: "Hoodie", image: "/placeholder.svg" },
  { id: "mug", name: "Mug", image: "/placeholder.svg" },
  { id: "card", name: "Greeting Card", image: "/placeholder.svg" },
  { id: "tote", name: "Tote Bag", image: "/placeholder.svg" },
];

export default function CustomDesign() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [generatingMockup, setGeneratingMockup] = useState(false);
  const [mockupImage, setMockupImage] = useState<string | null>(null);

  const generateArtwork = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your design");
      return;
    }

    setGenerating(true);
    const images: string[] = [];

    try {
      for (let i = 0; i < 3; i++) {
        const { data, error } = await supabase.functions.invoke("generate-design", {
          body: { prompt: prompt.trim(), referenceImage: null },
        });

        if (error) throw error;
        if (data?.image) {
          images.push(data.image);
        }
      }

      setGeneratedImages(images);
      toast.success("Artwork generated!");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to generate artwork");
    } finally {
      setGenerating(false);
    }
  };

  const selectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setMockupImage(null);
  };

  const generateMockup = async () => {
    if (!selectedImage || !selectedProduct) {
      toast.error("Please select both an image and a product");
      return;
    }

    setGeneratingMockup(true);
    try {
      // Validate artwork quality first
      const { data: qualityData, error: qualityError } = await supabase.functions.invoke(
        "validate-artwork-quality",
        {
          body: {
            imageUrl: selectedImage,
            productType: selectedProduct,
          },
        }
      );

      if (qualityError) {
        console.error("Quality check error:", qualityError);
        toast.error("Failed to validate artwork quality");
        setGeneratingMockup(false);
        return;
      }

      if (!qualityData.passes) {
        toast.error(
          `⚠️ Quality Warning: ${qualityData.warnings.join(". ")}. Image is ${qualityData.width}x${qualityData.height}px (${qualityData.actualDPI} DPI), but needs ${qualityData.requiredWidth}x${qualityData.requiredHeight}px (${qualityData.requiredDPI} DPI) for best print quality.`,
          { duration: 8000 }
        );
      } else {
        toast.success(
          `✓ Quality Check Passed: ${qualityData.width}x${qualityData.height}px (${qualityData.actualDPI} DPI)`,
          { duration: 3000 }
        );
      }

      const productTemplate = productTypes.find((p) => p.id === selectedProduct);
      
      const { data, error } = await supabase.functions.invoke("generate-mockup", {
        body: { userImage: selectedImage, productImage: productTemplate?.image },
      });

      if (error) throw error;
      if (data?.image) {
        setMockupImage(data.image);
        toast.success("Mockup generated!");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to generate mockup");
    } finally {
      setGeneratingMockup(false);
    }
  };

  const proceedToCheckout = () => {
    if (!mockupImage || !selectedImage || !selectedProduct) {
      toast.error("Please complete all steps before checkout");
      return;
    }
    
    localStorage.setItem("customDesign", JSON.stringify({
      artworkUrl: selectedImage,
      mockupUrl: mockupImage,
      productType: selectedProduct,
    }));
    
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Create Your Custom Design</h1>
            <p className="text-muted-foreground text-lg">Describe your vision and let AI bring it to life</p>
          </div>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Step 1: Generate Your Artwork</h2>
            </div>
            <Textarea
              placeholder="Describe your design... (e.g., 'A majestic lion with cosmic background')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-24"
              disabled={generating}
            />
            <Button onClick={generateArtwork} disabled={generating || !prompt.trim()} className="w-full" size="lg">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating 3 designs...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Designs
                </>
              )}
            </Button>

            {generatedImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {generatedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? "border-primary shadow-lg scale-105" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => selectImage(img)}
                  >
                    <img src={img} alt={`Design ${idx + 1}`} className="w-full aspect-[9/16] object-cover" />
                    {selectedImage === img && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium">
                        Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {selectedImage && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold">Step 2: Choose Your Product</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {productTypes.map((product) => (
                  <div
                    key={product.id}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all text-center ${
                      selectedProduct === product.id ? "border-primary shadow-lg scale-105" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedProduct(product.id)}
                  >
                    <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                      <span className="text-4xl">
                        {product.id === "tshirt" && "👕"}
                        {product.id === "hoodie" && "🧥"}
                        {product.id === "mug" && "☕"}
                        {product.id === "card" && "💌"}
                        {product.id === "tote" && "👜"}
                      </span>
                    </div>
                    <p className="font-medium">{product.name}</p>
                  </div>
                ))}
              </div>
              
              {selectedProduct && (
                <Button onClick={generateMockup} disabled={generatingMockup} className="w-full" size="lg">
                  {generatingMockup ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Mockup...
                    </>
                  ) : (
                    "Generate Mockup"
                  )}
                </Button>
              )}
            </Card>
          )}

          {mockupImage && (
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">Step 3: Preview & Order</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <img src={mockupImage} alt="Product mockup" className="w-full rounded-lg shadow-lg" />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-semibold">Your Custom Design</h3>
                  <p className="text-muted-foreground">
                    Product: {productTypes.find((p) => p.id === selectedProduct)?.name}
                  </p>
                  <div className="space-y-2">
                    <Button onClick={generateMockup} variant="outline" className="w-full">
                      Regenerate Mockup
                    </Button>
                    <Button onClick={proceedToCheckout} className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
