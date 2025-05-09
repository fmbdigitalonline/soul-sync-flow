
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";

interface MBTIProfileSectionProps {
  mbtiData: BlueprintData["cognition_mbti"];
}

const MBTIProfileSection: React.FC<MBTIProfileSectionProps> = ({ mbtiData }) => {
  // Early return with placeholder if mbtiData is completely missing
  if (!mbtiData) {
    return (
      <BlueprintSection id="mbti" title="MBTI Profile" defaultExpanded={true}>
        <div className="text-center py-4 text-muted-foreground">
          <p>MBTI profile data is not available.</p>
          <p className="text-sm mt-2">Please update your profile settings.</p>
        </div>
      </BlueprintSection>
    );
  }

  // Create safe references with fallbacks
  const mbtiType = mbtiData.type || "Unknown";
  const keywords = Array.isArray(mbtiData.core_keywords) 
    ? mbtiData.core_keywords.join(", ") 
    : "Not specified";
  const dominantFunction = mbtiData.dominant_function || "Not specified";
  const auxiliaryFunction = mbtiData.auxiliary_function || "Not specified";
  
  // Determine personality traits safely with explicit string checks
  const isIntroverted = typeof mbtiType === 'string' && mbtiType.startsWith('I');
  const isIntuitive = typeof mbtiType === 'string' && mbtiType.includes('N');
  const isFeeling = typeof mbtiType === 'string' && mbtiType.includes('F');
  const isJudging = typeof mbtiType === 'string' && mbtiType.includes('J');
  
  // Check if we have a valid MBTI type (should be 4 letters)
  const hasValidType = typeof mbtiType === 'string' && /^[EI][NS][FT][JP]$/.test(mbtiType);
  
  return (
    <BlueprintSection id="mbti" title="MBTI Profile" defaultExpanded={true}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="outline" className="bg-soul-purple/10">{mbtiType}</Badge>
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
          {hasValidType ? (
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
