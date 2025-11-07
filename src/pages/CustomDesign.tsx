import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

const productTypes = [
  { id: "tshirt", name: "T-Shirt", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
  { id: "hoodie", name: "Hoodie", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400" },
  { id: "poster", name: "Poster", image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400" },
  { id: "mug", name: "Mug", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400" },
  { id: "greeting-card", name: "Greeting Card", image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400" },
  { id: "framed", name: "Framed Print", image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400" },
];

export default function CustomDesign() {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateDesign = async () => {
    if (!prompt) {
      toast({
        title: "Missing prompt",
        description: "Please describe what you want to create",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: {
          prompt,
          referenceImage,
        },
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedImage(data.image);
        toast({
          title: "Success!",
          description: "Your design has been generated",
        });
      }
    } catch (error: any) {
      console.error("Error generating design:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateProduct = () => {
    if (!generatedImage || !selectedProduct) {
      toast({
        title: "Missing selection",
        description: "Please generate a design and select a product type",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coming soon!",
      description: "Product creation with Teeinblue will be available soon",
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
          Create Your Custom Design
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Design Creation Section */}
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Design Studio</h2>
              
              {/* Reference Image Upload */}
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-foreground">
                  Reference Image (Optional)
                </label>
                {!referenceImage ? (
                  <label className="cursor-pointer block border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={generating}
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Upload reference image
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={referenceImage}
                      alt="Reference"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setReferenceImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Describe Your Design
                </label>
                <Textarea
                  placeholder="E.g., A futuristic cityscape with neon lights, cyberpunk style..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  disabled={generating}
                />
              </div>

              <Button
                onClick={generateDesign}
                disabled={generating}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Design
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Preview Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Preview</h2>
            {generatedImage ? (
              <div className="space-y-4">
                <img
                  src={generatedImage}
                  alt="Generated design"
                  className="w-full rounded-lg border border-border"
                />
                <Button
                  variant="outline"
                  onClick={() => setGeneratedImage(null)}
                  className="w-full"
                >
                  Generate New Design
                </Button>
              </div>
            ) : (
              <div className="h-96 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Your generated design will appear here
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Product Selection */}
        {generatedImage && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Choose Your Product
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {productTypes.map((product) => (
                <div
                  key={product.id}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                    selectedProduct === product.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedProduct(product.id)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <p className="text-sm font-medium text-center text-foreground">
                    {product.name}
                  </p>
                </div>
              ))}
            </div>
            <Button
              onClick={handleCreateProduct}
              disabled={!selectedProduct}
              size="lg"
              className="w-full"
            >
              Create Product
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
