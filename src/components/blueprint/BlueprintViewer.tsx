
import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlueprintData } from "@/services/blueprint-service";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { EnhancedBlueprintData } from "@/types/blueprint-enhanced";
import { BlueprintEnhancementService } from "@/services/blueprint-enhancement-service";
import EnhancedBlueprintViewer from "./EnhancedBlueprintViewer";

interface BlueprintViewerProps {
  blueprint: BlueprintData;
}

export const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ blueprint }) => {
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Soul Blueprint for {blueprint.user_meta.preferred_name}</h2>
          <p className="text-sm text-muted-foreground">
            {isRealCalculation ? 
              <>Calculated on {new Date(calculationDate).toLocaleDateString()} using {calculationEngine}</> : 
              "Using default template data"
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {isRealCalculation && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✅ Real Calculations
            </Badge>
          )}
          {metadata.partial_calculation && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              ⚠️ Partial Data
            </Badge>
          )}
          {!isRealCalculation && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              📋 Template Data
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mbti">MBTI</TabsTrigger>
          <TabsTrigger value="humanDesign">Human Design</TabsTrigger>
          <TabsTrigger value="bashar">Bashar Suite</TabsTrigger>
          <TabsTrigger value="numerology">Numerology</TabsTrigger>
          <TabsTrigger value="western">Western Astrology</TabsTrigger>
          <TabsTrigger value="chinese">Chinese Astrology</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>A summary of your Soul Blueprint.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Welcome to your Soul Blueprint, {blueprint.user_meta.preferred_name}!</p>
                
                {isRealCalculation ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Accurate Calculations</h4>
                    <p className="text-green-700">Your blueprint was generated using precise astronomical calculations from the Swiss Ephemeris, taking into account your exact birth time, location, and historical timezone data.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">📋 Template Data</h4>
                    <p className="text-gray-700">This blueprint uses template data. For accurate calculations based on your birth details, please regenerate your blueprint.</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <h4 className="font-semibold">Sun Sign</h4>
                    <p className="text-lg text-soul-purple">{westernData.sun_sign}</p>
                    <p className="text-sm text-gray-600">{westernData.sun_keyword}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold">Moon Sign</h4>
                    <p className="text-lg text-soul-purple">{westernData.moon_sign}</p>
                    <p className="text-sm text-gray-600">{westernData.moon_keyword}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold">Life Path</h4>
                    <p className="text-lg text-soul-purple">{numerologyData.lifePathNumber}</p>
                    <p className="text-sm text-gray-600">Your spiritual journey</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mbti" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>MBTI</CardTitle>
              <CardDescription>Understanding your cognitive functions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Type:</span> {mbtiData.type}
                </div>
                <div>
                  <span className="font-semibold">Core Keywords:</span> {mbtiData.core_keywords?.join(", ")}
                </div>
                <div>
                  <span className="font-semibold">Dominant Function:</span> {mbtiData.dominant_function}
                </div>
                <div>
                  <span className="font-semibold">Auxiliary Function:</span> {mbtiData.auxiliary_function}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="humanDesign" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Human Design</CardTitle>
              <CardDescription>Your energy type and strategy.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Type:</span> {humanDesignData.type}
                </div>
                <div>
                  <span className="font-semibold">Profile:</span> {humanDesignData.profile}
                </div>
                <div>
                  <span className="font-semibold">Authority:</span> {humanDesignData.authority}
                </div>
                <div>
                  <span className="font-semibold">Strategy:</span> {humanDesignData.strategy}
                </div>
                <div>
                  <span className="font-semibold">Definition:</span> {humanDesignData.definition}
                </div>
                <div>
                  <span className="font-semibold">Not-Self Theme:</span> {humanDesignData.not_self_theme}
                </div>
                <div>
                  <span className="font-semibold">Life Purpose:</span> {humanDesignData.life_purpose}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bashar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bashar Suite</CardTitle>
              <CardDescription>Tools for shifting your reality.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Excitement Compass</h4>
                  <p className="text-sm text-gray-600">{basharData.excitement_compass?.principle}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Belief Interface</h4>
                  <p className="text-sm text-gray-600">{basharData.belief_interface?.principle}</p>
                  <p className="text-xs text-gray-500 mt-1">Reframe: {basharData.belief_interface?.reframe_prompt}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Frequency Alignment</h4>
                  <p className="text-sm text-gray-600">{basharData.frequency_alignment?.quick_ritual}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numerology" className="mt-6">
          <CosmicCard>
            <h3 className="text-xl font-display font-bold mb-4">Numerology Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-soul-purple">Life Path Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.lifePathNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.lifePathKeyword || "Your life's purpose and journey"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Expression Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.expressionNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.expressionKeyword || "Your natural talents and abilities"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Soul Urge Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.soulUrgeNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.soulUrgeKeyword || "Your inner desires and motivations"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-soul-purple">Birthday Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.birthdayNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.birthdayKeyword || "Special talents from your birth day"}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Calculated from: {blueprint.user_meta.full_name} • Born: {new Date(blueprint.user_meta.birth_date).toLocaleDateString()}
              </p>
            </div>
          </CosmicCard>
        </TabsContent>

        <TabsContent value="western" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Western Astrology</CardTitle>
              <CardDescription>Planetary positions and aspects.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Sun Sign:</span> {westernData.sun_sign}
                </div>
                <div>
                  <span className="font-semibold">Sun Keyword:</span> {westernData.sun_keyword}
                </div>
                <div>
                  <span className="font-semibold">Moon Sign:</span> {westernData.moon_sign}
                </div>
                <div>
                  <span className="font-semibold">Moon Keyword:</span> {westernData.moon_keyword}
                </div>
                <div>
                  <span className="font-semibold">Rising Sign:</span> {westernData.rising_sign}
                </div>
                <div>
                  <span className="font-semibold">Source:</span> {westernData.source}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chinese" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chinese Astrology</CardTitle>
              <CardDescription>Your animal and element.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Animal:</span> {chineseData.animal}
                </div>
                <div>
                  <span className="font-semibold">Element:</span> {chineseData.element}
                </div>
                <div>
                  <span className="font-semibold">Yin Yang:</span> {chineseData.yin_yang}
                </div>
                <div>
                  <span className="font-semibold">Keyword:</span> {chineseData.keyword}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlueprintViewer;
