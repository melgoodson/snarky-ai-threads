import { trackEvent } from "@/utils/ga4";

export const AI_CUSTOM_CLOTHING_PATH = "/ai-custom-clothing";
export const AI_CUSTOM_CLOTHING_HOW_IT_WORKS_PATH = `${AI_CUSTOM_CLOTHING_PATH}#how-it-works`;

export const trackAiLandingInternalClick = (
  location: string,
  linkUrl: string,
  linkText: string,
) => {
  trackEvent("ai_landing_internal_cta_click", {
    location,
    link_url: linkUrl,
    link_text: linkText,
  });
};
