/**
 * Designs hidden from the shop grid, /designs page, and search results.
 * Matched case-insensitively against title, description, and image_url.
 */
export const HIDDEN_DESIGN_PATTERNS: string[] = [
  // Hispanic Heritage Month
  "Hispanic",
  "Historia, Cultura, Orgullo",
  "Culture & Pride",
  "Celebrate, Honor, Inspire",
  "national-hispanic-heritage-month",
  // Labor Day (all 9 designs)
  "Labor Day",
  "labor-day",
  "Back to Work Tomorrow",
  "World Takes All the Credit",
  "Pretend to Love Workers",
  "Fueled by Caffeine & Deadlines",
  "One Day They Thank Us",
  "Deserves More Than a Holiday",
  "Well-Deserved Nap",
  "Adulting Is Hard",
  "Stronger Than My Paycheck",
  // Grandparents Day (all 4 designs)
  "Grandparents Day",
  "Grandparents",
  "happy-grandparents-day",
  "Awesome in Aging",
  "Professional Spoilers",
  "Older, Wiser, Zero Filter",
  "Bench Warmth",
  // Patriot Day & 9/11 (all 2 designs)
  "Patriot Day",
  "9/11",
  "9-11",
  "We Will Never Forget",
  "United We Stand",
  // Summer / Parents Day / Other hidden seasonal designs
  "I Scream, You Scream",
  "Ice Cream Day",
  "Just Here for the Ice Cream",
  "Red, White & Scoops",
  "CEOs of Chaos",
  "World's Okayest Parent",
  "Powered by Love",
  "Snacks Are Currency",
  "Raising Humans Is Exhausting",
  "Snarky Humans",
];

export function isHiddenDesign(design: {
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
}): boolean {
  const title = (design.title || "").toLowerCase();
  const description = (design.description || "").toLowerCase();
  const imageUrl = (design.image_url || "").toLowerCase();

  return HIDDEN_DESIGN_PATTERNS.some((pattern) => {
    const p = pattern.toLowerCase();
    return title.includes(p) || description.includes(p) || imageUrl.includes(p);
  });
}
