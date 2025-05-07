
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
        </div>
      ))}

      {renderSection("Astrological Profile", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sun Sign:</span>
            <span>{blueprint.archetype_western.sun_sign}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Moon Sign:</span>
            <span>{blueprint.archetype_western.moon_sign}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rising Sign:</span>
            <span>{blueprint.archetype_western.rising_sign}</span>
          </div>
        </div>
      ))}

      {renderSection("Numerology", (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Life Path Number:</span>
            <span>{blueprint.values_life_path.life_path_number} - {blueprint.values_life_path.life_path_keyword}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expression Number:</span>
            <span>{blueprint.values_life_path.expression_number} - {blueprint.values_life_path.expression_keyword}</span>
          </div>
        </div>
      ))}
    </CosmicCard>
  );
};

export default BlueprintViewer;
