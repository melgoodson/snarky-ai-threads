import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSnarkyLoader } from "@/hooks/useSnarkyLoader";

interface AIMockupGeneratorProps {
  productImage: string;
  productTitle?: string;
  productColor?: string;
}

function isWearable(title: string): boolean {
  const lower = title.toLowerCase();
  return (
    lower.includes('shirt') ||
    lower.includes('tee') ||
    lower.includes('hoodie') ||
    lower.includes('sweatshirt') ||
    lower.includes('jersey')
  );
}

function getProductLabel(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('mug')) return 'Mug';
  if (lower.includes('card') || lower.includes('greeting')) return 'Card';
  if (lower.includes('tote') || lower.includes('bag')) return 'Tote Bag';
  if (lower.includes('blanket')) return 'Blanket';
  if (lower.includes('candle')) return 'Candle';
  if (lower.includes('hoodie') || lower.includes('sweatshirt')) return 'Hoodie';
  return 'Shirt';
}

export const AIMockupGenerator = ({ productImage, productTitle, productColor }: AIMockupGeneratorProps) => {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [mockupImage, setMockupImage] = useState<string | null>(null);
  const { toast } = useToast();
  const snarkyMessage = useSnarkyLoader(generating);

  const title = productTitle || "T-Shirt";
  const wearable = isWearable(title);
  const label = getProductLabel(title);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUserImage(reader.result as string);
      setMockupImage(null);
    };
    reader.readAsDataURL(file);
  };

  const generateMockup = async () => {
    if (!userImage) return;

    setGenerating(true);
    try {
      // Convert product image URL to base64
      const response = await fetch(productImage);
      const blob = await response.blob();
      const reader = new FileReader();

      const productImageBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Use different edge functions for wearable vs non-wearable products
      const functionName = wearable ? "generate-mockup" : "generate-user-mockup";

      // Race between the function call and a 45-second timeout
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI generation timed out. Please try again.")), 45000)
      );

      const apiCall = supabase.functions.invoke(functionName, {
        body: {
          userImage,
          productImage: productImageBase64,
          productTitle: title,
          productColor: productColor || "White",
        },
      });

      const { data, error } = await Promise.race([apiCall, timeout]);

      if (error) throw error;

      // generate-mockup returns { image }, generate-user-mockup returns { mockupUrl }
      const resultImage = data?.image || data?.mockupUrl;

      if (resultImage) {
        setMockupImage(resultImage);
        toast({
          title: "Success!",
          description: wearable ? "Your try-on has been generated" : `Your ${label} mockup is ready`,
        });
      } else {
        throw new Error("No image was generated. The AI may be busy — please try again.");
      }
    } catch (error: any) {
      console.error("Error generating mockup:", error);
      const message = error.message?.includes("timed out")
        ? "AI generation timed out. The service may be busy — please try again in a minute."
        : error.message || "Failed to generate mockup. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-foreground">
          {wearable ? "Try It On with AI" : `Preview on ${label}`}
        </h3>
        <p className="text-muted-foreground">
          {wearable
            ? "Upload your photo and see how this product looks on you!"
            : `Upload a design and see how it looks on a ${label.toLowerCase()}!`}
        </p>

        <div className="border-2 border-dashed border-border rounded-lg p-8 space-y-4">
          {!userImage ? (
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading || generating}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {wearable ? "Click to upload your photo" : "Click to upload your design"}
                </span>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <img
                src={userImage}
                alt="Your upload"
                className="max-w-full h-auto rounded-lg mx-auto max-h-96"
              />
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={generateMockup}
                  disabled={generating}
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-sm">{snarkyMessage}</span>
                    </>
                  ) : (
                    wearable ? "Generate Try-On" : `Generate ${label} Mockup`
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserImage(null);
                    setMockupImage(null);
                  }}
                  disabled={generating}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Privacy disclaimer */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card/50 border border-border rounded-lg px-4 py-3 text-left">
          <span className="text-base leading-none mt-0.5">🔒</span>
          <p>
            <span className="font-bold text-foreground">We're Snarky. Not Shady.</span>{" "}
            Your photo is used only for your custom design — not stored, not sold, not shared.
            The only thing we're doing is making something awesome for you!
          </p>
        </div>

        {mockupImage && (
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-bold text-foreground">
              {wearable ? "Your Try-On" : `Your ${label} Mockup`}
            </h4>
            <img
              src={mockupImage}
              alt="Generated mockup"
              className="max-w-full h-auto rounded-lg mx-auto border border-border"
            />
          </div>
        )}
      </div>
    </div>
  );
};
