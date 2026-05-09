import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AI_CUSTOM_CLOTHING_HOW_IT_WORKS_PATH,
  AI_CUSTOM_CLOTHING_PATH,
  trackAiLandingInternalClick,
} from "@/utils/aiLanding";

interface AiCustomGiftCTAProps {
  location: string;
  variant?: "homepage" | "compact";
  className?: string;
  contained?: boolean;
  showSecondary?: boolean;
}

export const AiCustomGiftCTA = ({
  location,
  variant = "compact",
  className,
  contained = true,
  showSecondary,
}: AiCustomGiftCTAProps) => {
  const isHomepage = variant === "homepage";
  const headingId = `ai-custom-gifts-${location.replace(/[^a-z0-9_-]/gi, "-")}`;
  const primaryText = isHomepage ? "Create Your One-of-One Gift" : "Start with AI Custom Gifts";
  const secondaryText = "See How It Works";
  const shouldShowSecondary = showSecondary ?? isHomepage;

  const content = (
    <Card
      className={cn(
        "overflow-hidden border-primary/20 bg-card p-6 shadow-sm",
        isHomepage && "p-6 md:p-8",
      )}
    >
      <div
        className={cn(
          "grid gap-6",
          isHomepage ? "lg:grid-cols-[1fr_auto] lg:items-center" : "md:grid-cols-[1fr_auto] md:items-center",
        )}
      >
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isHomepage ? "New: AI Custom Gifts" : "AI Custom Gifts"}
          </div>
          <h2 id={headingId} className={cn("font-black tracking-tight", isHomepage ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl")}>
            {isHomepage ? "Turn Your Weird Idea Into a One-of-One Gift" : "Want something nobody else has?"}
          </h2>
          <p className="max-w-3xl text-sm md:text-base leading-relaxed text-muted-foreground">
            {isHomepage
              ? "Use AI-assisted customization to turn trends, pet photos, inside jokes, and fashion dreams into custom shirts, hoodies, mugs, blankets, and more."
              : "Turn a trend, inside joke, pet photo, or wild idea into custom clothing and gifts."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 sm:items-start">
          <Button
            asChild
            variant="hero"
            size={isHomepage ? "xl" : "lg"}
            className="group w-full px-4 text-sm sm:w-auto sm:px-8 sm:text-base"
          >
            <Link
              to={AI_CUSTOM_CLOTHING_PATH}
              aria-label={primaryText}
              onClick={() => trackAiLandingInternalClick(location, AI_CUSTOM_CLOTHING_PATH, primaryText)}
            >
              {primaryText}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Button>
          {shouldShowSecondary && (
            <Button
              asChild
              variant="outline"
              size={isHomepage ? "xl" : "lg"}
              className="group w-full px-4 text-sm sm:w-auto sm:px-8 sm:text-base"
            >
              <Link
                to={AI_CUSTOM_CLOTHING_HOW_IT_WORKS_PATH}
                aria-label={secondaryText}
                onClick={() =>
                  trackAiLandingInternalClick(location, AI_CUSTOM_CLOTHING_HOW_IT_WORKS_PATH, secondaryText)
                }
              >
                {secondaryText}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  if (!contained) {
    return (
      <section className={cn("py-2", className)} aria-labelledby={headingId}>
        {content}
      </section>
    );
  }

  return (
    <section className={cn("container px-4 py-8 md:py-10", className)} aria-labelledby={headingId}>
      {content}
    </section>
  );
};
