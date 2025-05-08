
import React, { useState } from "react";
import { BlueprintData } from "@/services/blueprint-service";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Info, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface BlueprintViewerProps {
  blueprint: BlueprintData;
  className?: string;
}

const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ blueprint, className }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    mbti: true,
    humanDesign: false,
    astrology: true,
    chinese: true,
    numerology: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderSection = (id: string, title: string, content: React.ReactNode, showExpandIcon = true) => (
    <div className="mb-6">
      <div 
        className={cn(
          "flex items-center justify-between mb-2 cursor-pointer",
          showExpandIcon && "cursor-pointer"
        )}
        onClick={() => showExpandIcon && toggleSection(id)}
      >
        <h3 className="text-lg font-semibold flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
          {title}
        </h3>
        {showExpandIcon && (
          expandedSections[id] ? 
            <ChevronUp className="h-4 w-4 text-soul-purple" /> : 
            <ChevronDown className="h-4 w-4 text-soul-purple" />
        )}
      </div>
      {(!showExpandIcon || expandedSections[id]) && content}
    </div>
  );

  const renderLabelWithTooltip = (label: string, tooltipContent?: string) => (
    <div className="flex items-center">
      <span className="text-muted-foreground">{label}:</span>
      {tooltipContent && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  return (
    <CosmicCard className={cn("p-6", className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-display">
          <span className="gradient-text">{blueprint.user_meta.preferred_name}'s Soul Blueprint</span>
        </h2>
        <p className="text-muted-foreground mt-2">
          Your unique spiritual DNA and pathway to higher alignment
        </p>
      </div>

      {renderSection("personal", "Personal Information", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Full Name:</span>
            <span>{blueprint.user_meta.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Birth Date:</span>
            <span>{blueprint.user_meta.birth_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Birth Time:</span>
            <span>{blueprint.user_meta.birth_time_local}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Birth Location:</span>
            <span>{blueprint.user_meta.birth_location}</span>
          </div>
        </div>
      ))}

      {renderSection("mbti", "MBTI Profile", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline" className="bg-soul-purple/10">{blueprint.cognition_mbti.type}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keywords:</span>
            <span>{blueprint.cognition_mbti.core_keywords.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dominant Function:</span>
            <span>{blueprint.cognition_mbti.dominant_function}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Auxiliary Function:</span>
            <span>{blueprint.cognition_mbti.auxiliary_function}</span>
          </div>
          <div className="mt-2 text-sm">
            <p className="text-muted-foreground">Your MBTI type indicates you're likely:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Drawn to {blueprint.cognition_mbti.type.startsWith('I') ? 'inner reflection' : 'external interaction'}</li>
              <li>Processing information through {blueprint.cognition_mbti.type.includes('N') ? 'patterns and possibilities' : 'concrete details'}</li>
              <li>Making decisions based on {blueprint.cognition_mbti.type.includes('F') ? 'personal values and harmony' : 'logical analysis'}</li>
              <li>{blueprint.cognition_mbti.type.includes('J') ? 'Structured and organized' : 'Flexible and spontaneous'} in approach</li>
            </ul>
          </div>
        </div>
      ))}

      {renderSection("humanDesign", "Human Design", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline" className="bg-soul-purple/10">{blueprint.energy_strategy_human_design.type}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profile:</span>
            <span>{blueprint.energy_strategy_human_design.profile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Authority:</span>
            <span>{blueprint.energy_strategy_human_design.authority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Strategy:</span>
            <span>{blueprint.energy_strategy_human_design.strategy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Definition:</span>
            <span>{blueprint.energy_strategy_human_design.definition}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Not-Self Theme:</span>
            <span>{blueprint.energy_strategy_human_design.not_self_theme}</span>
          </div>
          <div className="mt-3">
            <p className="text-muted-foreground mb-2">Life Purpose:</p>
            <p className="text-sm bg-soul-purple/5 p-3 rounded-md">
              {blueprint.energy_strategy_human_design.life_purpose}
            </p>
          </div>
          {blueprint.energy_strategy_human_design.gates && (
            <div className="mt-2">
              <p className="text-muted-foreground mb-1">Key Active Gates:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Design: </span>
                  {blueprint.energy_strategy_human_design.gates.unconscious_design.slice(0, 3).join(", ")}
                </div>
                <div>
                  <span className="text-muted-foreground">Personality: </span>
                  {blueprint.energy_strategy_human_design.gates.conscious_personality.slice(0, 3).join(", ")}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {renderSection("astrology", "Astrological Profile", (
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-soul-purple/5 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                {renderLabelWithTooltip("Sun Sign", "The sign the Sun was in at the time of your birth, representing your core identity")}
              </div>
              <Badge variant="outline" className="bg-soul-purple/10">
                {blueprint.archetype_western.sun_sign}
              </Badge>
            </div>
            <div className="text-sm ml-4">
              <div className="flex gap-1">
                <span className="text-muted-foreground">Keyword:</span>
                <span>{blueprint.archetype_western.sun_keyword}</span>
              </div>
              {blueprint.archetype_western.sun_dates && (
                <div className="flex gap-1">
                  <span className="text-muted-foreground">Dates:</span>
                  <span>{blueprint.archetype_western.sun_dates}</span>
                </div>
              )}
              {blueprint.archetype_western.sun_element && (
                <div className="flex gap-1">
                  <span className="text-muted-foreground">Element:</span>
                  <span>{blueprint.archetype_western.sun_element}</span>
                </div>
              )}
              {blueprint.archetype_western.sun_qualities && (
                <div className="flex gap-1">
                  <span className="text-muted-foreground">Qualities:</span>
                  <span>{blueprint.archetype_western.sun_qualities}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-soul-purple/5 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                {renderLabelWithTooltip("Moon Sign", "The sign the Moon was in when you were born, representing your emotional nature")}
              </div>
              <span className="text-right">{blueprint.archetype_western.moon_sign}</span>
            </div>
            <div className="text-sm ml-4">
              <div className="flex gap-1">
                <span className="text-muted-foreground">Keyword:</span>
                <span>{blueprint.archetype_western.moon_keyword}</span>
              </div>
              {blueprint.archetype_western.moon_element && (
                <div className="flex gap-1">
                  <span className="text-muted-foreground">Element:</span>
                  <span>{blueprint.archetype_western.moon_element}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-soul-purple/5 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                {renderLabelWithTooltip("Rising Sign", "The sign that was rising on the eastern horizon at your birth, representing your outer personality")}
              </div>
              <span className="text-right">{blueprint.archetype_western.rising_sign}</span>
            </div>
          </div>

          {blueprint.archetype_western.aspects && blueprint.archetype_western.aspects.length > 0 && (
            <div className="mt-2">
              <p className="text-muted-foreground mb-1">Key Aspects:</p>
              <ul className="text-sm pl-4 list-disc">
                {blueprint.archetype_western.aspects.slice(0, 3).map((aspect, i) => (
                  <li key={i}>
                    {aspect.planet1} {aspect.type} {aspect.planet2} (orb: {aspect.orb})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {renderSection("chinese", "Chinese Zodiac", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Animal Sign:</span>
            <Badge variant="outline" className="bg-soul-purple/10">
              {blueprint.archetype_chinese.element} {blueprint.archetype_chinese.animal}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Yin/Yang:</span>
            <span>{blueprint.archetype_chinese.yin_yang}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keyword:</span>
            <span>{blueprint.archetype_chinese.keyword}</span>
          </div>
          {blueprint.archetype_chinese.element_characteristic && (
            <div className="mt-2">
              <p className="text-muted-foreground mb-1">Element Influence:</p>
              <p className="text-sm bg-soul-purple/5 p-3 rounded-md">
                {blueprint.archetype_chinese.element_characteristic}
              </p>
            </div>
          )}
          {blueprint.archetype_chinese.personality_profile && (
            <div className="mt-2">
              <p className="text-muted-foreground mb-1">Personality Profile:</p>
              <p className="text-sm bg-soul-purple/5 p-3 rounded-md">
                {blueprint.archetype_chinese.personality_profile}
              </p>
            </div>
          )}
          {blueprint.archetype_chinese.compatibility && (
            <div className="mt-2">
              <p className="text-muted-foreground mb-1">Compatibility:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Best Match: </span>
                  {blueprint.archetype_chinese.compatibility.best.join(", ")}
                </div>
                {blueprint.archetype_chinese.compatibility.worst && (
                  <div>
                    <span className="text-muted-foreground">Challenging: </span>
                    {blueprint.archetype_chinese.compatibility.worst.join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {renderSection("numerology", "Numerology", (
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-soul-purple/5 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                {renderLabelWithTooltip("Life Path Number", "Calculated from your birth date, represents your life purpose and journey")}
              </div>
              <Badge variant="outline" className="bg-soul-purple/10">
                {blueprint.values_life_path.life_path_number}
              </Badge>
            </div>
            <div className="ml-4">
              <div className="flex gap-1 text-sm">
                <span className="text-muted-foreground">Keyword:</span>
                <span>{blueprint.values_life_path.life_path_keyword}</span>
              </div>
              {blueprint.values_life_path.life_path_description && (
                <div className="text-sm mt-1">
                  <span className="text-muted-foreground">Meaning:</span>
                  <p className="mt-1">{blueprint.values_life_path.life_path_description}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-soul-purple/5 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  {renderLabelWithTooltip("Expression Number", "Based on the letters in your full birth name")}
                </div>
                <span>{blueprint.values_life_path.expression_number}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Keyword: </span>
                <span>{blueprint.values_life_path.expression_keyword}</span>
              </div>
            </div>

            <div className="bg-soul-purple/5 p-3 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  {renderLabelWithTooltip("Soul Urge Number", "Calculated from the vowels in your name")}
                </div>
                <span>{blueprint.values_life_path.soul_urge_number}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Keyword: </span>
                <span>{blueprint.values_life_path.soul_urge_keyword}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {blueprint.values_life_path.birth_day_number && (
              <div className="bg-soul-purple/5 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    {renderLabelWithTooltip("Birth Day Number", "The specific day of your birth")}
                  </div>
                  <span>{blueprint.values_life_path.birth_day_number}</span>
                </div>
                {blueprint.values_life_path.birth_day_meaning && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Meaning: </span>
                    <span>{blueprint.values_life_path.birth_day_meaning}</span>
                  </div>
                )}
              </div>
            )}

            {blueprint.values_life_path.personal_year && (
              <div className="bg-soul-purple/5 p-3 rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    {renderLabelWithTooltip("Personal Year", "Your annual cycle")}
                  </div>
                  <span>{blueprint.values_life_path.personal_year}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </CosmicCard>
  );
};

export default BlueprintViewer;
