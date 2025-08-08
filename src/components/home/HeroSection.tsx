import React from "react";
import { PageSection } from "@/components/Layout/PageContainer";
import { safeInterpolateTranslation } from "@/utils/sanitize";
import { PersonalizedQuoteDisplay } from "@/components/ui/personalized-quote-display";

interface HeroSectionProps {
  greeting: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ greeting }) => {
  return (
    <PageSection className="text-center">
      <div className="space-y-6 mb-12 animate-enter">
        <h1 className="text-4xl sm:text-5xl font-bold font-cormorant gradient-text">
          {greeting}
        </h1>
        <div className="flex items-center justify-center">
          <PersonalizedQuoteDisplay className="text-lg text-muted-foreground font-inter" interval={4000} />
        </div>
      </div>
    </PageSection>
  );
};

export default HeroSection;
