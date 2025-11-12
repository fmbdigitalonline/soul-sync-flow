
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, User, Sparkles, Star, Calculator, Circle, Lock } from "lucide-react";
import { EnhancedBlueprintData, ViewDepth } from "@/types/blueprint-enhanced";
import { personalityFusionService } from "@/services/personality-fusion-service";
import { PersonalityProfile } from "@/types/personality-fusion";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface EnhancedBlueprintViewerProps {
  blueprint: EnhancedBlueprintData;
}

interface FactsGridProps {
  facts: string[];
  title: string;
}

const FactsGrid: React.FC<FactsGridProps> = ({ facts, title }) => {
  const { spacing, getTextSize } = useResponsiveLayout();
  
  return (
    <div className={`mb-${spacing.gap}`}>
      <h4 className={`${getTextSize("text-sm")} font-medium text-muted-foreground mb-3`}>{title} Overview</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {facts.map((fact, index) => (
          <div key={index} className="bg-soul-purple/5 rounded-3xl p-3 text-center">
            <span className={`font-medium ${getTextSize("text-sm")} break-words`}>{fact}</span>
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

const SectionHeader: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  depth: ViewDepth;
}> = ({ title, icon, isOpen, onToggle, depth }) => {
  const { getTextSize } = useResponsiveLayout();
  
  const depthColors = {
    novice: "bg-green-50 border-green-200 text-green-800",
    amateur: "bg-blue-50 border-blue-200 text-blue-800", 
    pro: "bg-purple-50 border-purple-200 text-purple-800"
  };

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/5 transition-colors rounded-t-3xl"
    >
      <div className="flex items-center gap-3">
        <div className="text-soul-purple">{icon}</div>
        <h3 className={`${getTextSize("text-lg")} font-semibold font-display`}>{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={`${depthColors[depth]} ${getTextSize("text-xs")}`}>
          {depth.charAt(0).toUpperCase() + depth.slice(1)}
        </Badge>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </div>
    </button>
  );
};

const Section: React.FC<SectionProps & { icon: React.ReactNode; isOpen: boolean; onToggle: () => void }> = ({ 
  title, facts, narrative, depth, icon, isOpen, onToggle 
}) => {
  const { spacing, getTextSize } = useResponsiveLayout();

  return (
    <Card className={`mb-${spacing.card}`}>
      <SectionHeader
        title={title}
        icon={icon}
        isOpen={isOpen}
        onToggle={onToggle}
        depth={depth}
      />
      
      {isOpen && (
        <CardContent className={`pt-0 pb-${spacing.card}`}>
          {facts.length > 0 && <FactsGrid facts={facts} title={title} />}
          
          <div className="prose prose-sm max-w-none">
            <p className={`text-muted-foreground leading-relaxed ${getTextSize("text-base")} break-words`}>
              {narrative}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const PersonalitySection: React.FC<{ 
  personalityProfile: PersonalityProfile | null;
  depth: ViewDepth;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ personalityProfile, depth, isOpen, onToggle }) => {
  const { spacing, getTextSize } = useResponsiveLayout();
  
  if (!personalityProfile) {
    return (
      <Card className={`mb-${spacing.card}`}>
        <SectionHeader
          title="Personality Profile"
          icon={<User className="w-5 h-5" />}
          isOpen={isOpen}
          onToggle={onToggle}
          depth={depth}
        />
        {isOpen && (
          <CardContent className={`pt-0 pb-${spacing.card}`}>
            <div className="text-center p-6">
              <p className={`text-muted-foreground ${getTextSize("text-base")}`}>
                Personality profile not available
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  const confidence = Math.round(
    Object.values(personalityProfile.confidence).reduce((sum, c) => sum + c, 0) / 5 * 100
  );

  const facts = [
    `Likely Type: ${personalityProfile.likelyType}`,
    `Confidence: ${confidence}% certain`,
    `Openness: ${Math.round(personalityProfile.bigFive.openness * 100)}%`,
    `Conscientiousness: ${Math.round(personalityProfile.bigFive.conscientiousness * 100)}%`,
    `Extraversion: ${Math.round(personalityProfile.bigFive.extraversion * 100)}%`,
    `Agreeableness: ${Math.round(personalityProfile.bigFive.agreeableness * 100)}%`
  ];

  let narrative = personalityProfile.description;
  
  if (depth === 'amateur') {
    const topTypes = Object.entries(personalityProfile.mbtiProbabilities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, prob]) => `${type} (${Math.round(prob * 100)}%)`)
      .join(', ');
    
    narrative += ` Alternative possibilities include: ${topTypes}. This assessment will become more accurate as you interact with the system.`;
  }
  
  if (depth === 'pro') {
    narrative += ` Big Five scores: Openness ${Math.round(personalityProfile.bigFive.openness * 100)}, Conscientiousness ${Math.round(personalityProfile.bigFive.conscientiousness * 100)}, Extraversion ${Math.round(personalityProfile.bigFive.extraversion * 100)}, Agreeableness ${Math.round(personalityProfile.bigFive.agreeableness * 100)}, Neuroticism ${Math.round(personalityProfile.bigFive.neuroticism * 100)}. Based on ${personalityProfile.microAnswers?.length || 0} micro-interactions.`;
  }

  return (
    <Card className={`mb-${spacing.card}`}>
      <SectionHeader
        title="Personality Profile"
        icon={<User className="w-5 h-5" />}
        isOpen={isOpen}
        onToggle={onToggle}
        depth={depth}
      />
      
      {isOpen && (
        <CardContent className={`pt-0 pb-${spacing.card}`}>
          {facts.length > 0 && <FactsGrid facts={facts} title="Personality Profile" />}
          
          <div className="prose prose-sm max-w-none">
            <p className={`text-muted-foreground leading-relaxed ${getTextSize("text-base")} break-words`}>
              {narrative}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export const EnhancedBlueprintViewer: React.FC<EnhancedBlueprintViewerProps> = ({ blueprint }) => {
  const [depth, setDepth] = useState<ViewDepth>('novice');
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personality_profile: true,
    energy_identity: false,
    western_astrology: false,
    human_design: false,
    numerology: false,
    chinese_astrology: false
  });
  
  const { spacing, getTextSize, isMobile } = useResponsiveLayout();
  
  // Load personality profile
  React.useEffect(() => {
    const loadPersonalityProfile = async () => {
      if (blueprint.id) {
        const { data } = await personalityFusionService.getPersonalityProfile(blueprint.id);
        setPersonalityProfile(data);
      }
    };
    
    loadPersonalityProfile();
  }, [blueprint.id]);
  
  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getSectionIcon = (key: string) => {
    const iconMap = {
      personality_profile: <User className="w-5 h-5" />,
      energy_identity: <Sparkles className="w-5 h-5" />,
      western_astrology: <Star className="w-5 h-5" />,
      human_design: <Calculator className="w-5 h-5" />,
      numerology: <Calculator className="w-5 h-5" />,
      chinese_astrology: <Circle className="w-5 h-5" />
    };
    return iconMap[key as keyof typeof iconMap];
  };
  
  const sections = [
    {
      key: 'personality_profile',
      title: 'Personality Profile',
      component: (
        <PersonalitySection 
          personalityProfile={personalityProfile} 
          depth={depth}
          isOpen={openSections.personality_profile}
          onToggle={() => toggleSection('personality_profile')}
        />
      )
    },
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
    <div className={`space-y-${spacing.container} w-full`}>
      {/* Header */}
      <div className={`flex flex-col gap-${spacing.container} mb-${spacing.container}`}>
        <div>
          <h2 className={`${getTextSize("text-2xl")} font-bold font-display break-words`}>
            <span className="gradient-text">Soul Blueprint</span> for {blueprint.user_meta.preferred_name}
          </h2>
          <p className={`${getTextSize("text-sm")} text-muted-foreground mt-1`}>
            {blueprint.metadata.calculation_success ? 
              `Calculated using ${blueprint.metadata.engine}` : 
              "Using template data"
            }
          </p>
        </div>
        
        {/* Depth Toggle - Mobile Responsive */}
        <div className={`flex gap-1 bg-gray-100 rounded-lg p-1 w-fit ${isMobile ? 'mx-auto' : 'mx-0'}`}>
          {(['novice', 'amateur', 'pro'] as ViewDepth[]).map((level) => (
            <Button
              key={level}
              variant={depth === level ? "default" : "ghost"}
              size="sm"
              onClick={() => setDepth(level)}
              className={`${depth === level ? "bg-soul-purple text-white" : ""} ${getTextSize("text-sm")} px-3 h-8`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Sections Stack */}
      <ScrollArea className="h-[calc(100vh-300px)] w-full">
        <div className={`space-y-${spacing.card} ${isMobile ? 'pr-2' : 'pr-4'}`}>
          <Card className="border-dashed border-soul-purple/30 bg-muted/30 shadow-none">
            <CardContent
              className={`${spacing.card} flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'} gap-4 text-muted-foreground`}
            >
              <div className={`rounded-full bg-muted-foreground/10 p-3 ${isMobile ? '' : 'flex-shrink-0'}`}>
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`${getTextSize("text-lg")} font-semibold`}>Hermetisch Rapport</h3>
                <p className={`${getTextSize("text-sm")} text-muted-foreground/80`}>
                  Alleen toegankelijk voor premium gebruikers
                </p>
              </div>
              <Badge
                variant="outline"
                className={`${isMobile ? 'mt-2' : 'ml-auto'} bg-soul-purple/10 text-soul-purple border-soul-purple/30`}
              >
                Premium
              </Badge>
            </CardContent>
          </Card>
          {sections.map((section) => (
            <div key={section.key}>
              {section.component || (
                <Section
                  title={section.title}
                  facts={section.data.facts}
                  narrative={section.data.narratives[depth]}
                  depth={depth}
                  icon={getSectionIcon(section.key)}
                  isOpen={openSections[section.key]}
                  onToggle={() => toggleSection(section.key)}
                />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedBlueprintViewer;
