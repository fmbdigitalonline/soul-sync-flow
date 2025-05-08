
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";

interface ChineseZodiacSectionProps {
  chinese: BlueprintData["archetype_chinese"];
}

const ChineseZodiacSection: React.FC<ChineseZodiacSectionProps> = ({ chinese }) => {
  return (
    <BlueprintSection id="chinese" title="Chinese Zodiac" defaultExpanded={true}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Animal Sign:</span>
          <Badge variant="outline" className="bg-soul-purple/10">
            {chinese.element} {chinese.animal}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Yin/Yang:</span>
          <span>{chinese.yin_yang}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Keyword:</span>
          <span>{chinese.keyword}</span>
        </div>
        {chinese.element_characteristic && (
          <div className="mt-2">
            <p className="text-muted-foreground mb-1">Element Influence:</p>
            <p className="text-sm bg-soul-purple/5 p-3 rounded-md">
              {chinese.element_characteristic}
            </p>
          </div>
        )}
        {chinese.personality_profile && (
          <div className="mt-2">
            <p className="text-muted-foreground mb-1">Personality Profile:</p>
            <p className="text-sm bg-soul-purple/5 p-3 rounded-md">
              {chinese.personality_profile}
            </p>
          </div>
        )}
        {chinese.compatibility && (
          <div className="mt-2">
            <p className="text-muted-foreground mb-1">Compatibility:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Best Match: </span>
                {chinese.compatibility.best.join(", ")}
              </div>
              {chinese.compatibility.worst && (
                <div>
                  <span className="text-muted-foreground">Challenging: </span>
                  {chinese.compatibility.worst.join(", ")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BlueprintSection>
  );
};

export default ChineseZodiacSection;
