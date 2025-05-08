
import React from "react";
import BlueprintSection from "../BlueprintSection";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";
import TooltipLabel from "../TooltipLabel";

interface AstrologySectionProps {
  astrology: BlueprintData["archetype_western"];
}

const AstrologySection: React.FC<AstrologySectionProps> = ({ astrology }) => {
  return (
    <BlueprintSection id="astrology" title="Astrological Profile" defaultExpanded={true}>
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-soul-purple/5 p-3 rounded-md">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <TooltipLabel 
                label="Sun Sign" 
                tooltipContent="The sign the Sun was in at the time of your birth, representing your core identity" 
              />
            </div>
            <Badge variant="outline" className="bg-soul-purple/10">
              {astrology.sun_sign}
            </Badge>
          </div>
          <div className="text-sm ml-4">
            <div className="flex gap-1">
              <span className="text-muted-foreground">Keyword:</span>
              <span>{astrology.sun_keyword}</span>
            </div>
            {astrology.sun_dates && (
              <div className="flex gap-1">
                <span className="text-muted-foreground">Dates:</span>
                <span>{astrology.sun_dates}</span>
              </div>
            )}
            {astrology.sun_element && (
              <div className="flex gap-1">
                <span className="text-muted-foreground">Element:</span>
                <span>{astrology.sun_element}</span>
              </div>
            )}
            {astrology.sun_qualities && (
              <div className="flex gap-1">
                <span className="text-muted-foreground">Qualities:</span>
                <span>{astrology.sun_qualities}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-soul-purple/5 p-3 rounded-md">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <TooltipLabel 
                label="Moon Sign" 
                tooltipContent="The sign the Moon was in when you were born, representing your emotional nature" 
              />
            </div>
            <span className="text-right">{astrology.moon_sign}</span>
          </div>
          <div className="text-sm ml-4">
            <div className="flex gap-1">
              <span className="text-muted-foreground">Keyword:</span>
              <span>{astrology.moon_keyword}</span>
            </div>
            {astrology.moon_element && (
              <div className="flex gap-1">
                <span className="text-muted-foreground">Element:</span>
                <span>{astrology.moon_element}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-soul-purple/5 p-3 rounded-md">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <TooltipLabel 
                label="Rising Sign" 
                tooltipContent="The sign that was rising on the eastern horizon at your birth, representing your outer personality" 
              />
            </div>
            <span className="text-right">{astrology.rising_sign}</span>
          </div>
        </div>

        {astrology.aspects && astrology.aspects.length > 0 && (
          <div className="mt-2">
            <p className="text-muted-foreground mb-1">Key Aspects:</p>
            <ul className="text-sm pl-4 list-disc">
              {astrology.aspects.slice(0, 3).map((aspect, i) => (
                <li key={i}>
                  {aspect.planet1} {aspect.type} {aspect.planet2} (orb: {aspect.orb})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </BlueprintSection>
  );
};

export default AstrologySection;
