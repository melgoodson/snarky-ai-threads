import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Tag, Sparkles, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { resolveDesignImage } from "@/lib/resolveDesignImage";
import { AIMockupGenerator } from "@/components/AIMockupGenerator";

// Color name → hex mapping for visual swatches
const COLOR_HEX_MAP: Record<string, string> = {
  "Black": "#000000",
  "White": "#FFFFFF",
  "Snowwhite": "#FFFAFA",
  "Navy": "#1B1F3B",
  "Red": "#C0392B",
  "Royal": "#4169E1",
  "Royal Blue": "#2E5EAA",
  "True Royal": "#4169E1",
  "Sport Grey": "#9B9B9B",
  "Dark Heather": "#4A4A4A",
  "Dark Grey Heather": "#5A5A5A",
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
  "Safety Orange": "#FF6600",
  "Safety Pink": "#FF69B4",
  "Antique Cherry Red": "#9B111E",
  "Antique Sapphire": "#0B3D91",
  "Coral Silk": "#FF7F7F",
  "Ice Grey": "#D6D6D6",
  "Sapphire": "#0F52BA",
  "Berry": "#8E4585",
  "Heather Grey": "#B0B0B0",
  "Athletic Heather": "#B8B8B0",
  "Graphite Heather": "#5C5C5C",
  "Heather Mauve": "#C4A4B0",
  "Heather Peach": "#E8C0A8",
  "Heather Navy": "#2C3E6B",
  "Heather Sport Royal": "#3A5FCD",
  "Heather Sport Dark Navy": "#1C2951",
  "Carolina Blue": "#56A0D3",
  "Indigo Blue": "#3F51B5",
  "Violet": "#7F00FF",
  "Tropical Blue": "#00CED1",
  "Mint Green": "#98FB98",
  "Sunset": "#FAD6A5",
  "Azalea": "#F19CBB",
  "Cardinal Red": "#C41E3A",
  "Cherry Red": "#DE3163",
  "Dark Chocolate": "#3C1414",
  "Garnet": "#733635",
  "Heliconia": "#D5006C",
  "Kiwi": "#8EE53F",
  "Orchid": "#DA70D6",
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
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showTryOn, setShowTryOn] = useState(false);
  const [mockupPreview, setMockupPreview] = useState<string | null>(null);
  const [generatingMockup, setGeneratingMockup] = useState(false);
  const [mockupError, setMockupError] = useState(false);
  // Convert an image URL to base64 data URL (in the browser)
  const imageToBase64 = (src: string): Promise<string> =>
    new Promise((resolve, reject) => {
      if (src.startsWith('data:')) { resolve(src); return; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });

  // Auto-generate mockup when product is selected (with or without color)
  useEffect(() => {
    if (!selectedProduct || !design) return;
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    // Check if this product has color options
    const opts = (() => {
      const enabledVariants = (product.variants || []).filter((v: any) => v.is_enabled);
      const colors = new Set<string>();
      enabledVariants.forEach((variant: any) => {
        const parts = variant.title.split(' / ').map((p: string) => p.trim());
        parts.forEach((part: string) => {
          const v = part.trim().toLowerCase();
          const isSize = /^\d+oz$/i.test(v) || /^\d*x?[sml]$/i.test(v) || /^\d+xl$/i.test(v) || /^one size$/i.test(v) || /\d+["″]?\s*[x×]\s*\d+/i.test(v);
          const isQty = /^\d+\s*pcs?$/i.test(v);
          const isStyle = ['glossy', 'matte', 'coated (both sides)', 'coated (one side)', 'uncoated'].includes(v);
          if (!isSize && !isQty && !isStyle) colors.add(part);
        });
      });
      return { hasColors: colors.size > 0 };
    })();

    // If product has colors, wait for color selection
    if (opts.hasColors && !selectedColor) return;

    const colorForMockup = selectedColor || 'Default';

    setMockupPreview(null);
    setMockupError(false);
    setGeneratingMockup(true);

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Mockup generation timed out")), 60000)
    );

    // Resolve the design image path
    const designSrc = resolveDesignImage(design.image_url);
    // Resolve the product reference image (Printify catalog URL — already public)
    const productImgRaw = (() => {
      const img = product.images?.[0];
      if (!img) return '';
      return typeof img === 'string' ? img : img.src || img.url || '';
    })();

    // Convert the design image to base64 in the browser so the edge function can access it
    // Product images from Printify are already public URLs
    const generateAsync = async () => {
      let designBase64: string;
      try {
        designBase64 = await imageToBase64(designSrc.startsWith('http') ? designSrc : window.location.origin + (designSrc.startsWith('/') ? designSrc : '/' + designSrc));
      } catch (e) {
        console.error('[Mockup] Failed to convert design to base64:', e);
        setMockupError(true);
        setGeneratingMockup(false);
        return;
      }

      // Use the product image URL as-is if it's a public URL, otherwise convert too
      let productImageForApi = productImgRaw;
      if (productImageForApi && !productImageForApi.startsWith('http')) {
        try {
          productImageForApi = await imageToBase64(window.location.origin + (productImageForApi.startsWith('/') ? productImageForApi : '/' + productImageForApi));
        } catch (e) {
          // Fall back to design image if product image can't be loaded
          productImageForApi = designBase64;
        }
      }
      if (!productImageForApi) productImageForApi = designBase64;

      console.log('[Mockup] Generating for:', product.title, colorForMockup, 'designBase64:', designBase64.substring(0, 50) + '...', 'productImg:', productImageForApi.substring(0, 80) + '...');

      const apiCall = supabase.functions.invoke("generate-user-mockup", {
        body: {
          userImage: designBase64,
          productImage: productImageForApi,
          productTitle: product.title,
          productColor: colorForMockup,
        },
      });

      const { data, error } = await Promise.race([apiCall, timeout]) as any;
      console.log('[Mockup] Response:', { data: data ? 'received' : null, error });
      if (error) {
        console.error('[Mockup] Error:', error);
        setMockupError(true);
        return;
      }
      if (data?.mockupUrl) {
        setMockupPreview(data.mockupUrl);
      } else {
        console.warn('[Mockup] No mockupUrl in response:', data);
        setMockupError(true);
      }
    };

    generateAsync()
      .catch((err) => {
        console.error('[Mockup] Failed:', err);
        setMockupError(true);
      })
      .finally(() => setGeneratingMockup(false));
  }, [selectedProduct, selectedColor]);

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

      const allProducts = productsData || [];

      // For products with 0 enabled variants, inherit from matching Placeholder products
      const getProductType = (title: string): string => {
        const lower = title.toLowerCase();
        if (lower.includes('hoodie') || lower.includes('sweatshirt')) return 'hoodie';
        if (lower.includes('tee') || lower.includes('shirt')) return 'tee';
        if (lower.includes('mug')) return 'mug';
        if (lower.includes('tote') || lower.includes('bag')) return 'tote';
        if (lower.includes('card') || lower.includes('greeting')) return 'card';
        if (lower.includes('blanket')) return 'unknown'; // HIDDEN: investigating print quality
        return 'unknown';
      };

      // Find donor products (with the most enabled variants per type)
      const donorByType: Record<string, any> = {};
      for (const p of allProducts) {
        const type = getProductType(p.title);
        const variants = Array.isArray(p.variants) ? p.variants : [];
        const enabledCount = variants.filter((v: any) => v.is_enabled).length;
        if (enabledCount > 0) {
          const currentCount = donorByType[type]
            ? (Array.isArray(donorByType[type].variants) ? donorByType[type].variants : []).filter((v: any) => v.is_enabled).length
            : 0;
          if (enabledCount > currentCount) {
            donorByType[type] = p;
          }
        }
      }

      // Inherit variants and filter
      for (const p of allProducts) {
        const variants = Array.isArray(p.variants) ? p.variants : [];
        if (variants.filter((v: any) => v.is_enabled).length === 0) {
          const type = getProductType(p.title);
          const donor = donorByType[type];
          if (donor) {
            p.variants = donor.variants;
          }
        }
      }

      // Show only ONE product per type - prefer base product (not Custom/Placeholder)
      const seenTypes = new Set<string>();
      const baseProducts: any[] = [];
      const sorted = [...allProducts].sort((a: any, b: any) => {
        const aLower = a.title.toLowerCase();
        const bLower = b.title.toLowerCase();
        const aIsBase = !aLower.includes('placeholder') && !aLower.startsWith('custom ');
        const bIsBase = !bLower.includes('placeholder') && !bLower.startsWith('custom ');
        if (aIsBase && !bIsBase) return -1;
        if (!aIsBase && bIsBase) return 1;
        return a.title.length - b.title.length;
      });
      for (const p of sorted) {
        const type = getProductType(p.title);
        if (type !== 'unknown' && !seenTypes.has(type)) {
          seenTypes.add(type);
          baseProducts.push(p);
        }
      }

      setProducts(baseProducts.length > 0 ? baseProducts : allProducts);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load design details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    console.log('[AddToCart] Called', { selectedProduct, design: design?.id });

    if (!selectedProduct || !design) {
      toast.error("Please select a product");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    console.log('[AddToCart] Found product:', product?.title, product?.id);
    if (!product) {
      console.error('[AddToCart] Product not found in list');
      toast.error("Product not found");
      return;
    }

    const options = getAvailableOptions(product.variants || []);
    const hasOptions = options.sizes.length > 0 || options.colors.length > 0 || options.styles.length > 0;
    console.log('[AddToCart] hasOptions:', hasOptions, 'sizes:', options.sizes.length, 'colors:', options.colors.length, 'styles:', options.styles.length);

    // Only require options that exist for this product
    if (options.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (options.styles.length > 0 && !selectedStyle) {
      toast.error("Please select a style");
      return;
    }
    if (options.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    // hasOptions already defined above
    if (hasOptions && !selectedVariant) {
      toast.error("Please select all options");
      return;
    }

    const retailPrice = product.retail_price || product.price || 0;

    // For products without variants (greeting cards, etc.), use default values
    const variantTitle = selectedVariant?.title || "Default";
    const variantId = String(selectedVariant?.id || product.printify_product_id || "0");

    const cartItem = {
      productId: product.id,
      title: `${design.title} - ${product.title}`,
      price: retailPrice,
      size: variantTitle,
      image: resolveDesignImage(design.image_url),
      printifyProductId: product.printify_product_id,
      variantId: variantId,
      designImageUrl: resolveDesignImage(design.image_url),
      mockupUrl: mockupPreview || undefined, // AI-generated product mockup
    };

    console.log('[AddToCart] Adding item:', cartItem);

    try {
      addItem(cartItem);
      toast.success("Added to cart!");
    } catch (err) {
      console.error('[AddToCart] Error adding item:', err);
      toast.error("Failed to add to cart");
    }
  };

  // Get a display-friendly retail price + original price (with $20 markup)
  const getDisplayPrice = (product: Product) => {
    const retail = product.retail_price || product.price || 0;
    return { price: retail, originalPrice: retail + 20 };
  };

  // Helper: check if a string looks like a size value
  const looksLikeSize = (val: string) => {
    const v = val.trim().toLowerCase();
    if (/^\d+oz$/i.test(v)) return true;                   // 15oz, 11oz
    if (/^\d*x?[sml]$/i.test(v)) return true;              // S, M, L, XS, XL
    if (/^\d+xl$/i.test(v)) return true;                   // 2XL, 3XL
    if (/^one size$/i.test(v)) return true;                 // One size
    if (/\d+["″]?\s*[x×]\s*\d+/i.test(v)) return true;   // 30" × 40", 6.9" x 4.9", 15" x 16"
    return false;
  };

  // Helper: check if a string looks like a quantity ("1 pc", "10 pcs")
  const looksLikeQuantity = (val: string) => /^\d+\s*pcs?$/i.test(val.trim());

  // Helper: check if a string looks like a style/finish (not color or size)
  const looksLikeStyle = (val: string) => {
    const v = val.trim().toLowerCase();
    const styles = ['glossy', 'matte', 'coated (both sides)', 'coated (one side)', 'uncoated'];
    return styles.includes(v);
  };

  // Parse variants to extract sizes, colors, and styles
  const getAvailableOptions = (variants: any[]) => {
    if (!variants) return { sizes: [] as string[], colors: [] as string[], styles: [] as string[] };

    const enabledVariants = variants.filter((v: any) => v.is_enabled);

    const sizes = new Set<string>();
    const colors = new Set<string>();
    const styles = new Set<string>();

    enabledVariants.forEach((variant: any) => {
      const parts = variant.title.split(' / ').map((p: string) => p.trim());
      parts.forEach((part: string) => {
        if (looksLikeQuantity(part)) return; // Skip quantity parts like "1 pc"
        if (looksLikeSize(part)) {
          sizes.add(part);
        } else if (looksLikeStyle(part)) {
          styles.add(part);
        } else {
          colors.add(part);
        }
      });
    });

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      styles: Array.from(styles).sort(),
    };
  };

  // Find variant that matches all selected attributes
  const findMatchingVariant = (productId: string, size: string | null, color: string | null, style: string | null) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;

    const enabledVariants = product.variants?.filter((v: any) => v.is_enabled) || [];

    // Collect all selected attributes
    const selected = [size, color, style].filter(Boolean) as string[];
    if (selected.length === 0) return null;

    return enabledVariants.find((v: any) => {
      const parts = v.title.split(' / ').map((p: string) => p.trim());
      // Filter out quantity parts for matching
      const meaningful = parts.filter((p: string) => !looksLikeQuantity(p));
      return selected.every((sel) => meaningful.includes(sel));
    });
  };

  // Try to auto-resolve variant when any selection changes
  const tryResolveVariant = (size: string | null, color: string | null, style: string | null) => {
    if (!selectedProduct) return;
    const opts = currentOptions;
    const needSize = opts.sizes.length > 0;
    const needColor = opts.colors.length > 0;
    const needStyle = opts.styles.length > 0;
    if ((!needSize || size) && (!needColor || color) && (!needStyle || style)) {
      const variant = findMatchingVariant(selectedProduct, size, color, style);
      setSelectedVariant(variant || null);
    } else {
      setSelectedVariant(null);
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    tryResolveVariant(size, selectedColor, selectedStyle);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    tryResolveVariant(selectedSize, color, selectedStyle);
  };

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    tryResolveVariant(selectedSize, selectedColor, style);
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
  const currentOptions = currentProduct ? getAvailableOptions(currentProduct.variants || []) : { sizes: [], colors: [], styles: [] };
  const currentPricing = currentProduct ? getDisplayPrice(currentProduct) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{design.title} | Snarky A$$ Apparel</title>
        <meta name="description" content={design.description || `Shop the ${design.title} design at Snarky A$$ Apparel. Customize it on t-shirts, hoodies, mugs, and more.`} />
        <link rel="canonical" href={`https://snarkyazzhumans.com/designs/${id}`} />
        <meta property="og:title" content={`${design.title} | Snarky A$$ Apparel`} />
        <meta property="og:image" content={resolveDesignImage(design.image_url)} />
        <meta property="og:type" content="product" />
      </Helmet>
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
              <div className="aspect-square bg-white rounded-xl overflow-hidden flex items-center justify-center border border-border">
                <img
                  src={resolveDesignImage(design.image_url)}
                  alt={design.title}
                  className="w-full h-full object-contain p-4"
                />
              </div>

              {/* Mockup Preview Section — always visible */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Product Preview
                </h3>

                {!selectedProduct ? (
                  <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center px-4">
                      Select a product to see your design on it
                    </p>
                  </div>
                ) : mockupPreview ? (
                  /* AI mockup is ready — show it */
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img src={mockupPreview} alt="Product mockup" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  /* CSS overlay: design on product (immediate + loading state) */
                  <div className="space-y-2">
                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                      {(() => {
                        const product = products.find((p) => p.id === selectedProduct);
                        const productImg = product?.images?.[0];
                        const productSrc = productImg
                          ? (typeof productImg === 'string' ? productImg : productImg.src || productImg.url)
                          : null;
                        return productSrc ? (
                          <>
                            <img src={productSrc} alt="Product" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center p-8">
                              <img
                                src={resolveDesignImage(design.image_url)}
                                alt="Design on product"
                                className="max-w-[60%] max-h-[60%] object-contain opacity-90"
                                style={{ filter: "drop-shadow(0px 2px 6px rgba(0,0,0,0.3))" }}
                              />
                            </div>
                          </>
                        ) : (
                          <img
                            src={resolveDesignImage(design.image_url)}
                            alt="Design preview"
                            className="w-full h-full object-contain p-4"
                          />
                        );
                      })()}
                      {/* Loading spinner overlay while AI generates */}
                      {generatingMockup && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                          <div className="text-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
                            <p className="text-xs text-white font-medium">Generating AI preview...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {generatingMockup ? 'AI mockup generating...' : mockupError ? 'AI preview unavailable — showing design overlay' : 'Design preview'}
                    </p>
                  </div>
                )}

                {/* AI Try-On Button — prominent CTA for wearables */}
                {currentProduct && (() => {
                  const t = currentProduct.title.toLowerCase();
                  const isWearable = ['shirt', 'tee', 'hoodie', 'sweatshirt', 'jacket', 'tank', 'polo', 'sweater'].some(k => t.includes(k));
                  return isWearable;
                })() && (
                  <>
                    {!showTryOn ? (
                      <Button
                        variant="default"
                        className="w-full group font-bold"
                        onClick={() => setShowTryOn(true)}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Try It On with AI
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold">AI Virtual Try-On</h3>
                          <Button variant="ghost" size="sm" onClick={() => setShowTryOn(false)}>Close</Button>
                        </div>
                        <AIMockupGenerator
                          productImage={resolveDesignImage(design.image_url)}
                          productTitle={currentProduct.title}
                          productColor={selectedColor || "White"}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

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
                          setSelectedStyle(null);
                          // Auto-select variant for products without any options
                          const opts = getAvailableOptions(product.variants || []);
                          if (opts.sizes.length === 0 && opts.colors.length === 0 && opts.styles.length === 0) {
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

                  {/* Style Selection (Glossy / Matte etc.) */}
                  {currentOptions.styles.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        {currentOptions.sizes.length > 0 ? '③' : '②'} Pick Style {selectedStyle && <span className="text-primary normal-case">— {selectedStyle}</span>}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {currentOptions.styles.map((style) => (
                          <Button
                            key={style}
                            variant={selectedStyle === style ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStyleChange(style)}
                          >
                            {style}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {currentOptions.colors.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider mb-3">
                        {(() => { let step = 2; if (currentOptions.sizes.length > 0) step++; if (currentOptions.styles.length > 0) step++; return step === 2 ? '②' : step === 3 ? '③' : '④'; })()} Pick Color {selectedColor && <span className="text-primary normal-case">— {selectedColor}</span>}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {currentOptions.colors.map((color) => {
                          const hex = COLOR_HEX_MAP[color] || "#888888";
                          const isLight = hex === "#FFFFFF" || hex === "#FFFAFA" || hex === "#F5F5DC" || hex === "#FFD700" || hex === "#F8D568";
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
                      (currentOptions.sizes.length > 0 || currentOptions.colors.length > 0 || currentOptions.styles.length > 0)
                        ? (
                          (currentOptions.sizes.length > 0 && !selectedSize) ||
                          (currentOptions.colors.length > 0 && !selectedColor) ||
                          (currentOptions.styles.length > 0 && !selectedStyle) ||
                          !selectedVariant
                        )
                        : false
                    }
                  >
                    Add to Cart
                  </Button>                </>
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
