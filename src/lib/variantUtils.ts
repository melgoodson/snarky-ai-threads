import personalizationBlanketFallback from "@/assets/personalization-blanket.png";

// Core size ordering
export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL', '11OZ', '15OZ'];

export const isSize = (str: string): boolean => {
  const normalized = str.trim().toUpperCase();
  return SIZE_ORDER.includes(normalized) || looksLikeSize(str);
};

export const getSizeOrderIndex = (size: string): number => {
  const normalized = size.trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(normalized);
  return index === -1 ? 999 : index;
};

// Helper: check if a string looks like a size value
export const looksLikeSize = (val: string): boolean => {
  const v = val.trim().toLowerCase();
  if (/^\d+oz$/i.test(v)) return true;                   // 15oz, 11oz
  if (/^\d*x?[sml]$/i.test(v)) return true;              // S, M, L, XS, XL
  if (/^\d+xl$/i.test(v)) return true;                   // 2XL, 3XL
  if (/^one size$/i.test(v)) return true;                // One size
  if (/\d+["″]?\s*[x×]\s*\d+/i.test(v)) return true;   // 30" × 40", 6.9" x 4.9", 15" x 16"
  return false;
};

// Helper: check if a string looks like a quantity ("1 pc", "10 pcs")
export const looksLikeQuantity = (val: string): boolean => {
  return /^\d+\s*(pcs?|pieces?|pack|cards?)?s?\s*$/i.test(val.trim());
};

// Helper: check if a string looks like a style/finish (not color or size)
export const looksLikeStyle = (val: string): boolean => {
  const v = val.trim().toLowerCase();
  const styles = ['glossy', 'matte', 'coated (both sides)', 'coated (one side)', 'uncoated'];
  return styles.includes(v);
};

// Strip trailing quantity like "1 pc", "5 pcs", "10 pack" from variant titles.
// Printify greeting card variants look like: "6.9" x 4.9" / Glossy / 1 pc"
export const stripQuantitySuffix = (s: string): string => {
  return s.replace(/\s*\/\s*\d+\s*(pcs?|pieces?|pack|cards?)?s?\s*$/i, '').trim();
};

export const extractColorFromVariant = (variantTitle: string): string => {
  const cleaned = stripQuantitySuffix(variantTitle);
  const parts = cleaned.split('/').map(p => p.trim());
  if (parts.length === 1) {
    // Single-dimension variant (e.g. just a size like "S" or format like "4×6")
    return parts[0];
  }
  if (parts.length === 2) {
    if (isSize(parts[0])) return parts[1]; // "S / Black" → "Black"
    if (isSize(parts[1])) return parts[0]; // "Black / S" → "Black"
    return parts[0];                       // "6.9" x 4.9" / Glossy" → "6.9" x 4.9""
  }
  // 3+ parts
  return parts[0];
};

export const extractSizeFromVariant = (variantTitle: string): string => {
  const cleaned = stripQuantitySuffix(variantTitle);
  const parts = cleaned.split('/').map(p => p.trim());
  if (parts.length === 2) {
    if (isSize(parts[0])) return parts[0];
    if (isSize(parts[1])) return parts[1];
    return parts[1];
  }
  // Don't fabricate a size — return the raw title so callers can detect "no real size"
  return variantTitle;
};

// Core shirt colours — case-insensitive whitelist to keep the picker tidy.
export const BASIC_SHIRT_COLORS_LOWER = [
  'white', 'black', 'navy', 'gray', 'grey', 'heather gray', 'heather grey',
  'red', 'royal blue', 'forest green', 'dark heather', 'sport grey',
  'charcoal', 'ash', 'military green', 'maroon', 'purple', 'gold',
];

export const getUniqueColors = (variants: any[], productTitle?: string): string[] => {
  const enabledVariants = variants.filter(v => v.is_enabled);
  const colors = enabledVariants.map(v => extractColorFromVariant(v.title));
  const unique = [...new Set(colors)];

  const t = (productTitle || '').toLowerCase();

  if (t.includes('tee') || t.includes('shirt') || t.includes('hoodie') || t.includes('sweatshirt')) {
    // Case-insensitive whitelist match; fall back to first 8 if nothing matches
    const filtered = unique.filter(c =>
      BASIC_SHIRT_COLORS_LOWER.includes(c.toLowerCase())
    );
    return filtered.length > 0 ? filtered : unique.slice(0, 8);
  }

  if (t.includes('card') || t.includes('greeting')) {
    // Greeting card variants are size/finish combos — cap at 6 clearest options
    return unique.slice(0, 6);
  }

  return unique;
};

export const getSizesForColor = (variants: any[], color: string): any[] => {
  return variants
    .filter(v => v.is_enabled && extractColorFromVariant(v.title) === color)
    .sort((a, b) => {
      const sizeA = extractSizeFromVariant(a.title);
      const sizeB = extractSizeFromVariant(b.title);
      return getSizeOrderIndex(sizeA) - getSizeOrderIndex(sizeB);
    });
};

// Parse variants to extract distinct sizes, colors, and styles
export const getAvailableOptions = (variants: any[], productTitle?: string) => {
  if (!variants) return { sizes: [] as string[], colors: [] as string[], styles: [] as string[] };

  const enabledVariants = variants.filter((v: any) => v.is_enabled);

  const sizes = new Set<string>();
  const styles = new Set<string>();
  
  // We use getUniqueColors for colors to respect the whitelist and limits
  const distinctColors = getUniqueColors(variants, productTitle);

  enabledVariants.forEach((variant: any) => {
    const parts = variant.title.split(' / ').map((p: string) => p.trim());
    parts.forEach((part: string) => {
      if (looksLikeQuantity(part)) return; // Skip quantity parts like "1 pc"
      if (looksLikeSize(part)) {
        sizes.add(part);
      } else if (looksLikeStyle(part)) {
        styles.add(part);
      }
    });
  });

  return {
    sizes: Array.from(sizes).sort((a, b) => getSizeOrderIndex(a) - getSizeOrderIndex(b)),
    colors: distinctColors, // already sorted/filtered by getUniqueColors
    styles: Array.from(styles).sort(),
  };
};

export const isApparelProduct = (product: any | null | undefined, titleOverride?: string): boolean => {
  if (!product && !titleOverride) return false;
  const category = ((product?.category) || '').toLowerCase();
  const title = (titleOverride || (product?.title) || '').toLowerCase();

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

  // Default to false for unknown categories
  return false;
};

// Color name → hex mapping for visual swatches
export const COLOR_HEX_MAP: Record<string, string> = {
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
  "Tweed": "#C3B091",
  "Rustique": "#B7410E",
};

export const getBlankMockup = (templateImageUrl: string | undefined, title: string) => {
  const t = title.toLowerCase();
  if (t.includes('hoodie') || t.includes('sweatshirt')) return '/images/hoodie-mockup.png';
  if (t.includes('mug')) return '/images/mug-mockup.png';
  if (t.includes('card') || t.includes('greeting')) return '/images/greeting-card-mockup.png';
  if (t.includes('tote') || t.includes('bag')) return '/images/tote-mockup.png';
  if (t.includes('tee') || t.includes('shirt')) return '/images/shirt-mockup.png';
  if (t.includes('blanket')) return personalizationBlanketFallback;
  // Unknown product type — fall back to whatever Printify gave us
  return templateImageUrl || '';
};

export const getProductType = (title: string): string => {
  const lower = title.toLowerCase();
  if (lower.includes('hoodie') || lower.includes('sweatshirt')) return 'hoodie';
  if (lower.includes('tee') || lower.includes('shirt')) return 'tee';
  if (lower.includes('mug')) return 'mug';
  if (lower.includes('tote') || lower.includes('bag')) return 'tote';
  if (lower.includes('card') || lower.includes('greeting')) return 'card';
  if (lower.includes('blanket')) return 'unknown'; // HIDDEN: investigating print quality
  return 'unknown';
};

export const assignDonorVariants = (allProducts: any[]): any[] => {
  // Find donor products (those with the most enabled variants per type)
  const donorByType: Record<string, any> = {};
  for (const p of allProducts) {
    const type = getProductType(p.title);
    const enabledCount = (p.variants || []).filter((v: any) => v.is_enabled).length;
    if (enabledCount > 0) {
      const currentDonor = donorByType[type];
      const currentDonorCount = currentDonor ? (currentDonor.variants || []).filter((v: any) => v.is_enabled).length : 0;
      if (enabledCount > currentDonorCount) {
        donorByType[type] = p;
      }
    }
  }

  // Always give every product the best (largest) variant set for its type.
  // This ensures the display product shows all colours even if its own
  // Printify placeholder was configured with only one colour.
  for (const p of allProducts) {
    const type = getProductType(p.title);
    const donor = donorByType[type];
    
    if (donor && donor.id !== p.id && donor.variants && p.variants) {
      const donorEnabledCount = donor.variants.filter((v: any) => v.is_enabled).length;
      const targetEnabledCount = p.variants.filter((v: any) => v.is_enabled).length;
      
      if (donorEnabledCount > targetEnabledCount) {
        console.log(`Assigning ${donorEnabledCount} variants from "${donor.title}" to "${p.title}"`);
        p.variants = [...donor.variants];
      }
    }
  }
  return allProducts;
};
