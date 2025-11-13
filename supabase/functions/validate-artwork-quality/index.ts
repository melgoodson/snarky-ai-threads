import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Quality requirements for different products
const PRODUCT_REQUIREMENTS = {
  tshirt: { minWidth: 3600, minHeight: 4800, dpi: 300, printSize: "12x16 inches" },
  hoodie: { minWidth: 3600, minHeight: 4800, dpi: 300, printSize: "12x16 inches" },
  mug: { minWidth: 2400, minHeight: 1050, dpi: 300, printSize: "8x3.5 inches" },
  card: { minWidth: 1500, minHeight: 2100, dpi: 300, printSize: "5x7 inches" },
  tote: { minWidth: 4500, minHeight: 4500, dpi: 300, printSize: "15x15 inches" },
};

async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Check if it's a PNG
    if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) {
      // PNG format - IHDR chunk at bytes 16-24
      const width = (uint8Array[16] << 24) | (uint8Array[17] << 16) | (uint8Array[18] << 8) | uint8Array[19];
      const height = (uint8Array[20] << 24) | (uint8Array[21] << 16) | (uint8Array[22] << 8) | uint8Array[23];
      return { width, height };
    }

    // Check if it's a JPEG
    if (uint8Array[0] === 0xff && uint8Array[1] === 0xd8) {
      let offset = 2;
      while (offset < uint8Array.length) {
        if (uint8Array[offset] !== 0xff) break;
        const marker = uint8Array[offset + 1];
        
        // SOF markers (Start of Frame)
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          const height = (uint8Array[offset + 5] << 8) | uint8Array[offset + 6];
          const width = (uint8Array[offset + 7] << 8) | uint8Array[offset + 8];
          return { width, height };
        }
        
        const length = (uint8Array[offset + 2] << 8) | uint8Array[offset + 3];
        offset += length + 2;
      }
    }

    throw new Error("Unsupported image format or corrupted file");
  } catch (error) {
    console.error("Error reading image dimensions:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, productType } = await req.json();

    if (!imageUrl || !productType) {
      return new Response(
        JSON.stringify({ error: "imageUrl and productType are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requirements = PRODUCT_REQUIREMENTS[productType as keyof typeof PRODUCT_REQUIREMENTS];
    
    if (!requirements) {
      return new Response(
        JSON.stringify({ error: "Invalid product type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Validating artwork for ${productType}...`);
    
    // Get image dimensions
    const { width, height } = await getImageDimensions(imageUrl);
    
    console.log(`Image dimensions: ${width}x${height}`);
    console.log(`Required: ${requirements.minWidth}x${requirements.minHeight} (${requirements.dpi} DPI for ${requirements.printSize})`);

    // Check if dimensions meet requirements
    const meetsWidth = width >= requirements.minWidth;
    const meetsHeight = height >= requirements.minHeight;
    const passes = meetsWidth && meetsHeight;

    // Calculate actual DPI based on print size
    const actualDPI = Math.min(
      width / parseFloat(requirements.printSize.split("x")[0]),
      height / parseFloat(requirements.printSize.split("x")[1])
    );

    const result = {
      passes,
      width,
      height,
      requiredWidth: requirements.minWidth,
      requiredHeight: requirements.minHeight,
      actualDPI: Math.round(actualDPI),
      requiredDPI: requirements.dpi,
      printSize: requirements.printSize,
      warnings: [] as string[],
    };

    if (!meetsWidth) {
      result.warnings.push(`Width ${width}px is below required ${requirements.minWidth}px`);
    }
    if (!meetsHeight) {
      result.warnings.push(`Height ${height}px is below required ${requirements.minHeight}px`);
    }
    if (!passes) {
      result.warnings.push(`Image may appear pixelated or blurry when printed at ${requirements.printSize}`);
    }

    console.log("Quality check result:", result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in validate-artwork-quality:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
