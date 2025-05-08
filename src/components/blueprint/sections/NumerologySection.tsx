
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";
import TooltipLabel from "../TooltipLabel";

interface NumerologySectionProps {
  numerology: BlueprintData["values_life_path"];
}

const NumerologySection: React.FC<NumerologySectionProps> = ({ numerology }) => {
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
              {numerology.life_path_number}
            </Badge>
          </div>
          <div className="ml-4">
            <div className="flex gap-1 text-sm">
              <span className="text-muted-foreground">Keyword:</span>
              <span>{numerology.life_path_keyword}</span>
            </div>
            {numerology.life_path_description && (
              <div className="text-sm mt-1">
                <span className="text-muted-foreground">Meaning:</span>
                <p className="mt-1">{numerology.life_path_description}</p>
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
              <span>{numerology.expression_number}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Keyword: </span>
              <span>{numerology.expression_keyword}</span>
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
              <span>{numerology.soul_urge_number}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Keyword: </span>
              <span>{numerology.soul_urge_keyword}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {numerology.birth_day_number && (
            <div className="bg-soul-purple/5 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <TooltipLabel 
                    label="Birth Day Number" 
                    tooltipContent="The specific day of your birth" 
                  />
                </div>
                <span>{numerology.birth_day_number}</span>
              </div>
              {numerology.birth_day_meaning && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Meaning: </span>
                  <span>{numerology.birth_day_meaning}</span>
                </div>
              )}
            </div>
          )}

          {numerology.personal_year && (
            <div className="bg-soul-purple/5 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <TooltipLabel 
                    label="Personal Year" 
                    tooltipContent="Your annual cycle" 
                  />
                </div>
                <span>{numerology.personal_year}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </BlueprintSection>
  );
};

export default NumerologySection;
