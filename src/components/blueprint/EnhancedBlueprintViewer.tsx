
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { EnhancedBlueprintData, ViewDepth } from "@/types/blueprint-enhanced";

interface EnhancedBlueprintViewerProps {
  blueprint: EnhancedBlueprintData;
}

interface FactsGridProps {
  facts: string[];
  title: string;
}

const FactsGrid: React.FC<FactsGridProps> = ({ facts, title }) => {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">{title} Overview</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {facts.map((fact, index) => (
          <div key={index} className="bg-gradient-to-br from-soul-purple/5 to-soul-blue/5 border border-soul-purple/20 rounded-lg p-3 text-center">
            <span className="font-medium text-xs sm:text-sm break-words">{fact}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  facts: string[];
  narrative: string;
  depth: ViewDepth;
}

const Section: React.FC<SectionProps> = ({ title, facts, narrative, depth }) => {
  const depthColors = {
    novice: "bg-green-50 border-green-200 text-green-800",
    amateur: "bg-blue-50 border-blue-200 text-blue-800",
    pro: "bg-purple-50 border-purple-200 text-purple-800"
  };

  return (
    <CosmicCard className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-lg sm:text-xl font-display font-bold">{title}</h3>
        <Badge className={`${depthColors[depth]} text-xs sm:text-sm self-start sm:self-center`}>
          {depth.charAt(0).toUpperCase() + depth.slice(1)}
        </Badge>
      </div>
      
      <FactsGrid facts={facts} title={title} />
      
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">{narrative}</p>
      </div>
    </CosmicCard>
  );
};

export const EnhancedBlueprintViewer: React.FC<EnhancedBlueprintViewerProps> = ({ blueprint }) => {
  const [depth, setDepth] = useState<ViewDepth>('novice');
  
  const sections = [
    {
      key: 'energy_identity',
      title: 'Energy & Identity',
      data: blueprint.enhanced_sections.energy_identity
    },
    {
      key: 'western_astrology',
      title: 'Western Astrology',
      data: blueprint.enhanced_sections.western_astrology
    },
    {
      key: 'human_design',
      title: 'Human Design',
      data: blueprint.enhanced_sections.human_design
    },
    {
      key: 'numerology',
      title: 'Numerology',
      data: blueprint.enhanced_sections.numerology
    },
    {
      key: 'chinese_astrology',
      title: 'Chinese Astrology',
      data: blueprint.enhanced_sections.chinese_astrology
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display break-words">
            <span className="gradient-text">Soul Blueprint</span> for {blueprint.user_meta.preferred_name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {blueprint.metadata.calculation_success ? 
              `Calculated using ${blueprint.metadata.engine}` : 
              "Using template data"
            }
          </p>
        </div>
        
        {/* Depth Toggle - Mobile Responsive */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mx-auto sm:mx-0">
          {(['novice', 'amateur', 'pro'] as ViewDepth[]).map((level) => (
            <Button
              key={level}
              variant={depth === level ? "default" : "ghost"}
              size="sm"
              onClick={() => setDepth(level)}
              className={`${depth === level ? "bg-soul-purple text-white" : ""} text-xs sm:text-sm px-2 sm:px-3 h-8`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Sections Stack */}
      <ScrollArea className="h-[calc(100vh-300px)] w-full">
        <div className="space-y-4 sm:space-y-6 pr-2 sm:pr-4">
          {sections.map((section) => (
            <Section
              key={section.key}
              title={section.title}
              facts={section.data.facts}
              narrative={section.data.narratives[depth]}
              depth={depth}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedBlueprintViewer;
