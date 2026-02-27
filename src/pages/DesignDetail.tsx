import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Tag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { resolveDesignImage } from "@/lib/resolveDesignImage";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";

// Color name → hex mapping for visual swatches
const COLOR_HEX_MAP: Record<string, string> = {
  "Black": "#000000",
  "White": "#FFFFFF",
  "Navy": "#1B1F3B",
  "Red": "#C0392B",
  "Royal Blue": "#2E5EAA",
  "Sport Grey": "#9B9B9B",
  "Dark Heather": "#4A4A4A",
  "Military Green": "#4B5320",
  "Maroon": "#6B1C23",
  "Forest Green": "#2D572C",
  "Sand": "#C2B280",
  "Light Blue": "#ADD8E6",
  "Charcoal": "#36454F",
  "Natural": "#F5F5DC",
  "Irish Green": "#009A44",
  "Orange": "#FF6B35",
  "Purple": "#6B3FA0",
  "Light Pink": "#FFB6C1",
  "Daisy": "#F8D568",
  "Ash": "#B2BEB5",
  "Gold": "#FFD700",
  "Safety Green": "#78FF00",
  "Antique Cherry Red": "#9B111E",
  "Coral Silk": "#FF7F7F",
  "Ice Grey": "#D6D6D6",
  "Sapphire": "#0F52BA",
  "Berry": "#8E4585",
  "Heather Grey": "#B0B0B0",
  "Carolina Blue": "#56A0D3",
  "Indigo Blue": "#3F51B5",
  "Violet": "#7F00FF",
  "Tropical Blue": "#00CED1",
  "Mint Green": "#98FB98",
  "Sunset": "#FAD6A5",
};

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
  retail_price: number | null;
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

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
    if (!selectedProduct || !design) {
      toast.error("Please select a product");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const options = getAvailableOptions(product.variants || []);
    const hasOptions = options.sizes.length > 0 || options.colors.length > 0;

    if (hasOptions && (!selectedSize || !selectedColor || !selectedVariant)) {
      toast.error("Please select size and color");
      return;
    }

    const retailPrice = product.retail_price || 0;

    addItem({
      productId: product.id,
      title: `${design.title} - ${product.title}`,
      price: retailPrice,
      size: selectedVariant?.title || "Default",
      image: resolveDesignImage(design.image_url),
      printifyProductId: product.printify_product_id,
      variantId: selectedVariant?.id || 0,
      designImageUrl: resolveDesignImage(design.image_url),
    });

    toast.success("Added to cart!");
  };

  // Get a display-friendly retail price + original price (with $20 markup)
  const getDisplayPrice = (product: Product) => {
    const retail = product.retail_price || 0;
    return { price: retail, originalPrice: retail + 20 };
  };

  // Parse variants to extract sizes and colors
  const getAvailableOptions = (variants: any[]) => {
    if (!variants) return { sizes: [], colors: [] };

    // Only use enabled variants
    const enabledVariants = variants.filter((v: any) => v.is_enabled);

    const sizes = new Set<string>();
    const colors = new Set<string>();

    enabledVariants.forEach((variant: any) => {
      const [color, size] = variant.title.split(' / ');
      if (size) sizes.add(size.trim());
      if (color) colors.add(color.trim());
    });

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
    };
  };

  // Find variant based on selected size and color
  const findMatchingVariant = (productId: string, size: string | null, color: string | null) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !size || !color) return null;

    const enabledVariants = product.variants?.filter((v: any) => v.is_enabled) || [];
    return enabledVariants.find((v: any) => {
      const [variantColor, variantSize] = v.title.split(' / ');
      return variantSize?.trim() === size && variantColor?.trim() === color;
    });
  };

  // Update variant when size or color changes
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    if (selectedColor && selectedProduct) {
      const variant = findMatchingVariant(selectedProduct, size, selectedColor);
      setSelectedVariant(variant || null);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (selectedSize && selectedProduct) {
      const variant = findMatchingVariant(selectedProduct, selectedSize, color);
      setSelectedVariant(variant || null);
    }
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

  // Get selected product details for inline display
  const currentProduct = selectedProduct ? products.find((p) => p.id === selectedProduct) : null;
  const currentOptions = currentProduct ? getAvailableOptions(currentProduct.variants || []) : { sizes: [], colors: [] };
  const currentPricing = currentProduct ? getDisplayPrice(currentProduct) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/designs")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Designs
          </Button>

          {/* Compact 2-column layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* LEFT: Sticky design image */}
            <div className="md:sticky md:top-4 md:self-start space-y-4">
              <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={resolveDesignImage(design.image_url)}
                  alt={design.title}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              {/* AI Mockup Preview */}
              {currentProduct && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Product Preview</h3>
                  <AIMockupGenerator
                    productImage={resolveDesignImage(design.image_url)}
                    productTitle={currentProduct.title}
                    productColor={selectedColor || "White"}
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-black mb-2">{design.title}</h1>
                {design.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {design.description}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT: All selections in one column */}
            <div className="space-y-6">
              {/* Step 1: Product type — compact horizontal strip */}
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                  ① Choose Product
                </h2>
                <div className="flex flex-wrap gap-2">
                  {products.map((product) => {
                    const isSelected = selectedProduct === product.id;
                    const { price } = getDisplayPrice(product);
                    return (
                      <button
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product.id);
                          setSelectedSize(null);
                          setSelectedColor(null);
                          // Auto-select variant for products without size/color options
                          const opts = getAvailableOptions(product.variants || []);
                          if (opts.sizes.length === 0 && opts.colors.length === 0) {
                            const enabledVariants = (product.variants || []).filter((v: any) => v.is_enabled);
                            setSelectedVariant(enabledVariants[0] || null);
                          } else {
                            setSelectedVariant(null);
                          }
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-border hover:border-foreground/40 bg-card"
                          }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].src} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">—</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight">
                            {product.title.replace("– Placeholder Design", "").trim()}
                          </p>
                          <p className="text-sm font-black text-primary">
                            {price ? `$${price.toFixed(2)}` : "TBD"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 & 3: Size + Color — inline when product selected */}
              {currentProduct && (
                <>
                  {/* Price summary */}
                  {currentPricing && currentPricing.price > 0 && (
                    <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                      <p className="text-2xl font-black">
                        ${currentPricing.price.toFixed(2)}
                      </p>
                      <p className="text-lg text-muted-foreground line-through">
                        ${currentPricing.originalPrice.toFixed(2)}
                      </p>
                      <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                        SAVE $20
                      </span>
                    </div>
                  )}

                  {/* Size Selection */}
                  {currentOptions.sizes.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        ② Pick Size {selectedSize && <span className="text-primary normal-case">— {selectedSize}</span>}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {currentOptions.sizes.map((size) => (
                          <Button
                            key={size}
                            variant={selectedSize === size ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSizeChange(size)}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {currentOptions.colors.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        ③ Pick Color {selectedColor && <span className="text-primary normal-case">— {selectedColor}</span>}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {currentOptions.colors.map((color) => {
                          const hex = COLOR_HEX_MAP[color] || "#888888";
                          const isLight = hex === "#FFFFFF" || hex === "#F5F5DC" || hex === "#FFD700" || hex === "#F8D568";
                          return (
                            <button
                              key={color}
                              onClick={() => handleColorChange(color)}
                              title={color}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${selectedColor === color
                                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                : "border-border hover:border-foreground/40 bg-card"
                                }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border flex-shrink-0 ${isLight ? "border-gray-300" : "border-transparent"}`}
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-xs font-medium">{color}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add to Cart - always visible */}
                  <Button
                    size="xl"
                    className="w-full group text-lg font-bold"
                    onClick={handleAddToCart}
                    disabled={
                      (currentOptions.sizes.length > 0 || currentOptions.colors.length > 0)
                        ? (!selectedSize || !selectedColor || !selectedVariant)
                        : !selectedVariant
                    }
                  >
                    Add to Cart
                  </Button>
                </>
              )}

              {!currentProduct && (
                <div className="text-center py-8 text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
                  <p className="text-sm font-medium">Pick a product above to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DesignDetail;
