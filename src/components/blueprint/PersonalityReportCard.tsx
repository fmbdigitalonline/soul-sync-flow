
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface PersonalityReportCardProps {
  title: string;
  content: string;
  isHighlighted?: boolean;
  icon?: React.ReactNode;
}

export const PersonalityReportCard: React.FC<PersonalityReportCardProps> = ({
  title,
  content,
  isHighlighted = false,
  icon
}) => {
  const { spacing, getTextSize } = useResponsiveLayout();

  return (
    <Card className={`cosmic-card w-full max-w-full overflow-hidden ${isHighlighted ? 'border-soul-purple/20' : ''}`}>
      <CardHeader className={`${spacing.card} w-full max-w-full overflow-hidden`}>
        <CardTitle className={`flex items-center gap-2 ${getTextSize('text-lg')} ${isHighlighted ? 'text-soul-purple' : ''} break-words`}>
          {icon || <Sparkles className="h-5 w-5 text-soul-purple flex-shrink-0" />}
          <span className="break-words min-w-0 flex-1">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className={`${spacing.card} w-full max-w-full overflow-hidden`}>
        <p className={`whitespace-pre-wrap ${getTextSize(isHighlighted ? 'text-base' : 'text-sm')} break-words word-wrap overflow-wrap-anywhere`}>
          {content}
        </p>
      </CardContent>
    </Card>
  );
};
