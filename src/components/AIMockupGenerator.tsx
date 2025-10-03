import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIMockupGeneratorProps {
  productImage: string;
}

export const AIMockupGenerator = ({ productImage }: AIMockupGeneratorProps) => {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [mockupImage, setMockupImage] = useState<string | null>(null);
  const { toast } = useToast();

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
      const { data, error } = await supabase.functions.invoke("generate-mockup", {
        body: {
          userImage,
          productImage,
        },
      });

      if (error) throw error;

      if (data?.image) {
        setMockupImage(data.image);
        toast({
          title: "Success!",
          description: "Your mockup has been generated",
        });
      }
    } catch (error: any) {
      console.error("Error generating mockup:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate mockup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-foreground">Try It On with AI</h3>
        <p className="text-muted-foreground">
          Upload your photo and see how this product looks on you!
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
                  Click to upload your photo
                </span>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <img
                src={userImage}
                alt="Your photo"
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
                      Generating...
                    </>
                  ) : (
                    "Generate Mockup"
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

        {mockupImage && (
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-bold text-foreground">Your Mockup</h4>
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
