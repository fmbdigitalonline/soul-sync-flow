
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";

interface MBTIProfileSectionProps {
  mbtiData: BlueprintData["cognition_mbti"];
}

const MBTIProfileSection: React.FC<MBTIProfileSectionProps> = ({ mbtiData }) => {
  return (
    <BlueprintSection id="mbti" title="MBTI Profile" defaultExpanded={true}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="outline" className="bg-soul-purple/10">{mbtiData.type}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Keywords:</span>
          <span>{mbtiData.core_keywords.join(", ")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dominant Function:</span>
          <span>{mbtiData.dominant_function}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Auxiliary Function:</span>
          <span>{mbtiData.auxiliary_function}</span>
        </div>
        <div className="mt-2 text-sm">
          <p className="text-muted-foreground">Your MBTI type indicates you're likely:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Drawn to {mbtiData.type.startsWith('I') ? 'inner reflection' : 'external interaction'}</li>
            <li>Processing information through {mbtiData.type.includes('N') ? 'patterns and possibilities' : 'concrete details'}</li>
            <li>Making decisions based on {mbtiData.type.includes('F') ? 'personal values and harmony' : 'logical analysis'}</li>
            <li>{mbtiData.type.includes('J') ? 'Structured and organized' : 'Flexible and spontaneous'} in approach</li>
          </ul>
        </div>
      </div>
    </BlueprintSection>
  );
};

export default MBTIProfileSection;
