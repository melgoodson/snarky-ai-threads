import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Check, Sparkles, Palette, Edit, ShoppingCart, Camera, Minus, Plus, Save } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import personalizationBlanketFallback from "@/assets/personalization-blanket.png";
import { useSnarkyLoader } from "@/hooks/useSnarkyLoader";

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

interface DesignDraft {
  imageUrl: string;
  promptText: string;
  createdAt: Date;
}

interface ApprovedDesign {
  imageUrl: string;
  promptText: string;
  approvedAt: Date;
}

const PRESET_DESIGNS = [
  {
    id: 1,
    name: "Abstract Art",
    description: "Bold shapes & vibrant colors",
    prompt: "Create a vibrant abstract art design with colorful geometric shapes and flowing patterns, perfect for print on demand products. Modern and eye-catching.",
  },
  {
    id: 2,
    name: "Nature Scene",
    description: "Mountains, forests & sunsets",
    prompt: "Create a beautiful nature scene with mountains, forests, and a sunset sky. Serene and peaceful design suitable for apparel and home decor.",
  },
  {
    id: 3,
    name: "Minimalist Typography",
    description: "Clean quotes & modern fonts",
    prompt: "Create a minimalist typography design with inspiring quote and clean modern fonts. Simple, elegant, and timeless.",
  },
  {
    id: 4,
    name: "Retro Vibes",
    description: "80s aesthetic & neon colors",
    prompt: "Create a retro vintage style design with 80s aesthetic, bold colors, and nostalgic elements. Fun and energetic.",
  },
];

// Flow Steps
type FlowStep = 'create' | 'approve' | 'product' | 'mockup' | 'review';

export default function CustomDesign() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();

  // Flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>('create');

  // Step 1: Create Design
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [uploadedDesign, setUploadedDesign] = useState<string | null>(null);
  const [generatingDesign, setGeneratingDesign] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [designDraft, setDesignDraft] = useState<DesignDraft | null>(null);
  const [userDesigns, setUserDesigns] = useState<any[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  // Step 2: Approved Design
  const [approvedDesign, setApprovedDesign] = useState<ApprovedDesign | null>(null);

  // Step 3: Product Selection
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Step 4 & 5: Mockup
  const [generatingMockup, setGeneratingMockup] = useState(false);
  const [mockupPreview, setMockupPreview] = useState<string | null>(null);
  const [mockupTimeout, setMockupTimeout] = useState(false);

  // Virtual Try-On
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [tryOnMockup, setTryOnMockup] = useState<string | null>(null);
  const [generatingTryOn, setGeneratingTryOn] = useState(false);

  // Snarky loading messages
  const snarkyDesign = useSnarkyLoader(generatingDesign);
  const snarkyMockup = useSnarkyLoader(generatingMockup);
  const snarkyTryOn = useSnarkyLoader(generatingTryOn);

  // Checkout
  const [creatingPrintifyProduct, setCreatingPrintifyProduct] = useState(false);

  // Auth state
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Size ordering
  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL', '11OZ', '15OZ'];

  const isSize = (str: string): boolean => {
    const normalized = str.trim().toUpperCase();
    return SIZE_ORDER.includes(normalized);
  };

  const getSizeOrderIndex = (size: string): number => {
    const normalized = size.trim().toUpperCase();
    const index = SIZE_ORDER.indexOf(normalized);
    return index === -1 ? 999 : index;
  };

  const extractColorFromVariant = (variantTitle: string): string => {
    const parts = variantTitle.split('/').map(p => p.trim());
    if (parts.length === 2) {
      if (isSize(parts[0])) return parts[1];
      if (isSize(parts[1])) return parts[0];
      return parts[0];
    }
    return variantTitle;
  };

  const extractSizeFromVariant = (variantTitle: string): string => {
    const parts = variantTitle.split('/').map(p => p.trim());
    if (parts.length === 2) {
      if (isSize(parts[0])) return parts[0];
      if (isSize(parts[1])) return parts[1];
      return parts[1];
    }
    // Don't fabricate a size — return the raw title so callers can detect "no real size"
    return variantTitle;
  };

  const getUniqueColors = (variants: Variant[]): string[] => {
    const enabledVariants = variants.filter(v => v.is_enabled);
    const colors = enabledVariants.map(v => extractColorFromVariant(v.title));
    return [...new Set(colors)];
  };

  const getSizesForColor = (variants: Variant[], color: string): Variant[] => {
    return variants
      .filter(v => v.is_enabled && extractColorFromVariant(v.title) === color)
      .sort((a, b) => {
        const sizeA = extractSizeFromVariant(a.title);
        const sizeB = extractSizeFromVariant(b.title);
        return getSizeOrderIndex(sizeA) - getSizeOrderIndex(sizeB);
      });
  };

  // Check if product is apparel (for Virtual Try-On eligibility)
  const isApparelProduct = (product: Product | null): boolean => {
    if (!product) return false;
    const category = (product.category || '').toLowerCase();
    const title = (product.title || '').toLowerCase();

    const apparelKeywords = ['shirt', 'tee', 'hoodie', 'sweatshirt', 'jacket', 'tank', 'polo', 'sweater', 'apparel', 'clothing'];
    const nonApparelKeywords = ['mug', 'cup', 'poster', 'sticker', 'phone', 'case', 'pillow', 'canvas', 'bag', 'tote', 'hat', 'cap', 'blanket', 'card', 'greeting'];

    // Check if it's explicitly non-apparel
    for (const keyword of nonApparelKeywords) {
      if (category.includes(keyword) || title.includes(keyword)) {
        return false;
      }
    }

    // Check if it's apparel
    for (const keyword of apparelKeywords) {
      if (category.includes(keyword) || title.includes(keyword)) {
        return true;
      }
    }

    // Default to false for unknown categories — only show try-on for confirmed apparel
    return false;
  };

  // Check auth state - show prompt instead of redirecting
  useEffect(() => {
    const checkAuth = async () => {
      setAuthChecking(true);
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        setLoadingDesigns(true);
        try {
          const { data, error } = await supabase
            .from('ai_generated_images')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setUserDesigns(data || []);
        } catch (error) {
          console.error("Error fetching user designs:", error);
        } finally {
          setLoadingDesigns(false);
        }
      }

      // Restore session state if returning from Auth
      const savedState = sessionStorage.getItem('customDesignState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.designDraft) setDesignDraft(state.designDraft);
          if (state.approvedDesign) setApprovedDesign(state.approvedDesign);
          if (state.currentStep) setCurrentStep(state.currentStep);
          if (state.selectedProduct) setSelectedProduct(state.selectedProduct);
          if (state.selectedVariant) setSelectedVariant(state.selectedVariant);
          if (state.quantity) setQuantity(state.quantity);
          if (state.savedDesignId) setSavedDesignId(state.savedDesignId);
          if (state.mockupPreview) setMockupPreview(state.mockupPreview);

          // Clear it after using
          sessionStorage.removeItem('customDesignState');

          // Auto-save if it was pending
          const pendingAction = sessionStorage.getItem('customDesignPendingAction');
          if (pendingAction === 'save' && state.designDraft) {
            sessionStorage.removeItem('customDesignPendingAction');
            // We can't easily wait for this without making useEffect messy, 
            // but the state is restored so they are on exactly the step they left.
            toast.success("State restored! You can now click save or checkout.");
          } else if (pendingAction === 'checkout') {
            sessionStorage.removeItem('customDesignPendingAction');
            toast.success("State restored! You can now continue to checkout.");
          }
        } catch (e) {
          console.error("Failed to parse restored state", e);
        }
      }

      setAuthChecking(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session?.user;
      setIsAuthenticated(authed);
      if (session?.user) {
        fetchUserDesigns(session.user.id);
      } else {
        setUserDesigns([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserDesigns = async (userId: string) => {
    setLoadingDesigns(true);
    try {
      const { data, error } = await supabase
        .from('ai_generated_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUserDesigns(data || []);
    } catch (error) {
      console.error("Error fetching user designs:", error);
    } finally {
      setLoadingDesigns(false);
    }
  };

  // Handle existing design from navigation state
  useEffect(() => {
    const existingDesign = location.state?.existingDesign;
    if (existingDesign?.image_url) {
      setSavedDesignId(existingDesign.id || null);
      setDesignDraft({
        imageUrl: existingDesign.image_url,
        promptText: existingDesign.prompt_text || "",
        createdAt: new Date(),
      });
      setCurrentStep('approve');
      toast.success("Design loaded! Review, save, and continue.");
    }
  }, [location.state]);

  // Handle designUrl query param (from profile "Use" button)
  useEffect(() => {
    const designUrl = searchParams.get('designUrl');
    if (designUrl && !designDraft && !approvedDesign) {
      setDesignDraft({
        imageUrl: designUrl,
        promptText: "Saved design",
        createdAt: new Date(),
      });
      setCurrentStep('approve');
      toast.success("Design loaded! Review and continue.");
    }
  }, [searchParams]);

  // Fetch products when entering product step
  useEffect(() => {
    if (currentStep === 'product') {
      fetchProducts();
    }
  }, [currentStep]);

  // Auto-generate mockup when product is selected
  useEffect(() => {
    if (currentStep === 'mockup' && approvedDesign && selectedProduct && selectedVariant && !mockupPreview) {
      generateMockup();
    }
  }, [currentStep, approvedDesign, selectedProduct, selectedVariant]);

  // Show "Skip" button after 5 seconds on the mockup step
  useEffect(() => {
    if (currentStep !== 'mockup' || !generatingMockup) {
      setMockupTimeout(false);
      return;
    }
    const timer = setTimeout(() => setMockupTimeout(true), 5000);
    return () => clearTimeout(timer);
  }, [currentStep, generatingMockup]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (error) throw error;

      const allProducts: Product[] = (data || []).map((p) => ({
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

      // For products with 0 enabled variants, try to inherit from a matching
      // "Placeholder Design" product that has variants already configured
      const typeKeywords = ['hoodie', 'sweatshirt', 'tee', 'shirt', 'mug', 'tote', 'bag', 'card', 'greeting', 'blanket'];

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

      // Find donor products (those with the most enabled variants per type)
      const donorByType: Record<string, Product> = {};
      for (const p of allProducts) {
        const type = getProductType(p.title);
        const enabledCount = p.variants.filter(v => v.is_enabled).length;
        if (enabledCount > 0) {
          const currentDonor = donorByType[type];
          const currentDonorCount = currentDonor ? currentDonor.variants.filter(v => v.is_enabled).length : 0;
          if (enabledCount > currentDonorCount) {
            donorByType[type] = p;
          }
        }
      }

      // Inherit variants for products with none
      for (const p of allProducts) {
        const enabledCount = p.variants.filter(v => v.is_enabled).length;
        if (enabledCount === 0) {
          const type = getProductType(p.title);
          const donor = donorByType[type];
          if (donor) {
            console.log(`Inheriting ${donor.variants.filter(v => v.is_enabled).length} variants from "${donor.title}" to "${p.title}"`);
            p.variants = donor.variants;
          }
        }
      }

      // Show only ONE product per type - prefer the base product (not Custom/Placeholder versions)
      const seenTypes = new Set<string>();
      const baseProducts: typeof allProducts = [];

      // Sort: prefer products WITHOUT "placeholder" or "custom" in the name, then by shortest title
      const sorted = [...allProducts].sort((a, b) => {
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

      const finalProducts = baseProducts.length > 0 ? baseProducts : allProducts;
      setProducts(finalProducts);

      // Auto-select product if ?product= URL param is provided (e.g., from landing pages)
      const productParam = searchParams.get('product');
      if (productParam && !selectedProduct) {
        const match = finalProducts.find(p => getProductType(p.title) === productParam.toLowerCase());
        if (match) {
          console.log('Auto-selecting product from URL param:', productParam, '->', match.title);
          setSelectedProduct(match);
          // Also auto-select first enabled variant so variant picker shows immediately
          const enabledVariants = match.variants.filter(v => v.is_enabled);
          if (enabledVariants.length > 0) {
            setSelectedVariant(enabledVariants[0]);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setUploadedDesign(imageUrl);
      setSavedDesignId(null);
      setDesignDraft({
        imageUrl,
        promptText: "Uploaded design",
        createdAt: new Date(),
      });
      toast.success("Design uploaded! Review, save, and continue.");
      setCurrentStep('approve');
    };
    reader.readAsDataURL(file);
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

      if (error) {
        // Check if the error contains rate limit info
        const errorMsg = error.message || String(error);
        if (errorMsg.includes("429") || errorMsg.includes("rate") || errorMsg.includes("non-2xx")) {
          toast.error("AI service is busy. Please wait 1-2 minutes and try again.", { duration: 6000 });
          return;
        }
        throw error;
      }

      // Check for error in the response body (edge function returned JSON error)
      if (data?.error) {
        toast.error(data.error, { duration: 6000 });
        return;
      }

      if (data?.image) {
        setSavedDesignId(null);

        setDesignDraft({
          imageUrl: data.image,
          promptText: prompt.trim(),
          createdAt: new Date(),
        });

        toast.success("Design generated! Review, save, and continue.");
        setCurrentStep('approve');
      } else {
        throw new Error("No design image returned");
      }
    } catch (error: any) {
      console.error("Design generation error:", error);
      toast.error(error.message || "Failed to generate design. Please try again.");
    } finally {
      setGeneratingDesign(false);
    }
  };

  const approveDesign = () => {
    if (!designDraft) return;

    setApprovedDesign({
      imageUrl: designDraft.imageUrl,
      promptText: designDraft.promptText,
      approvedAt: new Date(),
    });

    toast.success("Design approved! Now choose a product.");
    setCurrentStep('product');
  };

  const editDesign = () => {
    setSavedDesignId(null);
    setDesignDraft(null);
    setUploadedDesign(null);
    setCurrentStep('create');
    toast.info("Edit your design");
  };

  const saveDesignToProfile = async (): Promise<boolean> => {
    if (!designDraft) return false;

    if (savedDesignId) {
      toast.success("This design is already saved in your profile");
      return true;
    }

    setSavingDesign(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to save designs");
        sessionStorage.setItem('customDesignState', JSON.stringify({
          designDraft, approvedDesign, currentStep, selectedProduct, selectedVariant, quantity, savedDesignId, mockupPreview, uploadedDesign
        }));
        sessionStorage.setItem('customDesignPendingAction', 'save');
        navigate("/auth", { state: { returnTo: '/custom-design' } });
        return false;
      }

      const { count, error: countError } = await supabase
        .from('ai_generated_images')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      if ((count ?? 0) >= 10) {
        toast.error("You've reached the 10-design limit. Delete one in your profile to save a new design.");
        navigate('/profile');
        return false;
      }

      const { data, error } = await supabase
        .from('ai_generated_images')
        .insert({
          image_url: designDraft.imageUrl,
          prompt_text: designDraft.promptText || 'Custom design',
          user_id: user.id,
          selected: false,
        })
        .select('id');

      if (error) throw error;

      const newId = (data || [])[0]?.id as string | undefined;
      if (!newId) throw new Error('Save failed (no id returned)');

      setSavedDesignId(newId);
      toast.success('Design saved to your profile');
      return true;
    } catch (error: any) {
      console.error('Error saving design:', error);
      toast.error(error?.message || 'Failed to save design');
      return false;
    } finally {
      setSavingDesign(false);
    }
  };

  const saveAndProceed = async () => {
    const saved = await saveDesignToProfile();
    if (saved) approveDesign();
  };

  const [mockupError, setMockupError] = useState<string | null>(null);

  const generateMockup = async () => {
    if (!approvedDesign || !selectedProduct || !selectedVariant) return;

    // Blanket uses edge-to-edge sublimation — CSS overlay is the correct preview.
    // Skip AI mockup entirely to avoid "AI busy" errors.
    if (selectedProduct.title.toLowerCase().includes('blanket')) {
      setMockupPreview(null);
      setMockupError(null);
      setCurrentStep('review');
      return;
    }

    const selectedColor = extractColorFromVariant(selectedVariant.title);

    // Build a product reference image: template_image_url → catalog images[0]
    const rawImg = selectedProduct.images?.[0];
    const catalogImgUrl = rawImg ? (typeof rawImg === 'string' ? rawImg : (rawImg as any).src || (rawImg as any).url || '') : '';
    const productImageStr = selectedProduct.template_image_url || catalogImgUrl;

    if (!productImageStr) {
      // No reference image at all — skip AI mockup, go straight to review with CSS fallback
      setMockupPreview(null);
      setMockupError(null);
      toast.info("AI mockup unavailable for this product — showing design preview.");
      setCurrentStep('review');
      return;
    }

    setGeneratingMockup(true);
    setMockupError(null);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Mockup generation timed out. Please try again.")), 60000)
      );
      const apiCall = supabase.functions.invoke("generate-user-mockup", {
        body: {
          userImage: approvedDesign.imageUrl,
          productImage: productImageStr,
          productTitle: selectedProduct.title,
          productColor: selectedColor,
        },
      });
      const { data, error } = await Promise.race([apiCall, timeout]);

      if (error) {
        const msg = error.message || String(error);
        if (msg.includes("429") || msg.includes("rate") || msg.includes("non-2xx")) {
          // Auto-advance to review with CSS fallback instead of blocking
          toast.info("AI preview unavailable — showing design preview.");
          setCurrentStep('review');
          return;
        }
        throw error;
      }

      if (data?.error) {
        setMockupError(data.error);
        toast.error(data.error, { duration: 6000 });
        return;
      }

      if (data?.mockupUrl) {
        setMockupPreview(data.mockupUrl);
        toast.success("Mockup generated!");
        setCurrentStep('review');
      } else {
        throw new Error("Failed to generate mockup");
      }
    } catch (error: any) {
      console.error("Mockup generation error:", error);
      const msg = error.message || "Failed to generate mockup. Please try again.";
      setMockupError(msg);
      toast.error(msg);
    } finally {
      setGeneratingMockup(false);
    }
  };

  // Compress an image data-URL to keep payloads small for the edge function.
  // Resizes to max 1024px and re-encodes as JPEG at 80% quality.
  const compressImage = (dataUrl: string, maxPx = 1024, quality = 0.8): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl); // fallback: send as-is
      img.src = dataUrl;
    });

  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawPhoto = event.target?.result as string;
      setUserPhoto(rawPhoto);
      toast.success("Photo uploaded! Generating try-on preview...");

      // Always use the product template URL (string) for the reference image — 
      // sending large base64 blobs as both inputs causes >10MB payloads that crash the edge function.
      const productTemplateUrl =
        selectedProduct?.template_image_url ||
        (selectedProduct?.title?.toLowerCase().includes('blanket') ? personalizationBlanketFallback : null);

      if (!productTemplateUrl) {
        toast.error("No product template available for try-on.");
        return;
      }

      // Compress user photo to ~1024px JPEG to keep total payload well under limits
      const compressedPhoto = await compressImage(rawPhoto);
      generateTryOnMockup(compressedPhoto, productTemplateUrl);
    };
    reader.readAsDataURL(file);
  };

  const generateTryOnMockup = async (photo: string, productRefImage: string) => {
    if (!selectedProduct || !selectedVariant) return;

    const selectedColor = extractColorFromVariant(selectedVariant.title);

    setGeneratingTryOn(true);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Try-on generation timed out after 60 seconds. Please try again.")), 60000)
      );
      const apiCall = supabase.functions.invoke("generate-mockup", {
        body: {
          userImage: photo,
          productImage: productRefImage,
          productTitle: selectedProduct.title,
          productColor: selectedColor,
        },
      });
      const { data, error } = await Promise.race([apiCall, timeout]);

      if (error) {
        // Supabase wraps HTTP errors with the status code in the message.
        // Parse it so we can give the user an accurate message.
        const msg = (error.message || String(error)).toLowerCase();
        if (msg.includes('413') || msg.includes('payload') || msg.includes('too large')) {
          toast.error("Your photo is too large. Please try a smaller image (under 5MB).", { duration: 8000 });
        } else if (msg.includes('429') || msg.includes('rate limit')) {
          toast.error("AI service is busy. Please wait 1–2 minutes and try again.", { duration: 8000 });
        } else if (msg.includes('timed out')) {
          toast.error("Try-on took too long. Please try again.", { duration: 6000 });
        } else {
          toast.error(`Try-on failed: ${error.message || 'Unknown error'}`, { duration: 8000 });
        }
        return;
      }

      if (data?.error) {
        // Edge function returned a structured error — surface it directly
        toast.error(data.error, { duration: 8000 });
        return;
      }

      if (data?.image) {
        setTryOnMockup(data.image);
        toast.success("Virtual try-on generated!");
      } else {
        toast.error("Try-on returned no image. Please try again.");
      }
    } catch (error: any) {
      console.error("Try-on generation error:", error);
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('timed out')) {
        toast.error("Try-on took too long. Please try a smaller photo and retry.", { duration: 8000 });
      } else {
        toast.error(error.message || "Failed to generate try-on. Please try again.");
      }
    } finally {
      setGeneratingTryOn(false);
    }
  };

  const proceedToCheckout = async () => {
    if (!selectedProduct || !approvedDesign || !selectedVariant) {
      toast.error("Please complete all steps before checkout");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to complete your checkout");
      sessionStorage.setItem('customDesignState', JSON.stringify({
        designDraft, approvedDesign, currentStep, selectedProduct, selectedVariant, quantity, savedDesignId, mockupPreview, uploadedDesign
      }));
      sessionStorage.setItem('customDesignPendingAction', 'checkout');
      navigate("/auth", { state: { returnTo: '/custom-design' } });
      return;
    }

    setCreatingPrintifyProduct(true);
    toast.info("Creating your custom product...");

    try {
      const { data: customProductData, error: customProductError } = await supabase.functions.invoke(
        "create-custom-printify-product",
        {
          body: {
            designImageUrl: approvedDesign.imageUrl,
            baseProductId: selectedProduct.id,
            variantId: selectedVariant.id,
            customTitle: `Custom ${selectedProduct.title}`,
            productColor: extractColorFromVariant(selectedVariant.title),
          },
        }
      );

      if (customProductError) {
        const errorMsg = typeof customProductError === 'object'
          ? (customProductError as any)?.message || JSON.stringify(customProductError)
          : String(customProductError);
        console.error("Custom product creation error:", errorMsg);
        throw new Error(errorMsg);
      }
      if (!customProductData?.success || !customProductData?.printifyProductId) {
        throw new Error(customProductData?.error || "Failed to create custom product on Printify");
      }

      toast.success("Custom product created!");

      const basePrice = Number(selectedProduct.retail_price || selectedProduct.price) || 0;
      const selectedSize = extractSizeFromVariant(selectedVariant.title);
      const selectedColor = extractColorFromVariant(selectedVariant.title);

      // Use Printify's mockup if available, then AI preview, then design image as last fallback
      const displayImage = customProductData.mockupImageUrl || mockupPreview || approvedDesign.imageUrl;
      // Use Printify's confirmed design URL (what will actually be printed)
      const confirmedDesignUrl = customProductData.uploadedImagePreview || approvedDesign.imageUrl;

      console.log('Order consistency check:', {
        printifyMockup: customProductData.mockupImageUrl,
        aiMockup: mockupPreview,
        displayImage,
        printifyDesignUrl: customProductData.uploadedImagePreview,
        originalDesignUrl: approvedDesign.imageUrl,
        confirmedDesignUrl,
      });

      // Add items to cart based on quantity
      for (let i = 0; i < quantity; i++) {
        addItem({
          productId: selectedProduct.id,
          title: `Custom ${selectedProduct.title} - ${selectedColor}`,
          price: basePrice,
          size: selectedSize,
          image: displayImage,
          printifyProductId: customProductData.printifyProductId,
          variantId: String(selectedVariant.id),
          designImageUrl: confirmedDesignUrl,
        });
      }

      navigate("/checkout");
    } catch (error: any) {
      console.error("Error creating custom product:", error);
      toast.error(error.message || "Failed to create custom product");
    } finally {
      setCreatingPrintifyProduct(false);
    }
  };

  const getStepNumber = (step: FlowStep): number => {
    const steps: FlowStep[] = ['create', 'approve', 'product', 'mockup', 'review'];
    return steps.indexOf(step) + 1;
  };

  const stepLabels = {
    create: 'Create Design',
    approve: 'Approve Design',
    product: 'Choose Product',
    mockup: 'Create Mockup',
    review: 'Review & Order',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Loading State */}
          {authChecking && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Main Content - Always show, but Auth Check for saves */}
          {!authChecking && (
            <>
              {/* Header */}
              <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-black text-foreground">Create Your Custom Product</h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Design, preview, and order your unique custom merchandise in just a few steps.
                  </p>
                </div>
              </Card>

              {/* Progress Steps */}
              <div className="flex justify-center items-center gap-2 flex-wrap">
                {(['create', 'approve', 'product', 'mockup', 'review'] as FlowStep[]).map((step, index) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm ${getStepNumber(currentStep) >= index + 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {index + 1}
                    </div>
                    <span className={`hidden md:inline text-sm ${getStepNumber(currentStep) >= index + 1 ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}>
                      {stepLabels[step]}
                    </span>
                    {index < 4 && (
                      <div className={`w-6 md:w-12 h-1 ${getStepNumber(currentStep) > index + 1 ? "bg-primary" : "bg-muted"
                        }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Create Design */}
              {currentStep === 'create' && (
                <section className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-foreground mb-2">Step 1: Create Your Design</h2>
                    <p className="text-muted-foreground">Generate a design with AI or upload your own</p>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card/50 border border-border rounded-lg px-4 py-3 text-left max-w-lg mx-auto mt-4">
                      <span className="text-base leading-none mt-0.5">🔒</span>
                      <p>
                        <span className="font-bold text-foreground">We're Snarky. Not Shady.</span>{" "}
                        Your photo is used only for your custom design — not stored, not sold, not shared.
                        The only thing we're doing is making something awesome for you!
                      </p>
                    </div>
                  </div>

                  {/* AI Design Creation */}
                  <Card className="max-w-3xl mx-auto p-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Option A: Generate with AI
                    </h3>

                    {/* Presets */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Choose a Preset Style:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {PRESET_DESIGNS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              setSelectedPreset(preset.id);
                              setCustomPrompt("");
                            }}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${selectedPreset === preset.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                              }`}
                          >
                            <Palette className="h-6 w-6 text-primary mb-2" />
                            <p className="font-medium text-sm">{preset.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Prompt */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Or Describe Your Design:</h4>
                      <Textarea
                        placeholder="Example: A playful cartoon cat wearing sunglasses, retro 80s style with neon colors..."
                        value={customPrompt}
                        onChange={(e) => {
                          setCustomPrompt(e.target.value);
                          setSelectedPreset(null);
                        }}
                        rows={4}
                      />
                    </div>

                    {/* Reference Image */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Reference Image (Optional):</h4>
                      {!referenceImage ? (
                        <label className="flex items-center justify-center p-6 cursor-pointer border-2 border-dashed border-border rounded-lg hover:bg-secondary/50 transition-colors">
                          <Upload className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Add reference image</span>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleReferenceUpload}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center gap-4">
                          <img src={referenceImage} alt="Reference" className="w-24 h-24 object-cover rounded-lg" />
                          <Button variant="outline" size="sm" onClick={() => setReferenceImage(null)}>
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button
                      size="lg"
                      onClick={generateDesign}
                      disabled={generatingDesign || (!selectedPreset && !customPrompt.trim())}
                      className="w-full"
                    >
                      {generatingDesign ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <span className="text-sm">{snarkyDesign}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate Design
                        </>
                      )}
                    </Button>
                  </Card>

                  <div className="text-center text-muted-foreground font-medium">— OR —</div>

                  {/* Upload Design Option */}
                  <Card className="max-w-2xl mx-auto p-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      Option B: Upload Your Design
                    </h3>
                    <label className="flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-secondary/50 transition-colors border-2 border-dashed border-border rounded-lg">
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <span className="text-lg font-semibold text-foreground mb-2">
                        Click to Upload
                      </span>
                      <span className="text-sm text-muted-foreground">
                        PNG, JPG, or SVG - max 10MB
                      </span>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleDesignUpload}
                        className="hidden"
                      />
                    </label>
                  </Card>

                  {/* Option C: Choose Saved Design */}
                  {userDesigns.length > 0 && (
                    <>
                      <div className="text-center text-muted-foreground font-medium">— OR —</div>
                      <Card className="max-w-3xl mx-auto p-8">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" />
                          Option C: Choose From Your Saved Designs
                        </h3>
                        {loadingDesigns ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {userDesigns.map((design) => (
                              <button
                                key={design.id}
                                onClick={() => {
                                  setSavedDesignId(design.id);
                                  setDesignDraft({
                                    imageUrl: design.image_url,
                                    promptText: design.prompt_text || "Saved design",
                                    createdAt: new Date(),
                                  });
                                  toast.success("Saved design loaded! Review and continue.");
                                  setCurrentStep('approve');
                                }}
                                className="group relative rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all aspect-square"
                              >
                                <img src={design.image_url} alt={design.prompt_text} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                  <span className="text-white text-xs font-medium text-center line-clamp-3">
                                    {design.prompt_text || "Select"}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </Card>
                    </>
                  )}
                </section>
              )}

              {/* Step 2: Approve Design */}
              {currentStep === 'approve' && designDraft && (
                <section className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-foreground mb-2">Step 2: Approve Your Design</h2>
                    <p className="text-muted-foreground">Review your design before proceeding</p>
                  </div>

                  <Card className="max-w-2xl mx-auto p-8">
                    <div className="space-y-6">
                      <img
                        src={designDraft.imageUrl}
                        alt="Design preview"
                        className="w-full rounded-lg border border-border"
                      />


                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground text-center">
                          Save this design to your profile (10 max) so you don’t lose it.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            size="lg"
                            onClick={saveAndProceed}
                            className="min-w-[200px]"
                            disabled={savingDesign || !!savedDesignId}
                          >
                            {savingDesign ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving...
                              </>
                            ) : savedDesignId ? (
                              <>
                                <Check className="mr-2 h-5 w-5" />
                                Saved
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-5 w-5" />
                                Save & Continue
                              </>
                            )}
                          </Button>

                          <Button
                            size="lg"
                            variant="outline"
                            onClick={approveDesign}
                            className="min-w-[200px]"
                          >
                            Continue (no save)
                          </Button>

                          <Button size="lg" variant="outline" onClick={editDesign}>
                            <Edit className="mr-2 h-5 w-5" />
                            Edit Design
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              )}

              {/* Step 3: Choose Product */}
              {currentStep === 'product' && approvedDesign && (
                <section className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-foreground mb-2">Step 3: Choose Your Product</h2>
                    <p className="text-muted-foreground">Select a product, color, size, and quantity</p>
                  </div>

                  {/* Show approved design */}
                  <div className="flex justify-center">
                    <Card className="p-4 max-w-xs">
                      <p className="text-xs text-muted-foreground mb-2 text-center">Your Approved Design</p>
                      <img src={approvedDesign.imageUrl} alt="Approved design" className="w-full rounded-lg" />
                    </Card>
                  </div>

                  {loadingProducts ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <Card
                          key={product.id}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden ${selectedProduct?.id === product.id
                            ? "ring-4 ring-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                            : "hover:border-primary/50"
                            }`}
                          onClick={() => {
                            setSelectedProduct(product);
                            setSelectedVariant(null);
                          }}
                        >
                          <div className="relative aspect-square bg-secondary">
                            <img
                              src={product.template_image_url || (product.images && product.images[0]) || (product.title.toLowerCase().includes('blanket') ? personalizationBlanketFallback : '')}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Try blanket fallback first
                                if (product.title.toLowerCase().includes('blanket') && target.src !== personalizationBlanketFallback) {
                                  target.src = personalizationBlanketFallback;
                                } else if (product.images && product.images[0] && target.src !== product.images[0]) {
                                  target.src = product.images[0];
                                } else {
                                  target.style.display = 'none';
                                }
                              }}
                            />
                            {selectedProduct?.id === product.id && (
                              <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-2">
                                <Check className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-2">
                            <span className="text-xs font-semibold text-primary uppercase">{product.category}</span>
                            <h3 className="font-bold text-lg text-foreground line-clamp-2">{product.title.replace("– Placeholder Design", "").trim()}</h3>
                            <p className="text-2xl font-black text-foreground">${product.retail_price.toFixed(2)}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Variant Selection */}
                  {selectedProduct && selectedProduct.variants.filter(v => v.is_enabled).length > 0 && (
                    <Card className="max-w-2xl mx-auto p-6">
                      <h3 className="text-xl font-bold mb-4">Select Options</h3>

                      {/* Color/Option Selection */}
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">
                          {selectedProduct.variants.some(v => v.title.includes(' / ')) ? 'Color' : 'Size'}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {getUniqueColors(selectedProduct.variants).map((color) => {
                            const isSelected = selectedVariant && extractColorFromVariant(selectedVariant.title) === color;
                            return (
                              <button
                                key={color}
                                onClick={() => {
                                  const firstVariant = getSizesForColor(selectedProduct.variants, color)[0];
                                  if (firstVariant) setSelectedVariant(firstVariant);
                                }}
                                className={`px-4 py-2 rounded-lg border-2 transition-all ${isSelected
                                  ? "border-primary bg-primary/10 font-semibold"
                                  : "border-border hover:border-primary/50"
                                  }`}
                              >
                                {color}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Size Selection - only for products with Color / Size format */}
                      {selectedVariant && selectedProduct.variants.some(v => v.title.includes(' / ')) && (
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3">Size</h4>
                          <div className="flex flex-wrap gap-3">
                            {getSizesForColor(selectedProduct.variants, extractColorFromVariant(selectedVariant.title)).map((variant) => {
                              const size = extractSizeFromVariant(variant.title);
                              const isSelected = selectedVariant.id === variant.id;
                              return (
                                <button
                                  key={variant.id}
                                  onClick={() => setSelectedVariant(variant)}
                                  className={`px-4 py-2 rounded-lg border-2 transition-all min-w-[60px] ${isSelected
                                    ? "border-primary bg-primary/10 font-semibold"
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

                      {/* Quantity */}
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Quantity</h4>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        size="lg"
                        onClick={() => setCurrentStep('mockup')}
                        disabled={!selectedVariant}
                        className="w-full"
                      >
                        Continue to Mockup
                      </Button>
                    </Card>
                  )}

                  {/* Fallback: Show Continue button when product selected but no variants available */}
                  {selectedProduct && selectedProduct.variants.filter(v => v.is_enabled).length === 0 && (
                    <Card className="max-w-2xl mx-auto p-6 text-center space-y-4">
                      <p className="text-muted-foreground">
                        No color/size options available for this product. You can continue directly.
                      </p>
                      <Button
                        size="lg"
                        onClick={() => {
                          if (selectedProduct.variants.length > 0 && !selectedVariant) {
                            setSelectedVariant(selectedProduct.variants[0]);
                          }
                          setCurrentStep('mockup');
                        }}
                        className="w-full"
                      >
                        Continue to Mockup
                      </Button>
                    </Card>
                  )}
                </section>
              )}

              {/* Step 4: Create Mockup (auto-generates) */}
              {currentStep === 'mockup' && (
                <section className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-foreground mb-2">Step 4: Creating Your Mockup</h2>
                    <p className="text-muted-foreground">
                      {mockupError ? "Something went wrong" : "Generating preview of your product..."}
                    </p>
                  </div>

                  {generatingMockup ? (
                    <div className="flex justify-center py-12">
                      <div className="text-center space-y-4 max-w-md">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-foreground font-medium italic transition-all duration-500">{snarkyMockup}</p>
                        <p className="text-xs text-muted-foreground">This may take 15-30 seconds</p>
                        {mockupTimeout && (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              setGeneratingMockup(false);
                              setMockupPreview(null);
                              setCurrentStep('review');
                              toast.info("Skipped AI mockup — showing design preview.");
                            }}
                          >
                            Skip to Preview →
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : mockupError ? (
                    <Card className="max-w-2xl mx-auto p-8 text-center space-y-4">
                      <p className="text-destructive font-medium">{mockupError}</p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <Button size="lg" onClick={() => { setMockupError(null); generateMockup(); }}>
                          Try Again
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => {
                          setMockupError(null);
                          setCurrentStep('review');
                          toast.info("Skipped AI mockup — showing design preview.");
                        }}>
                          Continue to Review
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => setCurrentStep('product')}>
                          Back to Products
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div className="flex justify-center py-12">
                      <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Starting mockup generation...</p>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Step 5: Review & Order */}
              {currentStep === 'review' && approvedDesign && selectedProduct && selectedVariant && (
                <section className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-foreground mb-2">Step 5: Review Your Product</h2>
                    <p className="text-muted-foreground">Your custom product is ready!</p>
                  </div>

                  {/* Mockup Display */}
                  <Card className="max-w-4xl mx-auto p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Product Mockup - This is what will be in the order */}
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Product Preview</p>

                        <div className="relative aspect-square rounded-lg border border-border overflow-hidden bg-secondary">
                          {mockupPreview ? (
                            <img
                              src={mockupPreview}
                              alt="Product mockup"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            // Fallback: CSS composite — design overlaid on product template
                            // Only used if AI generation was skipped or failed
                            <>
                              {(() => {
                                const rawImg = selectedProduct.images?.[0];
                                const catalogUrl = rawImg ? (typeof rawImg === 'string' ? rawImg : (rawImg as any).src || (rawImg as any).url || '') : '';
                                const fallbackImg = selectedProduct.template_image_url ||
                                  (selectedProduct.title.toLowerCase().includes('blanket') ? personalizationBlanketFallback : '') ||
                                  catalogUrl;
                                return fallbackImg ? (
                                  <>
                                    <img
                                      src={fallbackImg}
                                      alt="Product template"
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center p-12">
                                      <img
                                        src={approvedDesign.imageUrl}
                                        alt="Your design"
                                        className="max-w-[70%] max-h-[70%] object-contain opacity-90"
                                        style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" }}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <img
                                    src={approvedDesign.imageUrl}
                                    alt="Your design"
                                    className="w-full h-full object-contain p-4"
                                  />
                                );
                              })()}
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          {mockupPreview
                            ? "This is how your product will look"
                            : selectedProduct.template_image_url || selectedProduct.images?.[0]
                              ? "Approximate preview — AI mockup was unavailable"
                              : "Design preview — product mockup unavailable"
                          }
                        </p>

                        {/* Virtual Try-On Preview (if generated) */}
                        {tryOnMockup && isApparelProduct(selectedProduct) && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">Virtual Try-On</p>
                            <img
                              src={tryOnMockup}
                              alt="Try-on preview"
                              className="w-full rounded-lg border border-border"
                            />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{selectedProduct.title}</h3>
                          <p className="text-muted-foreground">{selectedProduct.brand}</p>
                        </div>

                        <div className="space-y-2">
                          <p><span className="font-semibold">Color:</span> {extractColorFromVariant(selectedVariant.title)}</p>
                          {(() => {
                            const size = extractSizeFromVariant(selectedVariant.title);
                            // Only show Size if a real size was extracted (not just the raw title echoed back)
                            return size !== selectedVariant.title ? (
                              <p><span className="font-semibold">Size:</span> {size}</p>
                            ) : null;
                          })()}
                          <p><span className="font-semibold">Quantity:</span> {quantity}</p>
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-sm text-muted-foreground">Price per item</p>
                          <p className="text-3xl font-black text-foreground">
                            ${selectedProduct.retail_price.toFixed(2)}
                          </p>
                          {quantity > 1 && (
                            <p className="text-sm text-muted-foreground">
                              Total: ${(selectedProduct.retail_price * quantity).toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Button
                            size="lg"
                            onClick={proceedToCheckout}
                            disabled={creatingPrintifyProduct}
                            className="w-full"
                          >
                            {creatingPrintifyProduct ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating Product...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Continue to Checkout
                              </>
                            )}
                          </Button>

                          {/* Virtual Try-On - Only for apparel products */}
                          {!tryOnMockup && isApparelProduct(selectedProduct) && (
                            <div>
                              <label className="block">
                                <Button variant="outline" size="lg" className="w-full" asChild>
                                  <span className="cursor-pointer">
                                    <Camera className="mr-2 h-5 w-5" />
                                    Virtual Try-On
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleUserPhotoUpload}
                                      className="hidden"
                                      disabled={generatingTryOn}
                                    />
                                  </span>
                                </Button>
                              </label>
                              <p className="text-xs text-muted-foreground text-center mt-2">
                                Upload your photo to see how it looks on you
                              </p>
                              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card/50 border border-border rounded-lg px-3 py-2 text-left mt-2">
                                <span className="text-sm leading-none mt-0.5">🔒</span>
                                <p>
                                  <span className="font-bold text-foreground">We're Snarky. Not Shady.</span>{" "}
                                  Your photo is not stored, sold, or shared.
                                </p>
                              </div>
                            </div>
                          )}

                          {generatingTryOn && (
                            <div className="flex flex-col items-center justify-center gap-2 text-center max-w-sm mx-auto">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              <span className="text-sm text-foreground font-medium italic">{snarkyTryOn}</span>
                            </div>
                          )}

                          {tryOnMockup && isApparelProduct(selectedProduct) && (
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setTryOnMockup(null);
                                setUserPhoto(null);
                              }}
                              className="w-full"
                            >
                              Clear Try-On
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Edit Options */}
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => {
                      setMockupPreview(null);
                      setCurrentStep('product');
                    }}>
                      Change Product
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setApprovedDesign(null);
                      setMockupPreview(null);
                      setCurrentStep('approve');
                    }}>
                      Change Design
                    </Button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
