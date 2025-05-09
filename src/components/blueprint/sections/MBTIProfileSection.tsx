
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
  
  return (
    <BlueprintSection id="mbti" title="MBTI Profile" defaultExpanded={true}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="outline" className="bg-soul-purple/10">{mbtiType || "Unknown"}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Keywords:</span>
          <span>{mbtiData?.core_keywords?.join(", ") || "Not specified"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dominant Function:</span>
          <span>{mbtiData?.dominant_function || "Not specified"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Auxiliary Function:</span>
          <span>{mbtiData?.auxiliary_function || "Not specified"}</span>
        </div>
        <div className="mt-2 text-sm">
          <p className="text-muted-foreground">Your MBTI type indicates you're likely:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Drawn to {mbtiType.startsWith('I') ? 'inner reflection' : 'external interaction'}</li>
            <li>Processing information through {mbtiType.includes('N') ? 'patterns and possibilities' : 'concrete details'}</li>
            <li>Making decisions based on {mbtiType.includes('F') ? 'personal values and harmony' : 'logical analysis'}</li>
            <li>{mbtiType.includes('J') ? 'Structured and organized' : 'Flexible and spontaneous'} in approach</li>
          </ul>
        </div>
      </div>
    </BlueprintSection>
  );
};

export default MBTIProfileSection;
