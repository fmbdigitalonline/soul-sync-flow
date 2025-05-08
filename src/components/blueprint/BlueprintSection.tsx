
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlueprintSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  showExpandIcon?: boolean;
}

const BlueprintSection: React.FC<BlueprintSectionProps> = ({
  id,
  title,
  children,
  defaultExpanded = false,
  showExpandIcon = true,
}) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  const toggleSection = () => {
    setExpanded(prev => !prev);
  };

  return (
    <div className="mb-6">
      <div 
        className={cn(
          "flex items-center justify-between mb-2",
          showExpandIcon && "cursor-pointer"
        )}
        onClick={() => showExpandIcon && toggleSection()}
      >
        <h3 className="text-lg font-semibold flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
          {title}
        </h3>
        {showExpandIcon && (
          expanded ? 
            <ChevronUp className="h-4 w-4 text-soul-purple" /> : 
            <ChevronDown className="h-4 w-4 text-soul-purple" />
        )}
      </div>
      {(!showExpandIcon || expanded) && children}
    </div>
  );
};

export default BlueprintSection;
