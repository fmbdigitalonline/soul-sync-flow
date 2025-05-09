
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";
import TooltipLabel from "../TooltipLabel";

interface NumerologySectionProps {
  numerology: BlueprintData["values_life_path"];
}

const NumerologySection: React.FC<NumerologySectionProps> = ({ numerology }) => {
  // Early return with placeholder if numerology is completely missing
  if (!numerology) {
    return (
      <BlueprintSection id="numerology" title="Numerology" defaultExpanded={true}>
        <div className="text-center py-4 text-muted-foreground">
          <p>Numerology data is not available.</p>
          <p className="text-sm mt-2">Please update your profile settings.</p>
        </div>
      </BlueprintSection>
    );
  }

  // Create safe references with fallbacks
  const lifePathNumber = numerology.life_path_number || "N/A";
  const lifePathKeyword = numerology.life_path_keyword || "Unknown";
  const lifePathDescription = numerology.life_path_description || "No description available.";
  const birthDayNumber = numerology.birth_day_number;
  const birthDayMeaning = numerology.birth_day_meaning || "No meaning available.";
  const personalYear = numerology.personal_year;
  const expressionNumber = numerology.expression_number || "N/A";
  const expressionKeyword = numerology.expression_keyword || "Unknown";
  const soulUrgeNumber = numerology.soul_urge_number || "N/A";
  const soulUrgeKeyword = numerology.soul_urge_keyword || "Unknown";

  return (
    <BlueprintSection id="numerology" title="Numerology" defaultExpanded={true}>
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-soul-purple/5 p-3 rounded-md">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <TooltipLabel 
                label="Life Path Number" 
                tooltipContent="Calculated from your birth date, represents your life purpose and journey" 
              />
            </div>
            <Badge variant="outline" className="bg-soul-purple/10">
              {lifePathNumber}
            </Badge>
          </div>
          <div className="ml-4">
            <div className="flex gap-1 text-sm">
              <span className="text-muted-foreground">Keyword:</span>
              <span>{lifePathKeyword}</span>
            </div>
            {lifePathDescription && (
              <div className="text-sm mt-1">
                <span className="text-muted-foreground">Meaning:</span>
                <p className="mt-1">{lifePathDescription}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-soul-purple/5 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <TooltipLabel 
                  label="Expression Number" 
                  tooltipContent="Based on the letters in your full birth name" 
                />
              </div>
              <span>{expressionNumber}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Keyword: </span>
              <span>{expressionKeyword}</span>
            </div>
          </div>

          <div className="bg-soul-purple/5 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <TooltipLabel 
                  label="Soul Urge Number" 
                  tooltipContent="Calculated from the vowels in your name" 
                />
              </div>
              <span>{soulUrgeNumber}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Keyword: </span>
              <span>{soulUrgeKeyword}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {birthDayNumber !== undefined && birthDayNumber !== null && (
            <div className="bg-soul-purple/5 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <TooltipLabel 
                    label="Birth Day Number" 
                    tooltipContent="The specific day of your birth" 
                  />
                </div>
                <span>{birthDayNumber}</span>
              </div>
              {birthDayMeaning && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Meaning: </span>
                  <span>{birthDayMeaning}</span>
                </div>
              )}
            </div>
          )}

          {personalYear !== undefined && personalYear !== null && (
            <div className="bg-soul-purple/5 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <TooltipLabel 
                    label="Personal Year" 
                    tooltipContent="Your annual cycle" 
                  />
                </div>
                <span>{personalYear}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </BlueprintSection>
  );
};

export default NumerologySection;
