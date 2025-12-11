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
import { Loader2, Upload, Check, Sparkles, Palette } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Variant {
  id: number;
  title: string;
  is_enabled: boolean;
  price: number;
  cost: number;
}

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
  variants: Variant[];
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
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  
  // Step 3: User Photo
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  
  // Step 4: Final Mockup
  const [generatingMockup, setGeneratingMockup] = useState(false);
  const [finalMockup, setFinalMockup] = useState<string | null>(null);

  // Known size values in order (exact match)
  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL', '11oz', '15oz'];
  
  // Helper to check if a string is a size
  const isSize = (str: string): boolean => {
    const normalized = str.trim().toUpperCase();
    return SIZE_ORDER.includes(normalized);
  };

  // Helper to get size order index
  const getSizeOrderIndex = (size: string): number => {
    const normalized = size.trim().toUpperCase();
    const index = SIZE_ORDER.indexOf(normalized);
    return index === -1 ? 999 : index;
  };

  // Helper to extract color from variant title (e.g., "White / M" -> "White", "15oz / Black" -> "Black")
  const extractColorFromVariant = (variantTitle: string): string => {
    const parts = variantTitle.split('/').map(p => p.trim());
    if (parts.length === 2) {
      if (isSize(parts[0])) {
        return parts[1];
      }
      if (isSize(parts[1])) {
        return parts[0];
      }
      return parts[0];
    }
    return variantTitle;
  };

  // Helper to extract size from variant title
  const extractSizeFromVariant = (variantTitle: string): string => {
    const parts = variantTitle.split('/').map(p => p.trim());
    if (parts.length === 2) {
      if (isSize(parts[0])) {
        return parts[0];
      }
      if (isSize(parts[1])) {
        return parts[1];
      }
      return parts[1];
    }
    return 'M';
  };

  // Get unique colors from variants
  const getUniqueColors = (variants: Variant[]): string[] => {
    const enabledVariants = variants.filter(v => v.is_enabled);
    const colors = enabledVariants.map(v => extractColorFromVariant(v.title));
    return [...new Set(colors)];
  };

  // Get unique sizes from variants for a given color, sorted by size order
  const getSizesForColor = (variants: Variant[], color: string): Variant[] => {
    return variants
      .filter(v => v.is_enabled && extractColorFromVariant(v.title) === color)
      .sort((a, b) => {
        const sizeA = extractSizeFromVariant(a.title);
        const sizeB = extractSizeFromVariant(b.title);
        return getSizeOrderIndex(sizeA) - getSizeOrderIndex(sizeB);
      });
  };
  const [creatingPrintifyProduct, setCreatingPrintifyProduct] = useState(false);

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
        variants: Array.isArray(p.variants) ? p.variants.map((v: any) => ({
          id: v.id,
          title: v.title || '',
          is_enabled: v.is_enabled || false,
          price: v.price || 0,
          cost: v.cost || 0,
        })) : [],
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
        // Scroll to approval section after a brief delay
        setTimeout(() => {
          const approvalSection = document.getElementById('design-approval');
          if (approvalSection) {
            approvalSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
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

    // Get the selected color from variant, or default
    const selectedColor = selectedVariant 
      ? extractColorFromVariant(selectedVariant.title) 
      : 'White';

    setGeneratingMockup(true);
    try {
      // First, composite the design onto the product with the correct color
      const { data: productMockupData, error: productError } = await supabase.functions.invoke(
        "generate-user-mockup",
        {
          body: {
            userImage: generatedDesign,
            productImage: selectedProduct.template_image_url,
            productTitle: selectedProduct.title,
            productColor: selectedColor, // Pass the selected color
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

  const proceedToCheckout = async () => {
    console.log("Proceed to checkout clicked");
    console.log("Selected Product:", selectedProduct);
    console.log("Selected Variant:", selectedVariant);
    console.log("Generated Design:", generatedDesign);
    console.log("Final Mockup:", finalMockup);
    
    if (!selectedProduct || !generatedDesign) {
      console.error("Missing required data for checkout");
      toast.error("Please complete all steps before checkout");
      return;
    }

    if (!selectedVariant) {
      console.error("No variant selected");
      toast.error("Please select a color and size for your product");
      return;
    }

    // Helper to extract URL string from various formats
    const extractUrl = (value: any): string => {
      if (!value) return '';
      if (typeof value === 'string') {
        if (value.startsWith('data:')) return ''; // Skip data URLs for storage keys
        return value;
      }
      if (typeof value === 'object') {
        return value.src || value.url || value.image_url || '';
      }
      return '';
    };

    setCreatingPrintifyProduct(true);
    toast.info("Creating your custom product in Printify...");

    try {
      // Step 1: Create custom Printify product with the design and selected variant
      const { data: customProductData, error: customProductError } = await supabase.functions.invoke(
        "create-custom-printify-product",
        {
          body: {
            designImageUrl: generatedDesign, // Send the design (can be base64 or URL)
            baseProductId: selectedProduct.id,
            variantId: selectedVariant.id, // Pass the selected variant ID
            customTitle: `Custom ${selectedProduct.title}`,
            productColor: extractColorFromVariant(selectedVariant.title), // Pass color for mockup
          },
        }
      );

      if (customProductError) {
        throw customProductError;
      }

      if (!customProductData?.success || !customProductData?.printifyProductId) {
        throw new Error(customProductData?.error || "Failed to create custom product");
      }

      console.log("Custom Printify product created:", customProductData);
      toast.success("Custom product created successfully!");

      const productImageRaw = selectedProduct.images && selectedProduct.images.length > 0 
        ? selectedProduct.images[0] 
        : finalMockup;
      
      const productImageUrl = extractUrl(productImageRaw);
      const generatedDesignUrl = extractUrl(generatedDesign);
      const finalMockupUrl = extractUrl(finalMockup);

      // Use the Printify mockup image if available, otherwise fall back to our generated mockup
      const displayImage = customProductData.mockupImageUrl || finalMockupUrl || productImageUrl;

      const basePrice = Number(selectedVariant?.price ? selectedVariant.price / 100 : selectedProduct.retail_price || selectedProduct.price) || 0;
      const selectedSize = selectedVariant ? extractSizeFromVariant(selectedVariant.title) : 'M';
      const selectedColor = selectedVariant ? extractColorFromVariant(selectedVariant.title) : 'White';
      
      const customDesignData = {
        productId: selectedProduct.id,
        title: `Custom ${selectedProduct.title} - ${selectedColor}`,
        price: basePrice,
        size: selectedSize,
        color: selectedColor,
        variantId: selectedVariant?.id,
        image: displayImage,
        mockupUrl: customProductData.mockupImageUrl || finalMockupUrl,
        artworkUrl: generatedDesignUrl,
        designImageUrl: customProductData.uploadedImagePreview || generatedDesignUrl,
        // Use the NEW custom Printify product ID for orders
        printifyProductId: customProductData.printifyProductId,
        isCustomProduct: true,
      };
      
      console.log("Storing custom design data:", customDesignData);
      try {
        localStorage.setItem("customDesign", JSON.stringify(customDesignData));
      } catch (e) {
        console.warn('Failed to save customDesign to localStorage:', e);
      }
      
      addItem({
        productId: selectedProduct.id,
        title: `Custom ${selectedProduct.title} - ${selectedColor}`,
        price: basePrice,
        size: selectedSize,
        image: displayImage,
        // Use the NEW custom Printify product ID
        printifyProductId: customProductData.printifyProductId,
        variantId: String(selectedVariant?.id),
        designImageUrl: customProductData.uploadedImagePreview || generatedDesignUrl,
      });
      
      console.log("Added to cart with custom Printify product:", customProductData.printifyProductId);
      navigate("/checkout");
    } catch (error: any) {
      console.error("Error creating custom Printify product:", error);
      toast.error(error.message || "Failed to create custom product. Please try again.");
    } finally {
      setCreatingPrintifyProduct(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* How It Works Guide */}
          <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black text-foreground">Create Your Custom Product</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow these 4 simple steps to bring your unique design to life. Whether you're a beginner or a pro, we'll guide you through the entire process!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 text-sm">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">1</div>
                  <h4 className="font-bold">Create Design</h4>
                  <p className="text-muted-foreground text-xs">Choose preset or describe your own</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold mx-auto">2</div>
                  <h4 className="font-bold">Pick Product</h4>
                  <p className="text-muted-foreground text-xs">Select what to print on</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold mx-auto">3</div>
                  <h4 className="font-bold">Upload Photo</h4>
                  <p className="text-muted-foreground text-xs">See it on yourself</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold mx-auto">4</div>
                  <h4 className="font-bold">Review & Buy</h4>
                  <p className="text-muted-foreground text-xs">Finalize and checkout</p>
                </div>
              </div>
            </div>
          </Card>

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
              <Card className="p-6 mb-8 bg-muted/30 border-primary/20">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  How This Works
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">You have 3 options to create your design:</p>
                  <ul className="space-y-2 list-disc list-inside ml-2">
                    <li><strong className="text-foreground">Use a Preset:</strong> Click any preset below for instant inspiration</li>
                    <li><strong className="text-foreground">Write Your Own:</strong> Describe your custom design idea in detail</li>
                    <li><strong className="text-foreground">Add a Reference (Optional):</strong> Upload an image to guide the AI</li>
                  </ul>
                  <p className="italic">💡 Tip: You can use presets OR custom descriptions, and optionally add a reference image with either option!</p>
                </div>
              </Card>

              <div className="space-y-8">
                {/* Preset Designs */}
                <div>
                  <h3 className="text-xl font-bold mb-2">Option 1: Choose a Preset Design</h3>
                  <p className="text-sm text-muted-foreground mb-4">Click any preset below to use a pre-made design concept</p>
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

                {/* Custom Prompt */}
                <div>
                  <h3 className="text-xl font-bold mb-2">Option 2: Or Describe Your Custom Design</h3>
                  <p className="text-sm text-muted-foreground mb-4">Write a detailed description of what you want to create</p>
                  
                  <Card className="p-6 mb-4 bg-primary/5 border-primary/20 max-w-2xl">
                    <h4 className="font-bold text-sm mb-3">📝 How to Write a Great Prompt (4 Key Elements)</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                      <li><strong className="text-foreground">Subject:</strong> What's the main focus? (person, object, animal, etc.)</li>
                      <li><strong className="text-foreground">Style:</strong> What's the artistic style? (cartoon, realistic, abstract, vintage, etc.)</li>
                      <li><strong className="text-foreground">Colors:</strong> What colors dominate? (vibrant, pastel, monochrome, neon, etc.)</li>
                      <li><strong className="text-foreground">Mood/Details:</strong> What feeling or extra details? (playful, serious, minimalist, detailed, etc.)</li>
                    </ol>
                    <div className="mt-4 p-4 bg-background rounded-lg border border-border">
                      <p className="text-xs font-semibold text-primary mb-1">✨ Example of a Great Prompt:</p>
                      <p className="text-xs italic text-foreground">
                        "A playful cartoon cat wearing sunglasses and a leather jacket, retro 80s style with vibrant neon pink and purple colors, bold outlines, fun and energetic vibe, perfect for a t-shirt design"
                      </p>
                    </div>
                  </Card>

                  <Textarea
                    placeholder="Example: A majestic lion in watercolor style with golden and orange tones, serene and powerful mood..."
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
                  <h3 className="text-xl font-bold mb-2">
                    Option 3: Add Reference Image (Optional)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an image to help guide the AI. This works with presets OR custom descriptions!
                  </p>
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
                  <div id="design-approval" className="mt-8 scroll-mt-20">
                    <h3 className="text-xl font-bold mb-4">Your Generated Design</h3>
                    <Card className="max-w-2xl mx-auto p-6 ring-4 ring-primary/20 shadow-lg">
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
              <Card className="p-6 mb-8 bg-muted/30 border-primary/20 max-w-3xl mx-auto">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  What to Do Now
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your design is ready! Now pick which product you want it printed on. Click any product below to select it, then hit "Continue" to move to the next step.
                </p>
              </Card>

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
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedVariant(null); // Reset variant when product changes
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
              )}

              {/* Variant Selection */}
              {selectedProduct && selectedProduct.variants.filter(v => v.is_enabled).length > 0 && (
                <Card className="max-w-2xl mx-auto mt-8 p-6">
                  <h3 className="text-xl font-bold mb-4">Select Your Color & Size</h3>
                  
                  {/* Color Selection */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Pick Your Color</h4>
                    <div className="flex flex-wrap gap-3">
                      {getUniqueColors(selectedProduct.variants).map((color) => {
                        const isSelected = selectedVariant && extractColorFromVariant(selectedVariant.title) === color;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              // Select first variant with this color
                              const firstVariant = getSizesForColor(selectedProduct.variants, color)[0];
                              if (firstVariant) setSelectedVariant(firstVariant);
                            }}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-semibold"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection (show only when color is selected) */}
                  {selectedVariant && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-3">Pick Your Size</h4>
                      <div className="flex flex-wrap gap-3">
                        {getSizesForColor(selectedProduct.variants, extractColorFromVariant(selectedVariant.title)).map((variant) => {
                          const size = extractSizeFromVariant(variant.title);
                          const isSelected = selectedVariant.id === variant.id;
                          return (
                            <button
                              key={variant.id}
                              onClick={() => setSelectedVariant(variant)}
                              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary font-semibold"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedVariant && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Selected: <span className="font-semibold text-foreground">{selectedVariant.title}</span>
                      </p>
                    </div>
                  )}
                </Card>
              )}

              <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Design
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedProduct || !selectedVariant}
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
              <Card className="p-6 mb-8 bg-muted/30 border-primary/20 max-w-3xl mx-auto">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  See It On You!
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Upload a photo of yourself (or someone else) to generate a realistic mockup showing how your custom product will look when worn or used.
                  </p>
                  <p className="font-semibold text-foreground">
                    💡 Tips for best results:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Use a clear, well-lit photo</li>
                    <li>Face the camera directly</li>
                    <li>Make sure your upper body is visible (for apparel)</li>
                  </ul>
                </div>
              </Card>

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
                Step 4: Review Your Mockup
              </h2>
              <Card className="p-6 mb-8 bg-muted/30 border-primary/20 max-w-3xl mx-auto">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Almost Done!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click "Generate Final Mockup" below to create a realistic preview of your custom product. Once you're happy with how it looks, proceed to checkout to complete your order!
                </p>
              </Card>

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
                      <Button 
                        onClick={proceedToCheckout} 
                        className="flex-1"
                        disabled={creatingPrintifyProduct}
                      >
                        {creatingPrintifyProduct ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Product...
                          </>
                        ) : (
                          "Proceed to Checkout →"
                        )}
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
