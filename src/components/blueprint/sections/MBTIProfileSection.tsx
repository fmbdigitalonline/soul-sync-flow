
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";

interface MBTIProfileSectionProps {
  mbtiData: BlueprintData["cognition_mbti"];
}

const MBTIProfileSection: React.FC<MBTIProfileSectionProps> = ({ mbtiData }) => {
  // Safely check if type exists to avoid "undefined" errors
  const mbtiType = mbtiData?.type || "";
  
  // Determine personality traits safely even if type is empty
  const isIntroverted = mbtiType && mbtiType.startsWith('I');
  const isIntuitive = mbtiType && mbtiType.includes('N');
  const isFeeling = mbtiType && mbtiType.includes('F');
  const isJudging = mbtiType && mbtiType.includes('J');
  
  // Create safe fallbacks for all values
  const keywords = mbtiData?.core_keywords?.join(", ") || "Not specified";
  const dominantFunction = mbtiData?.dominant_function || "Not specified";
  const auxiliaryFunction = mbtiData?.auxiliary_function || "Not specified";
  
  return (
    <BlueprintSection id="mbti" title="MBTI Profile" defaultExpanded={true}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="outline" className="bg-soul-purple/10">{mbtiType || "Unknown"}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Keywords:</span>
          <span>{keywords}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dominant Function:</span>
          <span>{dominantFunction}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Auxiliary Function:</span>
          <span>{auxiliaryFunction}</span>
        </div>
        <div className="mt-2 text-sm">
          {mbtiType ? (
            <>
              <p className="text-muted-foreground">Your MBTI type indicates you're likely:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Drawn to {isIntroverted ? 'inner reflection' : 'external interaction'}</li>
                <li>Processing information through {isIntuitive ? 'patterns and possibilities' : 'concrete details'}</li>
                <li>Making decisions based on {isFeeling ? 'personal values and harmony' : 'logical analysis'}</li>
                <li>{isJudging ? 'Structured and organized' : 'Flexible and spontaneous'} in approach</li>
              </ul>
            </>
          ) : (
            <p className="text-muted-foreground">Please provide your MBTI type in the profile settings for more detailed insights.</p>
          )}
        </div>
      </div>
    </BlueprintSection>
  );
};

export default MBTIProfileSection;
