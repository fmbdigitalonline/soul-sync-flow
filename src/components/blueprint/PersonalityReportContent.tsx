
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PersonalityReportCard } from "./PersonalityReportCard";
import { PersonalityReport } from "@/services/ai-personality-report-service";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface PersonalityReportContentProps {
  report: PersonalityReport;
}

export const PersonalityReportContent: React.FC<PersonalityReportContentProps> = ({
  report
}) => {
  const { isMobile } = useResponsiveLayout();

  return (
    <div className="w-full max-w-full overflow-hidden">
      <ScrollArea className={`w-full max-w-full overflow-hidden ${isMobile ? "h-[60vh]" : "h-[70vh]"}`}>
        <div className="space-y-6 w-full max-w-full overflow-hidden pr-4">
          <PersonalityReportCard
            title="Your Core Personality Pattern"
            content={report.report_content.core_personality_pattern}
            isHighlighted={true}
          />

          <PersonalityReportCard
            title="How You Make Decisions"
            content={report.report_content.decision_making_style}
          />

          <PersonalityReportCard
            title="Your Relationship Style"
            content={report.report_content.relationship_style}
          />

          <PersonalityReportCard
            title="Your Life Path & Purpose"
            content={report.report_content.life_path_purpose}
          />

          <PersonalityReportCard
            title="Current Energy & Timing"
            content={report.report_content.current_energy_timing}
          />

          <PersonalityReportCard
            title="Integrated Summary"
            content={report.report_content.integrated_summary}
            isHighlighted={true}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
