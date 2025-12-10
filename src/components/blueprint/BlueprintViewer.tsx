
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlueprintData } from "@/services/blueprint-service";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { EnhancedBlueprintData } from "@/types/blueprint-enhanced";
import { BlueprintEnhancementService } from "@/services/blueprint-enhancement-service";
import EnhancedBlueprintViewer from "./EnhancedBlueprintViewer";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { ChevronDown, ChevronRight, User, Brain, Heart, Compass, Star, Calculator, Globe, Lock } from "lucide-react";

interface BlueprintViewerProps {
  blueprint: BlueprintData;
}

export const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ blueprint }) => {
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    mbti: false,
    humanDesign: false,
    bashar: false,
    numerology: false,
    western: false,
    chinese: false
  });
  
  const { spacing, getTextSize, isMobile } = useResponsiveLayout();
  
  const enhancedBlueprint = useMemo(() => {
    if (!useEnhanced) return null;
    return BlueprintEnhancementService.enhanceBlueprintData(blueprint);
  }, [blueprint, useEnhanced]);

  if (useEnhanced && enhancedBlueprint) {
    return <EnhancedBlueprintViewer blueprint={enhancedBlueprint} />;
  }

  // Extract calculation metadata with proper typing to avoid TypeScript errors
  const metadata = blueprint?.metadata || {
    calculation_success: false,
    partial_calculation: false,
    calculation_date: "",
    engine: "",
    data_sources: { western: "" }
  };
  
  const calculationDate = metadata.calculation_date || "Unknown";
  
  // Better detection of real vs template data
  const isRealCalculation = metadata.calculation_success || 
    metadata.engine?.includes("swiss_ephemeris") || 
    metadata.engine?.includes("vercel") ||
    metadata.data_sources?.western === "calculated";
  
  const calculationEngine = isRealCalculation ? 
    (metadata.engine?.includes("swiss_ephemeris") ? "Swiss Ephemeris via Vercel API" : 
     metadata.engine?.includes("vercel") ? "Vercel Ephemeris API" :
     "Accurate Astronomical Calculations") : 
    "Template Data";
  
  // Get numerology data with fallback to ensure backwards compatibility
  const numerologyData = blueprint.values_life_path || blueprint.numerology || {
    lifePathNumber: 1,
    lifePathKeyword: "Leader",
    expressionNumber: 1,
    expressionKeyword: "Independent",
    soulUrgeNumber: 1,
    soulUrgeKeyword: "Ambitious",
    birthdayNumber: 1,
    birthdayKeyword: "Pioneer"
  };

  // Get western astrology data with fallback
  const westernData = blueprint.archetype_western || blueprint.astrology || {
    sun_sign: "Unknown",
    sun_keyword: "Unknown",
    moon_sign: "Unknown", 
    moon_keyword: "Unknown",
    rising_sign: "Unknown",
    source: "template"
  };

  // Get MBTI data with fallback
  const mbtiData = blueprint.cognition_mbti || blueprint.mbti || {
    type: "ENFP",
    core_keywords: ["Enthusiastic", "Creative"],
    dominant_function: "Extraverted Intuition",
    auxiliary_function: "Introverted Feeling"
  };

  // Get Human Design data with fallback
  const humanDesignData = blueprint.energy_strategy_human_design || blueprint.human_design || {
    type: "Generator",
    profile: "2/4",
    authority: "Sacral",
    strategy: "Respond",
    definition: "Single",
    not_self_theme: "Frustration",
    life_purpose: "To find satisfaction"
  };

  // Get Bashar suite data with fallback
  const basharData = blueprint.bashar_suite || {
    excitement_compass: { principle: "Follow your highest excitement" },
    belief_interface: { principle: "Beliefs create reality", reframe_prompt: "What would I rather believe?" },
    frequency_alignment: { quick_ritual: "Take 3 deep breaths" }
  };

  // Get Chinese astrology data with fallback
  const chineseData = blueprint.archetype_chinese || {
    animal: "Dragon",
    element: "Wood", 
    yin_yang: "Yang",
    keyword: "Powerful"
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const SectionHeader = ({ title, isExpanded, onClick, icon: Icon }: { 
    title: string; 
    isExpanded: boolean; 
    onClick: () => void;
    icon?: any;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between ${spacing.button} ${getTextSize('text-lg')} font-semibold text-left hover:bg-muted/50 rounded-lg transition-colors`}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-soul-purple flex-shrink-0" />}
        <span>{title}</span>
      </div>
      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );
  
  return (
    <div className={`space-y-4 w-full max-w-full overflow-hidden ${spacing.container}`}>
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 w-full max-w-full">
        <div className="w-full max-w-full">
          <h2 className={`${getTextSize('text-2xl')} font-bold break-words gradient-text`}>
            Soul Blueprint for {blueprint.user_meta.preferred_name}
          </h2>
          <p className={`${getTextSize('text-sm')} text-muted-foreground break-words`}>
            {isRealCalculation ? 
              <>Calculated on {new Date(calculationDate).toLocaleDateString()} using {calculationEngine}</> : 
              "Using default template data"
            }
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full max-w-full">
          {isRealCalculation && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs flex-shrink-0">
              ✅ Real Calculations
            </Badge>
          )}
          {metadata.partial_calculation && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs flex-shrink-0">
              ⚠️ Partial Data
            </Badge>
          )}
          {!isRealCalculation && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs flex-shrink-0">
              📋 Template Data
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className={`${isMobile ? 'h-[60vh]' : 'h-[70vh]'} w-full`}>
        <div className={`space-y-4 pr-2 ${spacing.gap}`}>
          <Card className="border-dashed border-soul-purple/30 bg-muted/30 shadow-none">
            <CardContent
              className={`${spacing.card} flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'} gap-4 text-muted-foreground`}
            >
              <div className={`rounded-full bg-muted-foreground/10 p-3 ${isMobile ? '' : 'flex-shrink-0'}`}>
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`${getTextSize('text-lg')} font-semibold`}>Hermetisch Rapport</h3>
                <p className={`${getTextSize('text-sm')} text-muted-foreground/80`}>
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
          {/* Overview Section */}
          <Card>
            <div className={spacing.card}>
              <SectionHeader
                title="Overview"
                isExpanded={expandedSections.overview}
                onClick={() => toggleSection('overview')}
                icon={Star}
              />
              
              {expandedSections.overview && (
                <div className={`mt-4 space-y-4`}>
                  <p className={getTextSize('text-base')}>Welcome to your Soul Blueprint, {blueprint.user_meta.preferred_name}!</p>
                  
                  {isRealCalculation ? (
                    <div className="bg-green-50 border border-green-200 rounded-3xl p-4">
                      <h4 className={`font-semibold text-green-800 mb-2 ${getTextSize('text-sm')}`}>✅ Accurate Calculations</h4>
                      <p className={`text-green-700 ${getTextSize('text-sm')}`}>Your blueprint was generated using precise astronomical calculations from the Swiss Ephemeris, taking into account your exact birth time, location, and historical timezone data.</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-4">
                      <h4 className={`font-semibold text-gray-800 mb-2 ${getTextSize('text-sm')}`}>📋 Template Data</h4>
                      <p className={`text-gray-700 ${getTextSize('text-sm')}`}>This blueprint uses template data. For accurate calculations based on your birth details, please regenerate your blueprint.</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                    <div className="text-center bg-soul-purple/5 rounded-3xl p-4">
                      <h4 className={`font-semibold ${getTextSize('text-sm')}`}>Sun Sign</h4>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-lg')}`}>{westernData.sun_sign}</p>
                      <p className={`text-gray-600 ${getTextSize('text-xs')}`}>{westernData.sun_keyword}</p>
                    </div>
                    <div className="text-center bg-soul-purple/5 rounded-3xl p-4">
                      <h4 className={`font-semibold ${getTextSize('text-sm')}`}>Moon Sign</h4>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-lg')}`}>{westernData.moon_sign}</p>
                      <p className={`text-gray-600 ${getTextSize('text-xs')}`}>{westernData.moon_keyword}</p>
                    </div>
                    <div className="text-center bg-soul-purple/5 rounded-3xl p-4">
                      <h4 className={`font-semibold ${getTextSize('text-sm')}`}>Life Path</h4>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-lg')}`}>{numerologyData.lifePathNumber}</p>
                      <p className={`text-gray-600 ${getTextSize('text-xs')}`}>Your spiritual journey</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* MBTI Section */}
          <Card>
            <div className={spacing.card}>
              <SectionHeader
                title="MBTI Cognitive Profile"
                isExpanded={expandedSections.mbti}
                onClick={() => toggleSection('mbti')}
                icon={Brain}
              />
              
              {expandedSections.mbti && (
                <div className={`mt-4 space-y-4`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold ${getTextSize('text-sm')}`}>Type</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-lg')}`}>{mbtiData.type}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold ${getTextSize('text-sm')}`}>Keywords</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{mbtiData.core_keywords?.join(", ")}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-3xl p-4">
                      <span className={`font-semibold ${getTextSize('text-sm')}`}>Dominant Function: </span>
                      <span className={getTextSize('text-sm')}>{mbtiData.dominant_function}</span>
                    </div>
                    <div className="bg-gray-50 rounded-3xl p-4">
                      <span className={`font-semibold ${getTextSize('text-sm')}`}>Auxiliary Function: </span>
                      <span className={getTextSize('text-sm')}>{mbtiData.auxiliary_function}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Human Design Section */}
          <Card>
            <div className={spacing.card}>
              <SectionHeader
                title="Human Design"
                isExpanded={expandedSections.humanDesign}
                onClick={() => toggleSection('humanDesign')}
                icon={Compass}
              />
              
              {expandedSections.humanDesign && (
                <div className={`mt-4 space-y-4`}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Type</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{humanDesignData.type}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Profile</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{humanDesignData.profile}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Authority</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{humanDesignData.authority}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Strategy</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{humanDesignData.strategy}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Definition</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{humanDesignData.definition}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Not-Self Theme</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{humanDesignData.not_self_theme}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-3xl p-4">
                    <span className={`font-semibold ${getTextSize('text-sm')}`}>Life Purpose: </span>
                    <span className={getTextSize('text-sm')}>{humanDesignData.life_purpose}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Bashar Suite Section */}
          <Card>
            <div className={spacing.card}>
              <SectionHeader
                title="Bashar Suite"
                isExpanded={expandedSections.bashar}
                onClick={() => toggleSection('bashar')}
                icon={Heart}
              />
              
              {expandedSections.bashar && (
                <div className={`mt-4 space-y-4`}>
                  <div className="bg-soul-purple/5 rounded-3xl p-4">
                    <h4 className={`font-semibold ${getTextSize('text-sm')}`}>Excitement Compass</h4>
                    <p className={`text-gray-700 ${getTextSize('text-sm')}`}>{basharData.excitement_compass?.principle}</p>
                  </div>
                  <div className="bg-soul-purple/5 rounded-3xl p-4">
                    <h4 className={`font-semibold ${getTextSize('text-sm')}`}>Belief Interface</h4>
                    <p className={`text-gray-700 ${getTextSize('text-sm')}`}>{basharData.belief_interface?.principle}</p>
                    <p className={`text-gray-500 mt-1 ${getTextSize('text-xs')}`}>Reframe: {basharData.belief_interface?.reframe_prompt}</p>
                  </div>
                  <div className="bg-soul-purple/5 rounded-3xl p-4">
                    <h4 className={`font-semibold ${getTextSize('text-sm')}`}>Frequency Alignment</h4>
                    <p className={`text-gray-700 ${getTextSize('text-sm')}`}>{basharData.frequency_alignment?.quick_ritual}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Numerology Section */}
          <Card>
            <div className={spacing.card}>
              <SectionHeader
                title="Numerology Profile"
                isExpanded={expandedSections.numerology}
                onClick={() => toggleSection('numerology')}
                icon={Calculator}
              />
              
              {expandedSections.numerology && (
                <div className={`mt-4 space-y-4`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <h4 className={`font-semibold text-soul-purple ${getTextSize('text-sm')}`}>Life Path Number</h4>
                      <p className={`font-bold text-soul-purple ${getTextSize('text-2xl')}`}>{numerologyData.lifePathNumber}</p>
                      <p className={`text-gray-600 ${getTextSize('text-xs')}`}>{numerologyData.lifePathKeyword || "Your life's purpose and journey"}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <h4 className={`font-semibold text-soul-purple ${getTextSize('text-sm')}`}>Expression Number</h4>
                      <p className={`font-bold text-soul-purple ${getTextSize('text-2xl')}`}>{numerologyData.expressionNumber}</p>
                      <p className={`text-gray-600 ${getTextSize('text-xs')}`}>{numerologyData.expressionKeyword || "Your natural talents and abilities"}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <h4 className={`font-semibold text-soul-purple ${getTextSize('text-sm')}`}>Soul Urge Number</h4>
                      <p className={`font-bold text-soul-purple ${getTextSize('text-2xl')}`}>{numerologyData.soulUrgeNumber}</p>
                      <p className={`text-gray-600 ${getTextSize('text-xs')}`}>{numerologyData.soulUrgeKeyword || "Your inner desires and motivations"}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <h4 className={`font-semibold text-soul-purple ${getTextSize('text-sm')}`}>Birthday Number</h4>
                      <p className={`font-bold text-soul-purple ${getTextSize('text-2xl')}`}>{numerologyData.birthdayNumber}</p>
                      <p className={`text-gray-600 ${getTextSize('text-xs')}`}>{numerologyData.birthdayKeyword || "Special talents from your birth day"}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-3xl p-4">
                    <p className={`text-gray-500 ${getTextSize('text-xs')}`}>
                      Calculated from: {blueprint.user_meta.full_name} • Born: {new Date(blueprint.user_meta.birth_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Western Astrology Section */}
          <Card>
            <div className={spacing.card}>
              <SectionHeader
                title="Western Astrology"
                isExpanded={expandedSections.western}
                onClick={() => toggleSection('western')}
                icon={Globe}
              />
              
              {expandedSections.western && (
                <div className={`mt-4 space-y-4`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Sun Sign</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{westernData.sun_sign}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Moon Sign</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{westernData.moon_sign}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Rising Sign</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{westernData.rising_sign}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-3xl p-4">
                      <span className={`font-semibold ${getTextSize('text-sm')}`}>Sun Keyword: </span>
                      <span className={getTextSize('text-sm')}>{westernData.sun_keyword}</span>
                    </div>
                    <div className="bg-gray-50 rounded-3xl p-4">
                      <span className={`font-semibold ${getTextSize('text-sm')}`}>Moon Keyword: </span>
                      <span className={getTextSize('text-sm')}>{westernData.moon_keyword}</span>
                    </div>
                    <div className="bg-gray-50 rounded-3xl p-4">
                      <span className={`font-semibold ${getTextSize('text-sm')}`}>Source: </span>
                      <span className={getTextSize('text-sm')}>{westernData.source}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Chinese Astrology Section */}
          <Card>
            <div className={spacing.card}>
              <SectionHeader
                title="Chinese Astrology"
                isExpanded={expandedSections.chinese}
                onClick={() => toggleSection('chinese')}
                icon={Star}
              />
              
              {expandedSections.chinese && (
                <div className={`mt-4 space-y-4`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Animal</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{chineseData.animal}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Element</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{chineseData.element}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Yin Yang</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{chineseData.yin_yang}</p>
                    </div>
                    <div className="bg-soul-purple/5 rounded-3xl p-4 text-center">
                      <span className={`font-semibold text-xs ${getTextSize('text-xs')}`}>Keyword</span>
                      <p className={`text-soul-purple font-bold ${getTextSize('text-sm')}`}>{chineseData.keyword}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default BlueprintViewer;
