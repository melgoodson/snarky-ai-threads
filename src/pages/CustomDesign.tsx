import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import template1 from "@/assets/template-1.png";
import { Loader2, Upload, Check, Sparkles, Palette } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

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

const PRESET_DESIGNS = [
  {
    id: 1,
    name: "Abstract Art",
    prompt: "Create a vibrant abstract art design with colorful geometric shapes and flowing patterns, perfect for print on demand products. Modern and eye-catching.",
  },
  {
    id: 2,
    name: "Nature Scene",
    prompt: "Create a beautiful nature scene with mountains, forests, and a sunset sky. Serene and peaceful design suitable for apparel and home decor.",
  },
  {
    id: 3,
    name: "Minimalist Typography",
    prompt: "Create a minimalist typography design with inspiring quote and clean modern fonts. Simple, elegant, and timeless.",
  },
  {
    id: 4,
    name: "Retro Vibes",
    prompt: "Create a retro vintage style design with 80s aesthetic, bold colors, and nostalgic elements. Fun and energetic.",
  },
];

export default function CustomDesign() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Design
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatingDesign, setGeneratingDesign] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  
  // Step 2: Product
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Step 3: User Photo
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  
  // Step 4: Final Mockup
  const [generatingMockup, setGeneratingMockup] = useState(false);
  const [finalMockup, setFinalMockup] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep === 2) {
      fetchProducts();
    }
  }, [currentStep]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map((p) => ({
        id: p.id,
        title: p.title,
        printify_product_id: p.printify_product_id,
        brand: p.brand || "",
        model: p.model || "",
        category: p.category || "",
        description: p.description || "",
        images: Array.isArray(p.images) ? p.images.map(String) : [],
        template_image_url: p.template_image_url || "",
        price: Number(p.price) || 0,
        retail_price: Number(p.retail_price) || 0,
      }));

      setProducts(formattedProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
      toast.success("Reference image uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const generateDesign = async () => {
    const prompt = selectedPreset
      ? PRESET_DESIGNS.find((d) => d.id === selectedPreset)?.prompt || customPrompt
      : customPrompt;

    if (!prompt.trim()) {
      toast.error("Please select a preset or enter a custom prompt");
      return;
    }

    setGeneratingDesign(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: {
          prompt: prompt.trim(),
          referenceImage: referenceImage || undefined,
        },
      });

      if (error) throw error;

      if (data?.image) {
        setGeneratedDesign(data.image);
        toast.success("Design generated! Review and approve to continue.");
        // Don't auto-advance to step 2 - let user review and approve first
      } else {
        throw new Error("No design image returned");
      }
    } catch (error: any) {
      console.error("Design generation error:", error);
      toast.error(error.message || "Failed to generate design");
    } finally {
      setGeneratingDesign(false);
    }
  };

  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUserPhoto(event.target?.result as string);
      toast.success("Photo uploaded!");
      setCurrentStep(4);
    };
    reader.readAsDataURL(file);
  };

  const generateFinalMockup = async () => {
    if (!generatedDesign || !selectedProduct || !userPhoto) {
      toast.error("Missing required data for mockup generation");
      return;
    }

    setGeneratingMockup(true);
    try {
      // First, composite the design onto the product
      const { data: productMockupData, error: productError } = await supabase.functions.invoke(
        "generate-user-mockup",
        {
          body: {
            userImage: generatedDesign,
            productImage: selectedProduct.template_image_url,
            productTitle: selectedProduct.title,
          },
        }
      );

      if (productError) throw productError;

      const productWithDesign = productMockupData?.mockupUrl;

      if (!productWithDesign) {
        throw new Error("Failed to generate product mockup");
      }

      // Then, show the product on the user
      const { data: finalData, error: finalError } = await supabase.functions.invoke(
        "generate-mockup",
        {
          body: {
            userImage: userPhoto,
            productImage: productWithDesign,
          },
        }
      );

      if (finalError) throw finalError;

      if (finalData?.image) {
        setFinalMockup(finalData.image);
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
    console.log("Proceed to checkout clicked");
    console.log("Selected Product:", selectedProduct);
    console.log("Generated Design:", generatedDesign);
    console.log("Final Mockup:", finalMockup);
    
    if (!selectedProduct || !generatedDesign || !finalMockup) {
      console.error("Missing required data for checkout");
      toast.error("Please complete all steps before checkout");
      return;
    }

    const productImage = selectedProduct.images && selectedProduct.images.length > 0 
      ? selectedProduct.images[0] 
      : finalMockup;

    const basePrice = Number(selectedProduct.retail_price || selectedProduct.price) || 0;
    
    const customDesignData = {
      productId: selectedProduct.id,
      title: `Custom ${selectedProduct.title}`,
      price: basePrice,
      size: "M",
      image: productImage,
      mockupUrl: finalMockup,
      artworkUrl: generatedDesign,
      printifyProductId: selectedProduct.printify_product_id,
    };
    
    console.log("Storing custom design data:", customDesignData);
    localStorage.setItem("customDesign", JSON.stringify(customDesignData));
    
    addItem({
      productId: selectedProduct.id,
      title: `Custom ${selectedProduct.title}`,
      price: basePrice,
      size: "M", // Default size, can be made configurable
      image: productImage,
      printifyProductId: selectedProduct.printify_product_id,
    });
    
    console.log("Added to cart with price:", basePrice);
    console.log("Navigating to checkout...");
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Progress indicator */}
          <div className="flex justify-center items-center gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 ${
                      currentStep > step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Design Generation */}
          {currentStep === 1 && (
            <section>
              <h2 className="text-3xl font-black text-foreground mb-2">
                Step 1: Create Your Design
              </h2>
              <p className="text-muted-foreground mb-8">
                Choose a preset design or create your own custom artwork
              </p>

              <div className="space-y-8">
                {/* Preset Designs */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Choose a Preset Design</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PRESET_DESIGNS.map((preset) => (
                      <Card
                        key={preset.id}
                        className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                          selectedPreset === preset.id
                            ? "ring-4 ring-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedPreset(preset.id);
                          setCustomPrompt("");
                        }}
                      >
                        <div className="space-y-3">
                          <Palette className="h-8 w-8 text-primary" />
                          <h4 className="font-bold text-lg">{preset.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {preset.prompt.slice(0, 80)}...
                          </p>
                          {selectedPreset === preset.id && (
                            <div className="flex items-center gap-2 text-primary font-semibold">
                              <Check className="h-4 w-4" />
                              Selected
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Custom Design Templates */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Or Choose To Add Your Image To one Of Our Designs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Template 1 - I AM THE BEST */}
                    <Card className="p-4 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                      <div className="space-y-3">
                        <div className="aspect-square bg-white rounded-lg overflow-hidden">
                          <img 
                            src={template1} 
                            alt="I AM THE BEST Template" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h4 className="font-bold text-lg">I AM THE BEST</h4>
                        <p className="text-sm text-muted-foreground">
                          Upload your image and add custom text
                        </p>
                        <Input 
                          placeholder="Your text here"
                          className="text-sm"
                        />
                      </div>
                    </Card>

                    {/* Template 2-4 Placeholders */}
                    {[2, 3, 4].map((templateId) => (
                      <Card
                        key={templateId}
                        className="p-4 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                      >
                        <div className="space-y-3">
                          <div className="aspect-square bg-secondary/50 rounded-lg flex items-center justify-center">
                            <Sparkles className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h4 className="font-bold text-lg">Design Template {templateId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Upload your image to customize this design
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Or Describe Your Custom Design</h3>
                  <Textarea
                    placeholder="Describe the design you want to create..."
                    value={customPrompt}
                    onChange={(e) => {
                      setCustomPrompt(e.target.value);
                      setSelectedPreset(null);
                    }}
                    rows={4}
                    className="max-w-2xl"
                  />
                </div>

                {/* Reference Image Upload */}
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    Add Reference Image (Optional)
                  </h3>
                  <Card className="max-w-2xl p-6">
                    {!referenceImage ? (
                      <label className="flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-secondary/50 transition-colors border-2 border-dashed border-border rounded-lg">
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        <span className="text-lg font-semibold text-foreground mb-2">
                          Upload Reference Image
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Optional: Add an image to guide the AI
                        </span>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleReferenceUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="space-y-4">
                        <img
                          src={referenceImage}
                          alt="Reference"
                          className="w-full rounded-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => setReferenceImage(null)}
                        >
                          Remove Reference
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Generated Design Preview & Approval */}
                {generatedDesign && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Your Generated Design</h3>
                    <Card className="max-w-2xl mx-auto p-6">
                      <div className="space-y-6">
                        <img
                          src={generatedDesign}
                          alt="Generated design"
                          className="w-full rounded-lg border border-border"
                        />
                        <div className="flex gap-4 justify-center">
                          <Button
                            size="lg"
                            onClick={() => setCurrentStep(2)}
                            className="min-w-[200px]"
                          >
                            <Check className="mr-2 h-5 w-5" />
                            Approve & Continue
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => {
                              setGeneratedDesign(null);
                              toast.info("Create a new design");
                            }}
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Generate Button */}
                {!generatedDesign && (
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={generateDesign}
                      disabled={generatingDesign || (!selectedPreset && !customPrompt.trim())}
                      className="min-w-[200px]"
                    >
                      {generatingDesign ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Design...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate Design
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Step 2: Product Selection */}
          {currentStep === 2 && (
            <section>
              <h2 className="text-3xl font-black text-foreground mb-2">
                Step 2: Choose Your Product
              </h2>
              <p className="text-muted-foreground mb-8">
                Select the product you want to print your design on
              </p>

              {generatedDesign && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4">Your Generated Design</h3>
                  <Card className="max-w-md p-4">
                    <img
                      src={generatedDesign}
                      alt="Generated design"
                      className="w-full rounded-lg"
                    />
                  </Card>
                </div>
              )}

              {loadingProducts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden ${
                        selectedProduct?.id === product.id
                          ? "ring-4 ring-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedProduct(product)}
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
              )}

              <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Design
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedProduct}
                  size="lg"
                >
                  Continue to Photo Upload →
                </Button>
              </div>
            </section>
          )}

          {/* Step 3: User Photo Upload */}
          {currentStep === 3 && (
            <section>
              <h2 className="text-3xl font-black text-foreground mb-2">
                Step 3: Upload Your Photo
              </h2>
              <p className="text-muted-foreground mb-8">
                Upload a photo of yourself to see the product on you
              </p>

              <div className="max-w-2xl mx-auto">
                <Card className="p-8">
                  {!userPhoto ? (
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
                        onChange={handleUserPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <img
                        src={userPhoto}
                        alt="Your photo"
                        className="w-full rounded-lg"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUserPhoto(null);
                          setCurrentStep(3);
                        }}
                        className="w-full"
                      >
                        Upload Different Photo
                      </Button>
                    </div>
                  )}
                </Card>

                <div className="flex justify-center gap-4 mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back to Products
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Step 4: Final Mockup */}
          {currentStep === 4 && (
            <section>
              <h2 className="text-3xl font-black text-foreground mb-2">
                Step 4: See Your Design Come to Life
              </h2>
              <p className="text-muted-foreground mb-8">
                Generate a realistic mockup showing the product on you!
              </p>

              <div className="max-w-3xl mx-auto space-y-8">
                {!finalMockup ? (
                  <Card className="p-8">
                    <div className="text-center space-y-6">
                      <p className="text-lg text-foreground">
                        Ready to see how your custom design looks on you?
                      </p>
                      <Button
                        size="lg"
                        onClick={generateFinalMockup}
                        disabled={generatingMockup}
                        className="min-w-[200px]"
                      >
                        {generatingMockup ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating Mockup...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Final Mockup
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8">
                    <img
                      src={finalMockup}
                      alt="Final mockup"
                      className="w-full rounded-lg mb-6"
                    />
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setFinalMockup(null)}
                        className="flex-1"
                      >
                        Regenerate Mockup
                      </Button>
                      <Button onClick={proceedToCheckout} className="flex-1">
                        Proceed to Checkout →
                      </Button>
                    </div>
                  </Card>
                )}

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                  >
                    Back to Photo Upload
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
