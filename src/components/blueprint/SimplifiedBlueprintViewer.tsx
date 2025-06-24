
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { BlueprintData } from "@/services/blueprint-service";

interface SimplifiedBlueprintViewerProps {
  blueprint: BlueprintData;
}

const SimplifiedBlueprintViewer: React.FC<SimplifiedBlueprintViewerProps> = ({ blueprint }) => {
  console.log('🎯 SimplifiedBlueprintViewer received blueprint:', blueprint);

  // Extract calculation metadata
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

  // Extract numerology data - check both old and new structures
  const numerologyData = blueprint.values_life_path || blueprint.numerology || {
    lifePathNumber: 1,
    lifePathKeyword: "Leader",
    expressionNumber: 1,
    expressionKeyword: "Independent",
    soulUrgeNumber: 1,
    soulUrgeKeyword: "Ambitious",
    personalityNumber: 1,
    personalityKeyword: "Original",
    birthdayNumber: 1,
    birthdayKeyword: "Pioneer"
  };

  console.log('🔢 Extracted numerology data:', numerologyData);

  // Extract other blueprint sections
  const westernData = blueprint.archetype_western || blueprint.astrology || {
    sun_sign: "Unknown",
    moon_sign: "Unknown", 
    rising_sign: "Unknown"
  };

  const mbtiData = blueprint.cognition_mbti || blueprint.mbti || {
    type: "ENFP",
    core_keywords: ["Enthusiastic", "Creative"],
    dominant_function: "Extraverted Intuition",
    auxiliary_function: "Introverted Feeling"
  };

  const humanDesignData = blueprint.energy_strategy_human_design || blueprint.human_design || {
    type: "Generator",
    profile: "2/4",
    authority: "Sacral",
    strategy: "Respond"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Soul Blueprint for {blueprint.user_meta?.preferred_name || 'User'}</h2>
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mbti">MBTI</TabsTrigger>
          <TabsTrigger value="humanDesign">Human Design</TabsTrigger>
          <TabsTrigger value="numerology">Numerology</TabsTrigger>
          <TabsTrigger value="astrology">Astrology</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold">Sun Sign</h4>
                  <p className="text-lg text-soul-purple">{westernData.sun_sign}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold">MBTI Type</h4>
                  <p className="text-lg text-soul-purple">{mbtiData.type}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold">Life Path</h4>
                  <p className="text-lg text-soul-purple">{numerologyData.lifePathNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.lifePathKeyword}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mbti" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>MBTI Profile</CardTitle>
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
                  <p className="text-sm text-gray-600">{numerologyData.lifePathKeyword || "Your life's purpose"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Expression Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.expressionNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.expressionKeyword || "Your talents"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Soul Urge Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.soulUrgeNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.soulUrgeKeyword || "Your desires"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-soul-purple">Personality Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.personalityNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.personalityKeyword || "Key traits"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Birthday Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.birthdayNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.birthdayKeyword || "Special talents"}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Calculated from: {blueprint.user_meta?.full_name} • Born: {new Date(blueprint.user_meta?.birth_date || '').toLocaleDateString()}
              </p>
            </div>
          </CosmicCard>
        </TabsContent>

        <TabsContent value="astrology" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Western Astrology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Sun Sign:</span> {westernData.sun_sign}
                </div>
                <div>
                  <span className="font-semibold">Moon Sign:</span> {westernData.moon_sign}
                </div>
                <div>
                  <span className="font-semibold">Rising Sign:</span> {westernData.rising_sign}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimplifiedBlueprintViewer;
