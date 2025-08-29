
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { LayeredBlueprint } from "@/types/personality-modules";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

interface SimplifiedBlueprintViewerProps {
  blueprint: LayeredBlueprint;
}

const SimplifiedBlueprintViewer: React.FC<SimplifiedBlueprintViewerProps> = ({ blueprint }) => {
  console.log('🎯 SimplifiedBlueprintViewer received LayeredBlueprint:', blueprint);
  const { spacing, getTextSize } = useResponsiveLayout();
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    overview: true, // Start with overview expanded
    mbti: false,
    humanDesign: false,
    numerology: false,
    astrology: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const hdType = blueprint?.energyDecisionStrategy?.humanDesignType || 'Generator';
  const authority = blueprint?.energyDecisionStrategy?.authority || 'Sacral';
  const strategy = blueprint?.energyDecisionStrategy?.strategy || 'respond';
  const profile = blueprint?.energyDecisionStrategy?.profile || '1/3';
  const pacing = blueprint?.energyDecisionStrategy?.pacing || 'steady';
  const energyType = blueprint?.energyDecisionStrategy?.energyType || 'sustainable';

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

  const sunSign = blueprint?.publicArchetype?.sunSign || 'Unknown';
  const moonSign = blueprint?.publicArchetype?.moonSign || 'Unknown';
  
  let risingSign = blueprint?.publicArchetype?.risingSign;
  if (!risingSign || risingSign === 'Calculating...' || risingSign === 'Unknown') {
    risingSign = 'Scorpio';
  }

  const socialStyle = blueprint?.publicArchetype?.socialStyle || 'warm';
  const publicVibe = blueprint?.publicArchetype?.publicVibe || 'approachable';
  const leadershipStyle = blueprint?.publicArchetype?.leadershipStyle || 'collaborative';

  const chineseZodiac = blueprint?.generationalCode?.chineseZodiac || 'Unknown';
  const element = blueprint?.generationalCode?.element || 'Unknown';

  const hasRealData = mbtiType !== 'Unknown' || sunSign !== 'Unknown' || lifePath > 1;

  const SectionHeader = ({ title, isExpanded, onClick }: { title: string; isExpanded: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between ${spacing.button} ${getTextSize('text-lg')} font-cormorant font-semibold text-left hover:bg-muted/50 rounded-lg transition-colors`}
    >
      <span>{title}</span>
      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );

  return (
    <div className={`space-y-4 w-full max-w-full overflow-hidden ${spacing.container}`}>
      {/* Header with status */}
      <div className="flex flex-col gap-3 mb-6 w-full max-w-full">
        <div className="w-full max-w-full">
          <h2 className={`${getTextSize('text-2xl')} font-cormorant font-bold break-words`}>
            {userName}'s Profile
          </h2>
          <p className={`${getTextSize('text-sm')} font-inter text-muted-foreground break-words`}>
            {hasRealData ? 
              "Calculated using advanced personality analysis" : 
              "Using template data - create your profile for personalized results"
            }
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full max-w-full">
          {hasRealData && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs flex-shrink-0 font-inter">
              ✅ Personalized Data
            </Badge>
          )}
          {!hasRealData && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs flex-shrink-0 font-inter">
              📋 Template Data
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Section - Always visible */}
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader className={spacing.card}>
          <SectionHeader 
            title="Personality Overview" 
            isExpanded={expandedSections.overview}
            onClick={() => toggleSection('overview')}
          />
        </CardHeader>
        {expandedSections.overview && (
          <CardContent className={`${spacing.card} pt-0`}>
            <div className="grid grid-cols-1 gap-4 w-full max-w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>MBTI Type</h4>
                  <p className={`${getTextSize('text-2xl')} font-cormorant font-bold text-soul-purple break-words`}>{mbtiType}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-600 break-words`}>{dominantFunction}</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Life Path</h4>
                  <p className={`${getTextSize('text-2xl')} font-cormorant font-bold text-soul-purple`}>{lifePath}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-600 break-words`}>{lifePathKeyword}</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Sun Sign</h4>
                  <p className={`${getTextSize('text-2xl')} font-cormorant font-bold text-soul-purple break-words`}>{sunSign}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-600 break-words`}>Core identity</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Human Design</h4>
                  <p className={`${getTextSize('text-lg')} font-cormorant font-bold text-soul-purple break-words`}>{hdType}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-600 break-words`}>{authority} Authority</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Chinese Zodiac</h4>
                  <p className={`${getTextSize('text-lg')} font-cormorant font-bold text-soul-purple break-words`}>{chineseZodiac}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-600 break-words`}>{element} Element</p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* MBTI Details */}
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader className={spacing.card}>
          <SectionHeader 
            title="MBTI Cognitive Profile" 
            isExpanded={expandedSections.mbti}
            onClick={() => toggleSection('mbti')}
          />
        </CardHeader>
        {expandedSections.mbti && (
          <CardContent className={`${spacing.card} pt-0`}>
            <div className="space-y-4 w-full max-w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>Personality Type</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{mbtiType}</p>
                </div>
                <div>
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>Cognitive Functions</h4>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}><strong>Dominant:</strong> {dominantFunction}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}><strong>Auxiliary:</strong> {auxiliaryFunction}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>Task Approach</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{taskApproach}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>Communication</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{communicationStyle}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>Decision Making</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{decisionMaking}</p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Human Design Details */}
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader className={spacing.card}>
          <SectionHeader 
            title="Human Design Profile" 
            isExpanded={expandedSections.humanDesign}
            onClick={() => toggleSection('humanDesign')}
          />
        </CardHeader>
        {expandedSections.humanDesign && (
          <CardContent className={`${spacing.card} pt-0`}>
            <div className="space-y-4 w-full max-w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>Energy Type</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{hdType}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}>{energyType} energy</p>
                </div>
                <div>
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>Decision Authority</h4>
                  <p className={`${getTextSize('text-xl')} font-cormorant font-bold text-soul-purple break-words`}>{authority}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}>Inner authority</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>Strategy</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{strategy}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>Profile</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple break-words`}>{profile}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>Pacing</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{pacing}</p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Numerology Details */}
      <CosmicCard className="w-full max-w-full overflow-hidden">
        <div className={spacing.card}>
          <SectionHeader 
            title="Complete Numerology Profile" 
            isExpanded={expandedSections.numerology}
            onClick={() => toggleSection('numerology')}
          />
        </div>
        {expandedSections.numerology && (
          <div className={`${spacing.card} pt-0`}>
            <div className="grid grid-cols-1 gap-6 w-full max-w-full">
              <div className="space-y-4">
                <div className="p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-base')} break-words`}>Life Path Number</h4>
                  <p className={`${getTextSize('text-4xl')} font-cormorant font-bold text-soul-purple`}>{lifePath}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{lifePathKeyword}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>Your life's core purpose and direction</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Expression Number</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{expressionNumber}</p>
                    <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{expressionKeyword}</p>
                    <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>Your natural talents and abilities</p>
                  </div>
                  <div className="p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Soul Urge Number</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{soulUrgeNumber}</p>
                    <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{soulUrgeKeyword}</p>
                    <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>Your heart's deepest desires</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Personality Number</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{personalityNumber}</p>
                    <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{personalityKeyword}</p>
                    <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>How others perceive you</p>
                  </div>
                  <div className="p-3 bg-soul-purple/5 rounded-3xl">
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Birthday Number</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{birthdayNumber}</p>
                    <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{birthdayKeyword}</p>
                    <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>Special talents from birth date</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className={`${getTextSize('text-sm')} font-inter text-gray-500 text-center break-words`}>
                Calculated from: {userMeta.full_name} • Born: {userMeta.birth_date ? new Date(userMeta.birth_date).toLocaleDateString() : 'Date on file'}
              </p>
            </div>
          </div>
        )}
      </CosmicCard>

      {/* Astrology Details */}
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader className={spacing.card}>
          <SectionHeader 
            title="Astrological Profile" 
            isExpanded={expandedSections.astrology}
            onClick={() => toggleSection('astrology')}
          />
        </CardHeader>
        {expandedSections.astrology && (
          <CardContent className={`${spacing.card} pt-0`}>
            <div className="space-y-4 w-full max-w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Sun Sign</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{sunSign}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 break-words`}>Core identity & ego</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Moon Sign</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{moonSign}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 break-words`}>Emotional nature</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>Rising Sign</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{risingSign}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 break-words`}>First impression</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div>
                  <h5 className={`font-cormorant font-semibold text-gray-700 mb-1 ${getTextSize('text-sm')} break-words`}>Social Style</h5>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 capitalize break-words`}>{socialStyle}</p>
                </div>
                <div>
                  <h5 className={`font-cormorant font-semibold text-gray-700 mb-1 ${getTextSize('text-sm')} break-words`}>Public Vibe</h5>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 capitalize break-words`}>{publicVibe}</p>
                </div>
                <div>
                  <h5 className={`font-cormorant font-semibold text-gray-700 mb-1 ${getTextSize('text-sm')} break-words`}>Leadership Style</h5>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 capitalize break-words`}>{leadershipStyle}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-soul-purple/5 rounded-3xl">
                <h5 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-sm')} break-words`}>Generational Influence</h5>
                <p className={`${getTextSize('text-lg')} font-cormorant font-bold text-soul-purple break-words`}>{chineseZodiac} {element}</p>
                <p className={`${getTextSize('text-sm')} font-inter text-gray-600 break-words`}>Chinese astrology adds generational wisdom to your profile</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SimplifiedBlueprintViewer;
