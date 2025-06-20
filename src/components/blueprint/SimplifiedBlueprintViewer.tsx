import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlueprintData } from "@/services/blueprint-service";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { FileText, Sparkles } from "lucide-react";
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

// Helper function to safely extract nested data with multiple fallbacks
function extractData(obj: any, paths: string[]): any {
  console.log('🔍 Extracting data with paths:', paths, 'from object keys:', obj ? Object.keys(obj) : 'null');
  
  for (const path of paths) {
    const keys = path.split('.');
    let current = obj;
    let found = true;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        found = false;
        break;
      }
    }
    
    if (found && current !== null && current !== undefined && current !== '') {
      console.log('✅ Found data for path:', path, 'value:', current);
      return current;
    }
  }
  console.log('❌ No data found for any path');
  return null;
}

// Type guard function
function isValidPersonality(personality: any): personality is {
  likelyType: string;
  mbtiCoreKeywords?: string[];
  core_keywords?: string[];
  dominantFunction?: string;
  dominant_function?: string;
  auxiliaryFunction?: string;
  auxiliary_function?: string;
  description?: string;
  userConfidence?: number;
} {
  return personality != null && 
         typeof personality === "object" && 
         "likelyType" in personality;
}

export const SimplifiedBlueprintViewer: React.FC<SimplifiedBlueprintViewerProps> = ({ blueprint }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAIReport, setShowAIReport] = useState(false);
  const { t } = useLanguage();

  console.log('🔍 Blueprint data received:', blueprint);
  console.log('🔍 Raw values_life_path data:', blueprint?.values_life_path);
  console.log('🔍 Raw numerology data:', blueprint?.numerology);

  // Enhanced Numerology Data Extraction with comprehensive logging
  const rawNumerology = blueprint.values_life_path || blueprint.numerology || {};
  console.log('🔢 Raw numerology object:', rawNumerology);
  console.log('🔢 Raw numerology keys:', Object.keys(rawNumerology));

  const numerologyData = {
    lifePathNumber: extractData(blueprint, [
      'values_life_path.life_path_number',
      'values_life_path.lifePathNumber', 
      'numerology.life_path_number',
      'numerology.lifePathNumber'
    ]) || "Unknown",
    lifePathKeyword: extractData(blueprint, [
      'values_life_path.life_path_keyword',
      'values_life_path.lifePathKeyword',
      'numerology.life_path_keyword', 
      'numerology.lifePathKeyword'
    ]) || "Your life's purpose and journey",
    expressionNumber: extractData(blueprint, [
      'values_life_path.expression_number',
      'values_life_path.expressionNumber',
      'numerology.expression_number',
      'numerology.expressionNumber'
    ]) || "Unknown",
    expressionKeyword: extractData(blueprint, [
      'values_life_path.expression_keyword',
      'values_life_path.expressionKeyword',
      'numerology.expression_keyword',
      'numerology.expressionKeyword'
    ]) || "Your natural talents and abilities",
    soulUrgeNumber: extractData(blueprint, [
      'values_life_path.soul_urge_number',
      'values_life_path.soulUrgeNumber',
      'numerology.soul_urge_number',
      'numerology.soulUrgeNumber'
    ]) || "Unknown",
    soulUrgeKeyword: extractData(blueprint, [
      'values_life_path.soul_urge_keyword',
      'values_life_path.soulUrgeKeyword',
      'numerology.soul_urge_keyword',
      'numerology.soulUrgeKeyword'  
    ]) || "Your inner desires and motivations",
    birthdayNumber: extractData(blueprint, [
      'values_life_path.birthday_number',
      'values_life_path.birthdayNumber',
      'numerology.birthday_number',
      'numerology.birthdayNumber'
    ]) || "Unknown",
    birthdayKeyword: extractData(blueprint, [
      'values_life_path.birthday_keyword',
      'values_life_path.birthdayKeyword',
      'numerology.birthday_keyword',
      'numerology.birthdayKeyword'
    ]) || "Special talents from your birth day",
    personalityNumber: extractData(blueprint, [
      'values_life_path.personality_number',
      'values_life_path.personalityNumber',
      'numerology.personality_number',
      'numerology.personalityNumber'
    ]) || "Unknown",
    personalityKeyword: extractData(blueprint, [
      'values_life_path.personality_keyword',
      'values_life_path.personalityKeyword',
      'numerology.personality_keyword',
      'numerology.personalityKeyword'
    ]) || "Key personality aspect"
  };

  console.log('📊 Final extracted numerology data:', numerologyData);

  // Enhanced MBTI Data Extraction with Robust Fallbacks
  let mbtiData = blueprint.cognition_mbti && typeof blueprint.cognition_mbti === "object" && blueprint.cognition_mbti.type && blueprint.cognition_mbti.type !== "Unknown"
    ? blueprint.cognition_mbti
    : blueprint.mbti && typeof blueprint.mbti === "object" && blueprint.mbti.type && blueprint.mbti.type !== "Unknown"
      ? blueprint.mbti
      : null;

  // Use type guard for safe personality access
  if (!mbtiData || !mbtiData.type || mbtiData.type === "Unknown") {
    const personality = blueprint.user_meta?.personality;
    
    if (isValidPersonality(personality)) {
      mbtiData = {
        type: personality.likelyType || "Unknown",
        core_keywords:
          personality.mbtiCoreKeywords && Array.isArray(personality.mbtiCoreKeywords)
            ? personality.mbtiCoreKeywords
            : personality.core_keywords && Array.isArray(personality.core_keywords)
              ? personality.core_keywords
              : [],
        dominant_function:
          personality.dominantFunction ||
          personality.dominant_function ||
          "Unknown",
        auxiliary_function:
          personality.auxiliaryFunction ||
          personality.auxiliary_function ||
          "Unknown",
        description:
          personality.description && typeof personality.description === "string"
            ? personality.description
            : "",
        user_confidence: personality.userConfidence
      };
    } else if (typeof personality === 'string') {
      // Handle case where personality is just a string (MBTI type)
      mbtiData = {
        type: personality,
        core_keywords: [],
        dominant_function: "Unknown",
        auxiliary_function: "Unknown",
        description: "",
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

  // Apply MBTI Cognitive Function Fallback
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

  console.log('🧠 Extracted MBTI data:', mbtiData);

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
  
  // Enhanced Western Astrology data extraction
  const westernData = blueprint.archetype_western || blueprint.astrology || {
    sun_sign: "Unknown",
    sun_keyword: "Unknown",
    moon_sign: "Unknown", 
    moon_keyword: "Unknown",
    rising_sign: "Unknown",
    source: "template"
  };

  // Enhanced Human Design data extraction
  const humanDesignData = blueprint.energy_strategy_human_design || blueprint.human_design || {};
  const hdData = {
    type: extractData(blueprint, [
      'energy_strategy_human_design.type',
      'human_design.type',
      'energy_strategy_human_design.design_type',
      'human_design.design_type'
    ]) || "Generator",
    profile: extractData(blueprint, [
      'energy_strategy_human_design.profile',
      'human_design.profile'
    ]) || "2/4",
    authority: extractData(blueprint, [
      'energy_strategy_human_design.authority',
      'human_design.authority',
      'energy_strategy_human_design.inner_authority',
      'human_design.inner_authority'
    ]) || "Sacral",
    strategy: extractData(blueprint, [
      'energy_strategy_human_design.strategy',
      'human_design.strategy'
    ]) || "Respond",
    definition: extractData(blueprint, [
      'energy_strategy_human_design.definition',
      'human_design.definition'
    ]) || "Single",
    not_self_theme: extractData(blueprint, [
      'energy_strategy_human_design.not_self_theme',
      'human_design.not_self_theme'
    ]) || "Frustration",
    life_purpose: extractData(blueprint, [
      'energy_strategy_human_design.life_purpose',
      'human_design.life_purpose'
    ]) || "To find satisfaction"
  };

  console.log('🎯 Enhanced Human Design data:', hdData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Soul Blueprint for {blueprint.user_meta.preferred_name}
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
                  Welcome to your Soul Blueprint, {blueprint.user_meta.preferred_name}!
                </p>
                {isRealCalculation ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Accurate Calculations</h4>
                    <p className="text-green-700">
                      Your blueprint was generated using precise astronomical calculations from the Swiss Ephemeris, taking into account your exact birth time, location, and historical timezone data.
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
                    <p className="text-sm text-gray-600">{westernData.sun_keyword || 'Sun energy'}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold">MBTI Type</h4>
                    <p className="text-lg text-soul-purple">{mbtiData.type || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{Array.isArray(mbtiData.core_keywords) && mbtiData.core_keywords.length
                      ? mbtiData.core_keywords.join(", ")
                      : (mbtiData.description || 'Personality type')}</p>
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
                  <span className="font-semibold">Type:</span> {mbtiData.type || 'Unknown'}
                </div>
                <div>
                  <span className="font-semibold">Core Keywords:</span>{" "}
                  {Array.isArray(mbtiData.core_keywords) && mbtiData.core_keywords.length
                    ? mbtiData.core_keywords.join(", ")
                    : (mbtiData.description || 'Personality traits')}
                </div>
                <div>
                  <span className="font-semibold">Dominant Function:</span> {mbtiData.dominant_function || 'Unknown'}
                </div>
                <div>
                  <span className="font-semibold">Auxiliary Function:</span> {mbtiData.auxiliary_function || 'Unknown'}
                </div>
                {mbtiData.user_confidence !== undefined && (
                  <div>
                    <span className="font-semibold">Self-Assessment Confidence:</span> {Math.round(mbtiData.user_confidence * 100)}%
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
                  <span className="font-semibold">Rising Sign:</span> {westernData.rising_sign || 'Calculating...'}
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
