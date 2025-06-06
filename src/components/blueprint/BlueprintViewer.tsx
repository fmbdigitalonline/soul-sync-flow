import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlueprintData } from "@/services/blueprint-service";
import CosmicCard from "@/components/ui/cosmic-card";

interface BlueprintViewerProps {
  blueprint: BlueprintData;
}

export const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ blueprint }) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Extract calculation metadata with proper typing to avoid TypeScript errors
  const metadata = blueprint?.metadata || {
    calculation_success: false,
    partial_calculation: false,
    calculation_date: "",
    engine: "",
    data_sources: { western: "" }
  };
  
  const calculationDate = metadata.calculation_date || "Unknown";
  const calculationEngine = metadata.data_sources?.western === "calculated" ? 
    (metadata.engine === "swiss_ephemeris" ? "Swiss Ephemeris" : "Legacy Calculator") : 
    "Template Data";
  
  // Fix the numerology section to use correct property names
  const numerologyData = blueprint.values_life_path;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Soul Blueprint for {blueprint.user_meta.preferred_name}</h2>
          <p className="text-sm text-muted-foreground">
            {metadata.calculation_success ? 
              <>Calculated on {new Date(calculationDate).toLocaleDateString()} using {calculationEngine}</> : 
              "Using default template data"
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {metadata.calculation_success && (
            <Badge variant="outline" className="bg-green-50">
              Calculation Success
            </Badge>
          )}
          {metadata.partial_calculation && (
            <Badge variant="outline" className="bg-yellow-50">
              Partial Data
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
              <p>Welcome to your Soul Blueprint, {blueprint.user_meta.preferred_name}!</p>
              <p>This is a summary of your unique traits and characteristics.</p>
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
              <p>Type: {blueprint.cognition_mbti.type}</p>
              <p>Core Keywords: {blueprint.cognition_mbti.core_keywords.join(", ")}</p>
              <p>Dominant Function: {blueprint.cognition_mbti.dominant_function}</p>
              <p>Auxiliary Function: {blueprint.cognition_mbti.auxiliary_function}</p>
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
              <p>Type: {blueprint.energy_strategy_human_design.type}</p>
              <p>Profile: {blueprint.energy_strategy_human_design.profile}</p>
              <p>Authority: {blueprint.energy_strategy_human_design.authority}</p>
              <p>Strategy: {blueprint.energy_strategy_human_design.strategy}</p>
              <p>Definition: {blueprint.energy_strategy_human_design.definition}</p>
              <p>Not-Self Theme: {blueprint.energy_strategy_human_design.not_self_theme}</p>
              <p>Life Purpose: {blueprint.energy_strategy_human_design.life_purpose}</p>
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
              <p>Belief Interface Principle: {blueprint.bashar_suite.belief_interface.principle}</p>
              <p>Excitement Compass Principle: {blueprint.bashar_suite.excitement_compass.principle}</p>
              <p>Frequency Alignment Ritual: {blueprint.bashar_suite.frequency_alignment.quick_ritual}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numerology" className="mt-6">
          <CosmicCard>
            <h3 className="text-xl font-display font-bold mb-4">Life Path Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Life Path Number</h4>
                <p className="text-2xl font-bold text-soul-purple">{numerologyData.lifePathNumber || "Unknown"}</p>
                <p className="text-sm text-gray-400">{"Your life's purpose and journey"}</p>
                <p className="text-sm">{"Your unique path in life"}</p>
              </div>
              <div>
                <h4 className="font-semibold">Birth Day Number</h4>
                <p className="text-2xl font-bold text-soul-purple">{numerologyData.birthDay || "Unknown"}</p>
                <p className="text-sm text-gray-400">{"Natural talents and abilities"}</p>
              </div>
              <div>
                <h4 className="font-semibold">Personal Year</h4>
                <p className="text-2xl font-bold text-soul-purple">{new Date().getFullYear() - numerologyData.birthYear || "Unknown"}</p>
                <p className="text-sm text-gray-400">{"Current year's energy and focus"}</p>
              </div>
              <div>
                <h4 className="font-semibold">Expression Number</h4>
                <p className="text-2xl font-bold text-soul-purple">{numerologyData.expressionNumber || "Unknown"}</p>
                <p className="text-sm text-gray-400">{"Your natural talents and abilities"}</p>
              </div>
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
              <p>Sun Sign: {blueprint.archetype_western.sun_sign}</p>
              <p>Sun Keyword: {blueprint.archetype_western.sun_keyword}</p>
              <p>Moon Sign: {blueprint.archetype_western.moon_sign}</p>
              <p>Moon Keyword: {blueprint.archetype_western.moon_keyword}</p>
              <p>Rising Sign: {blueprint.archetype_western.rising_sign}</p>
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
              <p>Animal: {blueprint.archetype_chinese.animal}</p>
              <p>Element: {blueprint.archetype_chinese.element}</p>
              <p>Yin Yang: {blueprint.archetype_chinese.yin_yang}</p>
              <p>Keyword: {blueprint.archetype_chinese.keyword}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlueprintViewer;
