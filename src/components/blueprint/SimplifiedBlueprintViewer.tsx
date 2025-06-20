
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { FileText } from "lucide-react";
import AIPersonalityReport from "./AIPersonalityReport";
import { useLanguage } from '@/contexts/LanguageContext';

interface SimplifiedBlueprintViewerProps {
  blueprint: BlueprintData;
}

// MBTI Cognitive Function Table (fallback for missing data)
const MBTI_COG_FUNCTIONS: Record<string, { dominant: string; auxiliary: string }> = {
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
  const { t } = useLanguage();

  console.log('🔍 Blueprint data received in SimplifiedBlueprintViewer:', blueprint);

  // Enhanced extraction function with multiple fallback paths
  const extractData = (blueprint: BlueprintData) => {
    console.log('🔧 Extracting data from blueprint...');
    console.log('🗂️ Available blueprint keys:', Object.keys(blueprint));

    // Extract MBTI Data - prioritize user personality data
    const personalityData = blueprint.user_meta?.personality;
    let mbtiData = {
      type: "Unknown",
      core_keywords: [] as string[],
      dominant_function: "Unknown",
      auxiliary_function: "Unknown",
      description: "",
      user_confidence: 0
    };

    if (personalityData && typeof personalityData === 'object') {
      const personality = personalityData as any;
      if (personality.likelyType) {
        mbtiData.type = personality.likelyType;
        mbtiData.description = personality.description || "";
        mbtiData.user_confidence = personality.userConfidence || 0;
        
        // Extract keywords from description
        const description = personality.description || "";
        const extractedKeywords = [];
        if (description.includes('Enthusiastic')) extractedKeywords.push('Enthusiastic');
        if (description.includes('creative')) extractedKeywords.push('Creative');
        if (description.includes('possibilities')) extractedKeywords.push('Visionary');
        if (description.includes('inspiring')) extractedKeywords.push('Inspiring');
        mbtiData.core_keywords = extractedKeywords.length > 0 ? extractedKeywords : ['Dynamic', 'Inspiring'];
      }
    }

    // Apply cognitive functions based on MBTI type
    if (mbtiData.type !== "Unknown" && MBTI_COG_FUNCTIONS[mbtiData.type]) {
      const functions = MBTI_COG_FUNCTIONS[mbtiData.type];
      mbtiData.dominant_function = functions.dominant;
      mbtiData.auxiliary_function = functions.auxiliary;
    }

    console.log('🧠 Final MBTI data:', mbtiData);

    // Extract Numerology Data with multiple fallback paths
    // Try numerology first, then values_life_path as fallback
    const numerologySource = blueprint.numerology || blueprint.values_life_path || {};
    console.log('📊 Raw numerology source data:', numerologySource);
    
    const numerologyData = {
      lifePathNumber: numerologySource.life_path_number || numerologySource.lifePathNumber || "Unknown",
      lifePathKeyword: numerologySource.life_path_keyword || numerologySource.lifePathKeyword || "Your life's purpose",
      expressionNumber: numerologySource.expression_number || numerologySource.expressionNumber || "Unknown",
      expressionKeyword: numerologySource.expression_keyword || numerologySource.expressionKeyword || "Your talents",
      soulUrgeNumber: numerologySource.soul_urge_number || numerologySource.soulUrgeNumber || "Unknown",
      soulUrgeKeyword: numerologySource.soul_urge_keyword || numerologySource.soulUrgeKeyword || "Your desires",
      birthdayNumber: numerologySource.birthday_number || numerologySource.birthdayNumber || "Unknown",
      birthdayKeyword: numerologySource.birthday_keyword || numerologySource.birthdayKeyword || "Special talents",
      personalityNumber: numerologySource.personality_number || numerologySource.personalityNumber || "Unknown",
      personalityKeyword: numerologySource.personality_keyword || numerologySource.personalityKeyword || "Key traits"
    };

    console.log('📊 Final numerology data:', numerologyData);

    // Extract Human Design Data
    const hdSource = blueprint.human_design || blueprint.energy_strategy_human_design || {};
    const hdData = {
      type: hdSource.type || "Generator",
      profile: hdSource.profile || "2/4",
      authority: hdSource.authority || "Sacral",
      strategy: hdSource.strategy || "Respond",
      definition: hdSource.definition || "Single",
      not_self_theme: hdSource.not_self_theme || "Frustration"
    };

    console.log('🎯 Final Human Design data:', hdData);

    // Extract Western Astrology Data
    const westernData = blueprint.astrology || blueprint.archetype_western || {
      sun_sign: "Unknown",
      moon_sign: "Unknown", 
      rising_sign: "Unknown"
    };

    // Extract Chinese Zodiac Data - fix the TypeScript error
    const chineseData = (blueprint as any).chinese_zodiac || blueprint.archetype_chinese || {
      animal: "Unknown",
      element: "Unknown"
    };

    console.log('🐉 Final Chinese Zodiac data:', chineseData);

    return {
      mbtiData,
      numerologyData,
      hdData,
      westernData,
      chineseData
    };
  };

  const extractedData = extractData(blueprint);
  const { mbtiData, numerologyData, hdData, westernData, chineseData } = extractedData;

  // Extract calculation metadata
  const metadata = blueprint?.metadata || {
    calculation_success: false,
    partial_calculation: false,
    calculation_date: "",
    engine: "",
    data_sources: { western: "" }
  };
  
  const calculationDate = metadata.calculation_date || "Unknown";
  const isRealCalculation = metadata.calculation_success || metadata.engine?.includes("supabase_edge_function");
  const calculationEngine = isRealCalculation ? 
    (metadata.engine?.includes("supabase_edge_function") ? "Swiss Ephemeris via Supabase" : "Accurate Calculations") : 
    "Template Data";

  if (showAIReport) {
    return (
      <AIPersonalityReport
        blueprint={blueprint}
        userId={blueprint.user_meta?.user_id || ''}
        onBack={() => setShowAIReport(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Soul Blueprint for {blueprint.user_meta?.preferred_name || blueprint.user_meta?.full_name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRealCalculation ? 
              `Calculated on ${new Date(calculationDate).toLocaleDateString()} using ${calculationEngine}` : 
              "Using template data"
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
            <h3 className="font-semibold text-lg gradient-text mb-1">
              Get Your Full Personality Reading
            </h3>
            <p className="text-sm text-muted-foreground">
              Discover deep insights about your personality, strengths, and life path
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
              <CardDescription>A summary of your Soul Blueprint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Welcome to your Soul Blueprint, {blueprint.user_meta?.preferred_name || 'there'}!
                </p>
                {isRealCalculation ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Accurate Calculations</h4>
                    <p className="text-green-700">
                      Your blueprint was generated using precise astronomical calculations, taking into account your exact birth details.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">📋 Template Data</h4>
                    <p className="text-gray-700">
                      This blueprint uses template data. For accurate calculations based on your birth details, please regenerate your blueprint.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <h4 className="font-semibold">Sun Sign</h4>
                    <p className="text-lg text-soul-purple">{westernData.sun_sign}</p>
                    <p className="text-sm text-gray-600">{westernData.sun_keyword || 'Solar energy'}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold">MBTI Type</h4>
                    <p className="text-lg text-soul-purple">{mbtiData.type}</p>
                    <p className="text-sm text-gray-600">{mbtiData.core_keywords.join(", ") || 'Personality type'}</p>
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
              <CardDescription>Understanding your cognitive functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Type:</span> {mbtiData.type}
                </div>
                <div>
                  <span className="font-semibold">Core Keywords:</span> {mbtiData.core_keywords.join(", ") || 'Traits based on type'}
                </div>
                <div>
                  <span className="font-semibold">Dominant Function:</span> {mbtiData.dominant_function}
                </div>
                <div>
                  <span className="font-semibold">Auxiliary Function:</span> {mbtiData.auxiliary_function}
                </div>
                {mbtiData.description && (
                  <div>
                    <span className="font-semibold">Description:</span> {mbtiData.description}
                  </div>
                )}
                {mbtiData.user_confidence > 0 && (
                  <div>
                    <span className="font-semibold">Assessment Confidence:</span> {Math.round(mbtiData.user_confidence * 100)}%
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
                  <span className="font-semibold">Type:</span> {hdData.type}
                </div>
                <div>
                  <span className="font-semibold">Profile:</span> {hdData.profile}
                </div>
                <div>
                  <span className="font-semibold">Authority:</span> {hdData.authority}
                </div>
                <div>
                  <span className="font-semibold">Strategy:</span> {hdData.strategy}
                </div>
                <div>
                  <span className="font-semibold">Definition:</span> {hdData.definition}
                </div>
                <div>
                  <span className="font-semibold">Not-Self Theme:</span> {hdData.not_self_theme}
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
                  <p className="text-sm text-gray-600">{numerologyData.lifePathKeyword}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Expression Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.expressionNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.expressionKeyword}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Personality Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.personalityNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.personalityKeyword}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-soul-purple">Soul Urge Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.soulUrgeNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.soulUrgeKeyword}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Birthday Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{numerologyData.birthdayNumber}</p>
                  <p className="text-sm text-gray-600">{numerologyData.birthdayKeyword}</p>
                </div>
              </div>
            </div>
          </CosmicCard>
        </TabsContent>
        
        <TabsContent value="western" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Western Astrology</CardTitle>
              <CardDescription>Planetary positions and aspects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Sun Sign:</span> {westernData.sun_sign} {westernData.sun_keyword ? `- ${westernData.sun_keyword}` : ''}
                </div>
                <div>
                  <span className="font-semibold">Moon Sign:</span> {westernData.moon_sign} {westernData.moon_keyword ? `- ${westernData.moon_keyword}` : ''}
                </div>
                <div>
                  <span className="font-semibold">Rising Sign:</span> {westernData.rising_sign}
                </div>
                {chineseData.animal !== 'Unknown' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Chinese Zodiac</h4>
                    <p><span className="font-medium">Animal:</span> {chineseData.animal}</p>
                    <p><span className="font-medium">Element:</span> {chineseData.element}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimplifiedBlueprintViewer;
