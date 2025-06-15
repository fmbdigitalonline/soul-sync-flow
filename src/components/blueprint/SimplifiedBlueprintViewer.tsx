import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { FileText, Sparkles } from "lucide-react";
import AIPersonalityReport from "./AIPersonalityReport";

interface SimplifiedBlueprintViewerProps {
  blueprint: BlueprintData;
}

// --- MBTI Cognitive Function Table (fallback for missing data) ---
const MBTI_COG_FUNCTIONS: Record<string, { dominant: string; auxiliary: string }> = {
  // Dominant and Auxiliary for each of the 16 MBTI types (standard order)
  INFJ: { dominant: "Ni (Introverted Intuition)", auxiliary: "Fe (Extraverted Feeling)" },
  INFP: { dominant: "Fi (Introverted Feeling)", auxiliary: "Ne (Extraverted Intuition)" },
  INTJ: { dominant: "Ni (Introverted Intuition)", auxiliary: "Te (Extraverted Thinking)" },
  INTP: { dominant: "Ti (Introverted Thinking)", auxiliary: "Ne (Extraverted Intuition)" },
  ISFJ: { dominant: "Si (Introverted Sensing)", auxiliary: "Fe (Extraverted Feeling)" },
  ISFP: { dominant: "Fi (Introverted Feeling)", auxiliary: "Se (Extraverted Sensing)" },
  ISTJ: { dominant: "Si (Introverted Sensing)", auxiliary: "Te (Extraverted Thinking)" },
  ISTP: { dominant: "Ti (Introverted Thinking)", auxiliary: "Se (Extraverted Sensing)" },
  ENFJ: { dominant: "Fe (Extraverted Feeling)", auxiliary: "Ni (Introverted Intuition)" },
  ENFP: { dominant: "Ne (Extraverted Intuition)", auxiliary: "Fi (Introverted Feeling)" },
  ENTJ: { dominant: "Te (Extraverted Thinking)", auxiliary: "Ni (Introverted Intuition)" },
  ENTP: { dominant: "Ne (Extraverted Intuition)", auxiliary: "Ti (Introverted Thinking)" },
  ESFJ: { dominant: "Fe (Extraverted Feeling)", auxiliary: "Si (Introverted Sensing)" },
  ESFP: { dominant: "Se (Extraverted Sensing)", auxiliary: "Fi (Introverted Feeling)" },
  ESTJ: { dominant: "Te (Extraverted Thinking)", auxiliary: "Si (Introverted Sensing)" },
  ESTP: { dominant: "Se (Extraverted Sensing)", auxiliary: "Ti (Introverted Thinking)" }
};

export const SimplifiedBlueprintViewer: React.FC<SimplifiedBlueprintViewerProps> = ({ blueprint }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAIReport, setShowAIReport] = useState(false);

  // --- Numerology Data Mapping (same as previous fix) ---
  const rawNumerology = blueprint.values_life_path || blueprint.numerology || {};
  const numerologyData = {
    lifePathNumber: rawNumerology.lifePathNumber ?? rawNumerology.life_path_number ?? "",
    lifePathKeyword: rawNumerology.lifePathKeyword ?? rawNumerology.life_path_keyword ?? "",
    expressionNumber: rawNumerology.expressionNumber ?? rawNumerology.expression_number ?? "",
    expressionKeyword: rawNumerology.expressionKeyword ?? rawNumerology.expression_keyword ?? "",
    soulUrgeNumber: rawNumerology.soulUrgeNumber ?? rawNumerology.soul_urge_number ?? "",
    soulUrgeKeyword: rawNumerology.soulUrgeKeyword ?? rawNumerology.soul_urge_keyword ?? "",
    birthdayNumber: rawNumerology.birthdayNumber ?? rawNumerology.birthday_number ?? "",
    birthdayKeyword: rawNumerology.birthdayKeyword ?? rawNumerology.birthday_keyword ?? "",
    personalityNumber: rawNumerology.personalityNumber ?? rawNumerology.personality_number ?? "",
    personalityKeyword: rawNumerology.personalityKeyword ?? rawNumerology.personality_keyword ?? ""
  };

  // --- MBTI Data Extraction with Robust Fallbacks ---
  let mbtiData = blueprint.cognition_mbti && typeof blueprint.cognition_mbti === "object" && blueprint.cognition_mbti.type && blueprint.cognition_mbti.type !== "Unknown"
    ? blueprint.cognition_mbti
    : blueprint.mbti && typeof blueprint.mbti === "object" && blueprint.mbti.type && blueprint.mbti.type !== "Unknown"
      ? blueprint.mbti
      : null;

  // Ensure correct typing for fallback usage
  if (!mbtiData || !mbtiData.type || mbtiData.type === "Unknown") {
    const personality = blueprint.user_meta?.personality;
    if (
      personality &&
      typeof personality === "object" &&
      personality !== null &&
      "likelyType" in personality
    ) {
      // Cast personality to any to avoid TypeScript null checking issues
      const validPersonality = personality as any;
      mbtiData = {
        type: validPersonality.likelyType ? validPersonality.likelyType : "Unknown",
        core_keywords:
          validPersonality.mbtiCoreKeywords && Array.isArray(validPersonality.mbtiCoreKeywords)
            ? validPersonality.mbtiCoreKeywords
            : validPersonality.core_keywords && Array.isArray(validPersonality.core_keywords)
              ? validPersonality.core_keywords
              : [],
        dominant_function:
          validPersonality.dominantFunction
            ? validPersonality.dominantFunction
            : validPersonality.dominant_function
              ? validPersonality.dominant_function
              : "Unknown",
        auxiliary_function:
          validPersonality.auxiliaryFunction
            ? validPersonality.auxiliaryFunction
            : validPersonality.auxiliary_function
              ? validPersonality.auxiliary_function
              : "Unknown",
        description:
          validPersonality.description && typeof validPersonality.description === "string"
            ? validPersonality.description
            : "",
        user_confidence: validPersonality.userConfidence
      };
    } else {
      mbtiData = {
        type: "Unknown",
        core_keywords: [],
        dominant_function: "Unknown",
        auxiliary_function: "Unknown",
        description: "",
      };
    }
  }

  // === Apply MBTI Cognitive Function Fallback ===
  // Only if the type is recognized and functions are missing/Unknown
  if (
    mbtiData &&
    typeof mbtiData.type === "string" &&
    MBTI_COG_FUNCTIONS[mbtiData.type.toUpperCase()]
  ) {
    const cog = MBTI_COG_FUNCTIONS[mbtiData.type.toUpperCase()];
    if (
      !mbtiData.dominant_function ||
      mbtiData.dominant_function === "Unknown"
    ) {
      mbtiData.dominant_function = cog.dominant;
    }
    if (
      !mbtiData.auxiliary_function ||
      mbtiData.auxiliary_function === "Unknown"
    ) {
      mbtiData.auxiliary_function = cog.auxiliary;
    }
  }

  console.log("NUMEROLOGY DEBUG", { numerologyData, rawNumerology, blueprint });

  if (showAIReport) {
    return (
      <AIPersonalityReport
        blueprint={blueprint}
        userId={blueprint.user_meta?.user_id || ''}
        onBack={() => setShowAIReport(false)}
      />
    );
  }

  // Extract calculation metadata with proper typing
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
  
  // Get data with fallbacks for backwards compatibility
  const westernData = blueprint.archetype_western || blueprint.astrology || {
    sun_sign: "Unknown",
    sun_keyword: "Unknown",
    moon_sign: "Unknown", 
    moon_keyword: "Unknown",
    rising_sign: "Unknown",
    source: "template"
  };

  const humanDesignData = blueprint.energy_strategy_human_design || blueprint.human_design || {
    type: "Generator",
    profile: "2/4",
    authority: "Sacral",
    strategy: "Respond",
    definition: "Single",
    not_self_theme: "Frustration",
    life_purpose: "To find satisfaction"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Soul Blueprint for {blueprint.user_meta.preferred_name}</h2>
          <p className="text-sm text-muted-foreground">
            {isRealCalculation ? 
              <>Calculated on {new Date(calculationDate).toLocaleDateString()} using {calculationEngine}</> : 
              "Using default template data"
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
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

      {/* Generate Full Reading Button */}
      <CosmicCard className="p-4 text-center border-soul-purple/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h3 className="font-semibold text-lg gradient-text mb-1">Get Your Complete Reading</h3>
            <p className="text-sm text-muted-foreground">
              Generate a comprehensive AI analysis that weaves together all aspects of your blueprint
            </p>
          </div>
          <Button
            onClick={() => setShowAIReport(true)}
            className="bg-soul-purple hover:bg-soul-purple/90 whitespace-nowrap"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Full Reading
          </Button>
        </div>
      </CosmicCard>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mbti">MBTI</TabsTrigger>
          <TabsTrigger value="humanDesign">Human Design</TabsTrigger>
          <TabsTrigger value="numerology">Numerology</TabsTrigger>
          <TabsTrigger value="western">Astrology</TabsTrigger>
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
                    <h4 className="font-semibold">MBTI Type</h4>
                    <p className="text-lg text-soul-purple">{mbtiData.type || "Unknown"}</p>
                    <p className="text-sm text-gray-600">{Array.isArray(mbtiData.core_keywords) && mbtiData.core_keywords.length
                      ? mbtiData.core_keywords.join(", ")
                      : (mbtiData.description || "Unknown")}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold">Life Path</h4>
                    <p className="text-lg text-soul-purple">{numerologyData.lifePathNumber}</p>
                    <p className="text-sm text-gray-600">{numerologyData.lifePathKeyword}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mbti" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>MBTI Profile</CardTitle>
              <CardDescription>Your cognitive personality type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Type:</span> {mbtiData.type || "Unknown"}
                </div>
                <div>
                  <span className="font-semibold">Core Keywords:</span> {Array.isArray(mbtiData.core_keywords) && mbtiData.core_keywords.length
                      ? mbtiData.core_keywords.join(", ")
                      : (mbtiData.description || "Unknown")}
                </div>
                <div>
                  <span className="font-semibold">Dominant Function:</span> {mbtiData.dominant_function || "Unknown"}
                </div>
                <div>
                  <span className="font-semibold">Auxiliary Function:</span> {mbtiData.auxiliary_function || "Unknown"}
                </div>
                {mbtiData.user_confidence !== undefined && (
                  <div>
                    <span className="font-semibold">Self-assessment confidence:</span> {Math.round(mbtiData.user_confidence * 100)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="humanDesign" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Human Design</CardTitle>
              <CardDescription>Your energy type and strategy</CardDescription>
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
                  <p className="text-sm text-gray-600">{numerologyData.lifePathKeyword || "Your life's purpose and journey"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Expression Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.expressionNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.expressionKeyword || "Your natural talents and abilities"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Personality Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.personalityNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.personalityKeyword || "Key aspect of your persona"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-soul-purple">Soul Urge Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.soulUrgeNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.soulUrgeKeyword || "Your inner desires and motivations"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Birthday Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.birthdayNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.birthdayKeyword || "Special talents from your birth day"}</p>
                </div>
              </div>
            </div>
          </CosmicCard>
        </TabsContent>

        <TabsContent value="western" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Western Astrology</CardTitle>
              <CardDescription>Your astrological profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Sun Sign:</span> {westernData.sun_sign} - {westernData.sun_keyword}
                </div>
                <div>
                  <span className="font-semibold">Moon Sign:</span> {westernData.moon_sign} - {westernData.moon_keyword}
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
