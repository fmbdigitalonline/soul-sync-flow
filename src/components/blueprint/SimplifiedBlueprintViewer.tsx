
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { LayeredBlueprint } from "@/types/personality-modules";

interface SimplifiedBlueprintViewerProps {
  blueprint: LayeredBlueprint;
}

const SimplifiedBlueprintViewer: React.FC<SimplifiedBlueprintViewerProps> = ({ blueprint }) => {
  console.log('🎯 SimplifiedBlueprintViewer received LayeredBlueprint:', blueprint);

  // Extract user metadata
  const userMeta = blueprint?.user_meta || {};
  const userName = userMeta.preferred_name || userMeta.full_name || 'User';
  
  // Extract MBTI/Cognitive data
  const cognitiveData = blueprint?.cognitiveTemperamental || {};
  const mbtiType = cognitiveData.mbtiType || 'Unknown';
  const dominantFunction = cognitiveData.dominantFunction || 'Unknown';
  const auxiliaryFunction = cognitiveData.auxiliaryFunction || 'Unknown';
  const taskApproach = cognitiveData.taskApproach || 'systematic';
  const communicationStyle = cognitiveData.communicationStyle || 'clear';
  const decisionMaking = cognitiveData.decisionMaking || 'logical';

  // Extract Human Design data
  const energyData = blueprint?.energyDecisionStrategy || {};
  const hdType = energyData.humanDesignType || 'Generator';
  const authority = energyData.authority || 'Sacral';
  const strategy = energyData.strategy || 'respond';
  const profile = energyData.profile || '1/3';
  const pacing = energyData.pacing || 'steady';
  const energyType = energyData.energyType || 'sustainable';

  // Extract Numerology data
  const numerologyData = blueprint?.coreValuesNarrative || {};
  const lifePath = numerologyData.lifePath || 1;
  const lifePathKeyword = numerologyData.lifePathKeyword || 'Leader';
  const expressionNumber = numerologyData.expressionNumber || 1;
  const expressionKeyword = numerologyData.expressionKeyword || 'Independent';
  const soulUrgeNumber = numerologyData.soulUrgeNumber || 1;
  const soulUrgeKeyword = numerologyData.soulUrgeKeyword || 'Ambitious';
  const personalityNumber = numerologyData.personalityNumber || 1;
  const personalityKeyword = numerologyData.personalityKeyword || 'Original';
  const birthdayNumber = numerologyData.birthdayNumber || 1;
  const birthdayKeyword = numerologyData.birthdayKeyword || 'Pioneer';

  // Extract Astrology data
  const astrologyData = blueprint?.publicArchetype || {};
  const sunSign = astrologyData.sunSign || 'Unknown';
  const moonSign = astrologyData.moonSign || 'Unknown';
  const risingSign = astrologyData.risingSign || 'Unknown';
  const socialStyle = astrologyData.socialStyle || 'warm';
  const publicVibe = astrologyData.publicVibe || 'approachable';
  const leadershipStyle = astrologyData.leadershipStyle || 'collaborative';

  // Extract Chinese astrology
  const generationalData = blueprint?.generationalCode || {};
  const chineseZodiac = generationalData.chineseZodiac || 'Unknown';
  const element = generationalData.element || 'Unknown';

  // Check if we have real calculated data
  const hasRealData = mbtiType !== 'Unknown' || sunSign !== 'Unknown' || lifePath > 1;

  console.log('🔍 Extracted blueprint data:', {
    mbtiType, hdType, lifePath, sunSign, hasRealData,
    dominantFunction, authority, expressionNumber, moonSign
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Soul Blueprint for {userName}</h2>
          <p className="text-sm text-muted-foreground">
            {hasRealData ? 
              "Calculated using advanced personality analysis" : 
              "Using template data - create your profile for personalized results"
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {hasRealData && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✅ Personalized Data
            </Badge>
          )}
          {!hasRealData && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              📋 Template Data
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mbti">MBTI Details</TabsTrigger>
          <TabsTrigger value="humanDesign">Human Design</TabsTrigger>
          <TabsTrigger value="numerology">Numerology</TabsTrigger>
          <TabsTrigger value="astrology">Astrology</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personality Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="font-semibold text-soul-purple">MBTI Type</h4>
                  <p className="text-2xl font-bold text-soul-purple">{mbtiType}</p>
                  <p className="text-sm text-gray-600">{dominantFunction}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-soul-purple">Life Path</h4>
                  <p className="text-2xl font-bold text-soul-purple">{lifePath}</p>
                  <p className="text-sm text-gray-600">{lifePathKeyword}</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-soul-purple">Sun Sign</h4>
                  <p className="text-2xl font-bold text-soul-purple">{sunSign}</p>
                  <p className="text-sm text-gray-600">Core identity</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="text-center">
                  <h4 className="font-semibold text-soul-purple">Human Design</h4>
                  <p className="text-lg font-bold text-soul-purple">{hdType}</p>
                  <p className="text-sm text-gray-600">{authority} Authority</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-soul-purple">Chinese Zodiac</h4>
                  <p className="text-lg font-bold text-soul-purple">{chineseZodiac}</p>
                  <p className="text-sm text-gray-600">{element} Element</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mbti" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>MBTI Cognitive Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-soul-purple mb-2">Personality Type</h4>
                    <p className="text-3xl font-bold text-soul-purple">{mbtiType}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-soul-purple mb-2">Cognitive Functions</h4>
                    <p className="text-sm"><strong>Dominant:</strong> {dominantFunction}</p>
                    <p className="text-sm"><strong>Auxiliary:</strong> {auxiliaryFunction}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1">Task Approach</h5>
                    <p className="text-sm text-gray-600 capitalize">{taskApproach}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1">Communication</h5>
                    <p className="text-sm text-gray-600 capitalize">{communicationStyle}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1">Decision Making</h5>
                    <p className="text-sm text-gray-600 capitalize">{decisionMaking}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="humanDesign" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Human Design Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-soul-purple mb-2">Energy Type</h4>
                    <p className="text-3xl font-bold text-soul-purple">{hdType}</p>
                    <p className="text-sm text-gray-600">{energyType} energy</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-soul-purple mb-2">Decision Authority</h4>
                    <p className="text-xl font-bold text-soul-purple">{authority}</p>
                    <p className="text-sm text-gray-600">Inner authority</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1">Strategy</h5>
                    <p className="text-sm text-gray-600 capitalize">{strategy}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1">Profile</h5>
                    <p className="text-sm text-gray-600">{profile}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1">Pacing</h5>
                    <p className="text-sm text-gray-600 capitalize">{pacing}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numerology" className="mt-6">
          <CosmicCard>
            <h3 className="text-xl font-display font-bold mb-6">Complete Numerology Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-soul-purple">Life Path Number</h4>
                  <p className="text-4xl font-bold text-soul-purple">{lifePath}</p>
                  <p className="text-sm text-gray-600 font-medium">{lifePathKeyword}</p>
                  <p className="text-xs text-gray-500">Your life's core purpose and direction</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Expression Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{expressionNumber}</p>
                  <p className="text-sm text-gray-600 font-medium">{expressionKeyword}</p>
                  <p className="text-xs text-gray-500">Your natural talents and abilities</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Soul Urge Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{soulUrgeNumber}</p>
                  <p className="text-sm text-gray-600 font-medium">{soulUrgeKeyword}</p>
                  <p className="text-xs text-gray-500">Your heart's deepest desires</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-soul-purple">Personality Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{personalityNumber}</p>
                  <p className="text-sm text-gray-600 font-medium">{personalityKeyword}</p>
                  <p className="text-xs text-gray-500">How others perceive you</p>
                </div>
                <div>
                  <h4 className="font-semibold text-soul-purple">Birthday Number</h4>
                  <p className="text-3xl font-bold text-soul-purple">{birthdayNumber}</p>
                  <p className="text-sm text-gray-600 font-medium">{birthdayKeyword}</p>
                  <p className="text-xs text-gray-500">Special talents from birth date</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Calculated from: {userMeta.full_name} • Born: {userMeta.birth_date ? new Date(userMeta.birth_date).toLocaleDateString() : 'Date on file'}
              </p>
            </div>
          </CosmicCard>
        </TabsContent>

        <TabsContent value="astrology" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Astrological Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-soul-purple">Sun Sign</h4>
                    <p className="text-3xl font-bold text-soul-purple">{sunSign}</p>
                    <p className="text-sm text-gray-600">Core identity & ego</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-soul-purple">Moon Sign</h4>
                    <p className="text-3xl font-bold text-soul-purple">{moonSign}</p>
                    <p className="text-sm text-gray-600">Emotional nature</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-soul-purple">Rising Sign</h4>
                    <p className="text-3xl font-bold text-soul-purple">{risingSign}</p>
                    <p className="text-sm text-gray-600">First impression</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1">Social Style</h5>
                    <p className="text-sm text-gray-600 capitalize">{socialStyle}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1">Public Vibe</h5>
                    <p className="text-sm text-gray-600 capitalize">{publicVibe}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1">Leadership Style</h5>
                    <p className="text-sm text-gray-600 capitalize">{leadershipStyle}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-soul-purple/5 rounded-lg">
                  <h5 className="font-semibold text-soul-purple mb-2">Generational Influence</h5>
                  <p className="text-lg font-bold text-soul-purple">{chineseZodiac} {element}</p>
                  <p className="text-sm text-gray-600">Chinese astrology adds generational wisdom to your profile</p>
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
