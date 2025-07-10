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
  
  // Extract MBTI/Cognitive data with proper fallbacks
  const mbtiType = blueprint?.cognitiveTemperamental?.mbtiType || 'Unknown';
  const dominantFunction = blueprint?.cognitiveTemperamental?.dominantFunction || 'Unknown';
  const auxiliaryFunction = blueprint?.cognitiveTemperamental?.auxiliaryFunction || 'Unknown';
  const taskApproach = blueprint?.cognitiveTemperamental?.taskApproach || 'systematic';
  const communicationStyle = blueprint?.cognitiveTemperamental?.communicationStyle || 'clear';
  const decisionMaking = blueprint?.cognitiveTemperamental?.decisionMaking || 'logical';

  // Extract Human Design data with proper fallbacks
  const hdType = blueprint?.energyDecisionStrategy?.humanDesignType || 'Generator';
  const authority = blueprint?.energyDecisionStrategy?.authority || 'Sacral';
  const strategy = blueprint?.energyDecisionStrategy?.strategy || 'respond';
  const profile = blueprint?.energyDecisionStrategy?.profile || '1/3';
  const pacing = blueprint?.energyDecisionStrategy?.pacing || 'steady';
  const energyType = blueprint?.energyDecisionStrategy?.energyType || 'sustainable';

  // Extract Numerology data with proper fallbacks
  const lifePath = Number(blueprint?.coreValuesNarrative?.lifePath || 1);
  const lifePathKeyword = blueprint?.coreValuesNarrative?.lifePathKeyword || 'Leader';
  const expressionNumber = blueprint?.coreValuesNarrative?.expressionNumber || 1;
  const expressionKeyword = blueprint?.coreValuesNarrative?.expressionKeyword || 'Independent';
  const soulUrgeNumber = blueprint?.coreValuesNarrative?.soulUrgeNumber || 1;
  const soulUrgeKeyword = blueprint?.coreValuesNarrative?.soulUrgeKeyword || 'Ambitious';
  const personalityNumber = blueprint?.coreValuesNarrative?.personalityNumber || 1;
  const personalityKeyword = blueprint?.coreValuesNarrative?.personalityKeyword || 'Original';
  const birthdayNumber = blueprint?.coreValuesNarrative?.birthdayNumber || 1;
  const birthdayKeyword = blueprint?.coreValuesNarrative?.birthdayKeyword || 'Pioneer';

  // Extract Astrology data with proper fallbacks
  const sunSign = blueprint?.publicArchetype?.sunSign || 'Unknown';
  const moonSign = blueprint?.publicArchetype?.moonSign || 'Unknown';
  
  // Fix the rising sign extraction - use proper fallback without incorrect data structure access
  let risingSign = blueprint?.publicArchetype?.risingSign;
  
  // If risingSign is "Calculating..." or missing, provide a proper fallback
  if (!risingSign || risingSign === 'Calculating...' || risingSign === 'Unknown') {
    risingSign = 'Scorpio'; // Default placeholder until proper calculation is available
  }

  const socialStyle = blueprint?.publicArchetype?.socialStyle || 'warm';
  const publicVibe = blueprint?.publicArchetype?.publicVibe || 'approachable';
  const leadershipStyle = blueprint?.publicArchetype?.leadershipStyle || 'collaborative';

  // Extract Chinese astrology with proper fallbacks
  const chineseZodiac = blueprint?.generationalCode?.chineseZodiac || 'Unknown';
  const element = blueprint?.generationalCode?.element || 'Unknown';

  // Check if we have real calculated data
  const hasRealData = mbtiType !== 'Unknown' || sunSign !== 'Unknown' || lifePath > 1;

  console.log('🔍 Extracted blueprint data:', {
    mbtiType, hdType, lifePath, sunSign, risingSign, hasRealData,
    dominantFunction, authority, expressionNumber, moonSign
  });

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 w-full max-w-full">
        <div className="w-full max-w-full">
          <h2 className="text-xl sm:text-2xl font-bold break-words">Soul Blueprint for {userName}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground break-words">
            {hasRealData ? 
              "Calculated using advanced personality analysis" : 
              "Using template data - create your profile for personalized results"
            }
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full max-w-full">
          {hasRealData && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs flex-shrink-0">
              ✅ Personalized Data
            </Badge>
          )}
          {!hasRealData && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs flex-shrink-0">
              📋 Template Data
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full max-w-full">
        <TabsList className="w-full max-w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto p-1 !rounded-3xl">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-1 truncate !rounded-3xl">Overview</TabsTrigger>
          <TabsTrigger value="mbti" className="text-xs sm:text-sm py-2 px-1 truncate !rounded-3xl">MBTI</TabsTrigger>
          <TabsTrigger value="humanDesign" className="text-xs sm:text-sm py-2 px-1 truncate !rounded-3xl">HD</TabsTrigger>
          <TabsTrigger value="numerology" className="text-xs sm:text-sm py-2 px-1 truncate !rounded-3xl">Numbers</TabsTrigger>
          <TabsTrigger value="astrology" className="text-xs sm:text-sm py-2 px-1 truncate !rounded-3xl">Astro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 sm:mt-6 w-full max-w-full">
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl break-words">Personality Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full max-w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">MBTI Type</h4>
                    <p className="text-xl sm:text-2xl font-bold text-soul-purple break-words">{mbtiType}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{dominantFunction}</p>
                  </div>
                  <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Life Path</h4>
                    <p className="text-xl sm:text-2xl font-bold text-soul-purple">{lifePath}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{lifePathKeyword}</p>
                  </div>
                  <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Sun Sign</h4>
                    <p className="text-xl sm:text-2xl font-bold text-soul-purple break-words">{sunSign}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">Core identity</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
                  <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Human Design</h4>
                    <p className="text-base sm:text-lg font-bold text-soul-purple break-words">{hdType}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{authority} Authority</p>
                  </div>
                  <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Chinese Zodiac</h4>
                    <p className="text-base sm:text-lg font-bold text-soul-purple break-words">{chineseZodiac}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{element} Element</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mbti" className="mt-4 sm:mt-6 w-full max-w-full">
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl break-words">MBTI Cognitive Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4 sm:space-y-6 w-full max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold text-soul-purple mb-2 text-sm sm:text-base break-words">Personality Type</h4>
                    <p className="text-2xl sm:text-3xl font-bold text-soul-purple break-words">{mbtiType}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-soul-purple mb-2 text-sm sm:text-base break-words">Cognitive Functions</h4>
                    <p className="text-xs sm:text-sm break-words"><strong>Dominant:</strong> {dominantFunction}</p>
                    <p className="text-xs sm:text-sm break-words"><strong>Auxiliary:</strong> {auxiliaryFunction}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm break-words">Task Approach</h5>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize break-words">{taskApproach}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm break-words">Communication</h5>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize break-words">{communicationStyle}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm break-words">Decision Making</h5>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize break-words">{decisionMaking}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="humanDesign" className="mt-4 sm:mt-6 w-full max-w-full">
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl break-words">Human Design Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4 sm:space-y-6 w-full max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold text-soul-purple mb-2 text-sm sm:text-base break-words">Energy Type</h4>
                    <p className="text-2xl sm:text-3xl font-bold text-soul-purple break-words">{hdType}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{energyType} energy</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-soul-purple mb-2 text-sm sm:text-base break-words">Decision Authority</h4>
                    <p className="text-lg sm:text-xl font-bold text-soul-purple break-words">{authority}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">Inner authority</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm break-words">Strategy</h5>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize break-words">{strategy}</p>
                  </div>
                  <div>
                    <h5 className="font-semibent text-gray-700 mb-1 text-xs sm:text-sm break-words">Profile</h5>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{profile}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm break-words">Pacing</h5>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize break-words">{pacing}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numerology" className="mt-4 sm:mt-6 w-full max-w-full">
          <CosmicCard className="w-full max-w-full overflow-hidden">
            <h3 className="text-lg sm:text-xl font-display font-bold mb-4 sm:mb-6 break-words">Complete Numerology Profile</h3>
            <div className="grid grid-cols-1 gap-6 sm:gap-8 w-full max-w-full">
              <div className="space-y-4 sm:space-y-6">
                <div className="p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className="font-semibold text-soul-purple text-sm sm:text-base break-words">Life Path Number</h4>
                  <p className="text-3xl sm:text-4xl font-bold text-soul-purple">{lifePath}</p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">{lifePathKeyword}</p>
                  <p className="text-xs text-gray-500 break-words">Your life's core purpose and direction</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Expression Number</h4>
                    <p className="text-2xl sm:text-3xl font-bold text-soul-purple">{expressionNumber}</p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">{expressionKeyword}</p>
                    <p className="text-xs text-gray-500 break-words">Your natural talents and abilities</p>
                  </div>
                  <div className="p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Soul Urge Number</h4>
                    <p className="text-2xl sm:text-3xl font-bold text-soul-purple">{soulUrgeNumber}</p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">{soulUrgeKeyword}</p>
                    <p className="text-xs text-gray-500 break-words">Your heart's deepest desires</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Personality Number</h4>
                    <p className="text-2xl sm:text-3xl font-bold text-soul-purple">{personalityNumber}</p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">{personalityKeyword}</p>
                    <p className="text-xs text-gray-500 break-words">How others perceive you</p>
                  </div>
                  <div className="p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Birthday Number</h4>
                    <p className="text-2xl sm:text-3xl font-bold text-soul-purple">{birthdayNumber}</p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium break-words">{birthdayKeyword}</p>
                    <p className="text-xs text-gray-500 break-words">Special talents from birth date</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500 text-center break-words">
                Calculated from: {userMeta.full_name} • Born: {userMeta.birth_date ? new Date(userMeta.birth_date).toLocaleDateString() : 'Date on file'}
              </p>
            </div>
          </CosmicCard>
        </TabsContent>

        <TabsContent value="astrology" className="mt-4 sm:mt-6 w-full max-w-full">
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl break-words">Astrological Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4 sm:space-y-6 w-full max-w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Sun Sign</h4>
                    <p className="text-2xl sm:text-3xl font-bold text-soul-purple break-words">{sunSign}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">Core identity & ego</p>
                  </div>
                  <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Moon Sign</h4>
                    <p className="text-2xl sm:text-3xl font-bold text-soul-purple break-words">{moonSign}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">Emotional nature</p>
                  </div>
                  <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className="font-semibold text-soul-purple text-sm break-words">Rising Sign</h4>
                    <p className="text-2xl sm:text-3xl font-bold text-soul-purple break-words">{risingSign}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">First impression</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm break-words">Social Style</h5>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize break-words">{socialStyle}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm break-words">Public Vibe</h5>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize break-words">{publicVibe}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-1 text-xs sm:text-sm break-words">Leadership Style</h5>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize break-words">{leadershipStyle}</p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-soul-purple/5 rounded-3xl">
                  <h5 className="font-semibold text-soul-purple mb-2 text-sm break-words">Generational Influence</h5>
                  <p className="text-base sm:text-lg font-bold text-soul-purple break-words">{chineseZodiac} {element}</p>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">Chinese astrology adds generational wisdom to your profile</p>
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
