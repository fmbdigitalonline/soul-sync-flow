
import React from "react";
import { BlueprintData } from "@/services/blueprint-service";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface BlueprintViewerProps {
  blueprint: BlueprintData;
  className?: string;
}

const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ blueprint, className }) => {
  const renderSection = (title: string, content: React.ReactNode) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
        {title}
      </h3>
      {content}
    </div>
  );

  return (
    <CosmicCard className={cn("p-6", className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-display">
          <span className="gradient-text">{blueprint.user_meta.preferred_name}'s Soul Blueprint</span>
        </h2>
      </div>

      {renderSection("Personal Information", (
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

      {renderSection("MBTI Profile", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>{blueprint.cognition_mbti.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keywords:</span>
            <span>{blueprint.cognition_mbti.core_keywords.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dominant Function:</span>
            <span>{blueprint.cognition_mbti.dominant_function}</span>
          </div>
        </div>
      ))}

      {renderSection("Human Design", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>{blueprint.energy_strategy_human_design.type}</span>
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
            <span className="text-muted-foreground">Life Purpose:</span>
            <span>{blueprint.energy_strategy_human_design.life_purpose}</span>
          </div>
        </div>
      ))}

      {renderSection("Astrological Profile", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sun Sign:</span>
            <span>{blueprint.archetype_western.sun_sign}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sun Keyword:</span>
            <span>{blueprint.archetype_western.sun_keyword}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Moon Sign:</span>
            <span>{blueprint.archetype_western.moon_sign}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Moon Keyword:</span>
            <span>{blueprint.archetype_western.moon_keyword}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rising Sign:</span>
            <span>{blueprint.archetype_western.rising_sign}</span>
          </div>
          {blueprint.archetype_western.aspects && blueprint.archetype_western.aspects.length > 0 && (
            <div className="mt-2">
              <span className="text-muted-foreground block mb-1">Key Aspects:</span>
              <ul className="text-sm pl-4">
                {blueprint.archetype_western.aspects.slice(0, 3).map((aspect, i) => (
                  <li key={i}>
                    {aspect.planet1} {aspect.type} {aspect.planet2}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {renderSection("Chinese Zodiac", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Animal:</span>
            <span>{blueprint.archetype_chinese.animal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Element:</span>
            <span>{blueprint.archetype_chinese.element}</span>
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Element Trait:</span>
              <span>{blueprint.archetype_chinese.element_characteristic}</span>
            </div>
          )}
          {blueprint.archetype_chinese.compatibility && (
            <div className="mt-2">
              <span className="text-muted-foreground block mb-1">Compatible With:</span>
              <span>{blueprint.archetype_chinese.compatibility.best.join(", ")}</span>
            </div>
          )}
        </div>
      ))}

      {renderSection("Numerology", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Life Path Number:</span>
            <span>{blueprint.values_life_path.life_path_number} - {blueprint.values_life_path.life_path_keyword}</span>
          </div>
          {blueprint.values_life_path.life_path_description && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meaning:</span>
              <span className="text-right">{blueprint.values_life_path.life_path_description}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expression Number:</span>
            <span>{blueprint.values_life_path.expression_number} - {blueprint.values_life_path.expression_keyword}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Soul Urge Number:</span>
            <span>{blueprint.values_life_path.soul_urge_number} - {blueprint.values_life_path.soul_urge_keyword}</span>
          </div>
          {blueprint.values_life_path.personal_year && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Personal Year:</span>
              <span>{blueprint.values_life_path.personal_year}</span>
            </div>
          )}
        </div>
      ))}
    </CosmicCard>
  );
};

export default BlueprintViewer;
