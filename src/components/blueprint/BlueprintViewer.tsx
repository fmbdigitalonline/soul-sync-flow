import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlueprintData } from "@/services/blueprint-service";

interface BlueprintViewerProps {
  blueprint: BlueprintData;
}

const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ blueprint }) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Extract calculation metadata if available
  const metadata = blueprint?.metadata || {};
  const calculationDate = metadata.calculation_date || "Unknown";
  const calculationEngine = metadata.data_sources?.western === "calculated" ? 
    (metadata.engine === "swiss_ephemeris" ? "Swiss Ephemeris" : "Legacy Calculator") : 
    "Template Data";
  
  return (
    <div className="container mx-auto">
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
          {/* <TabsTrigger value="timing">Timing Overlays</TabsTrigger>
          <TabsTrigger value="goals">Goal Stack</TabsTrigger>
          <TabsTrigger value="tasks">Task Graph</TabsTrigger>
          <TabsTrigger value="beliefs">Belief Logs</TabsTrigger>
          <TabsTrigger value="excitement">Excitement Scores</TabsTrigger>
          <TabsTrigger value="vibration">Vibration Check-ins</TabsTrigger> */}
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
          <Card>
            <CardHeader>
              <CardTitle>Numerology</CardTitle>
              <CardDescription>Insights from your life path number.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Life Path Number: {blueprint.values_life_path.life_path_number}</p>
              <p>Life Path Keyword: {blueprint.values_life_path.life_path_keyword}</p>
              <p>Life Path Description: {blueprint.values_life_path.life_path_description}</p>
              <p>Birth Day Number: {blueprint.values_life_path.birth_day_number}</p>
              <p>Birth Day Meaning: {blueprint.values_life_path.birth_day_meaning}</p>
              <p>Personal Year: {blueprint.values_life_path.personal_year}</p>
              <p>Expression Number: {blueprint.values_life_path.expression_number}</p>
            </CardContent>
          </Card>
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

        {/* <TabsContent value="timing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Timing Overlays</CardTitle>
              <CardDescription>Current transits and notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Current Transits: {blueprint.timing_overlays.current_transits}</p>
              <p>Notes: {blueprint.timing_overlays.notes}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Stack</CardTitle>
              <CardDescription>Your goals and aspirations.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Goal Stack: {blueprint.goal_stack}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Graph</CardTitle>
              <CardDescription>Your tasks and activities.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Task Graph: {blueprint.task_graph}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beliefs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Belief Logs</CardTitle>
              <CardDescription>Your beliefs and affirmations.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Belief Logs: {blueprint.belief_logs}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="excitement" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Excitement Scores</CardTitle>
              <CardDescription>Your excitement levels.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Excitement Scores: {blueprint.excitement_scores}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vibration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vibration Check-ins</CardTitle>
              <CardDescription>Your vibration levels.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Vibration Check-ins: {blueprint.vibration_check_ins}</p>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default BlueprintViewer;
