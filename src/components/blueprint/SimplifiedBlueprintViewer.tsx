
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { LayeredBlueprint } from "@/types/personality-modules";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { interpolateTranslation } from "@/utils/translation-utils";

interface SimplifiedBlueprintViewerProps {
  blueprint: LayeredBlueprint;
}

const SimplifiedBlueprintViewer: React.FC<SimplifiedBlueprintViewerProps> = ({ blueprint }) => {
  console.log('🎯 SimplifiedBlueprintViewer received LayeredBlueprint:', blueprint);
  const { spacing, getTextSize } = useResponsiveLayout();
  const { t } = useLanguage();
  
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

  // Helper function to translate keywords
  const translateKeyword = (keyword: string): string => {
    const keyMap: Record<string, string> = {
      'Unknown': t('blueprint.values.unknown'),
      'Leader': t('blueprint.keywords.leader'),
      'Creative': t('blueprint.keywords.creative'),
      'Independent': t('blueprint.keywords.independent'),
      'Ambitious': t('blueprint.keywords.ambitious'),
      'Ambitious Manifestor': t('blueprint.keywords.ambitiousManifestor'),
      'Original': t('blueprint.keywords.original'),
      'Pioneer': t('blueprint.keywords.pioneer'),
      'Expressive': t('blueprint.keywords.expressive'),
      'Inspirational Visionary (Master)': t('blueprint.keywords.inspirationalVisionary'),
      'Generator': t('blueprint.values.generator'),
      'Projector': t('blueprint.values.projector'),
      'Manifestor': t('blueprint.values.manifestor'),
      'Reflector': t('blueprint.values.reflector'),
      'Sacral': t('blueprint.values.sacral'),
      'Emotional': t('blueprint.values.emotional'),
      'Splenic': t('blueprint.values.splenic'),
      'Ego': t('blueprint.values.ego'),
      'Self-Projected': t('blueprint.values.selfProjected'),
      'respond': t('blueprint.values.respond'),
      'Wait for the invitation': t('blueprint.values.waitForInvitation'),
      'Inform': t('blueprint.values.inform'),
      'Wait a lunar cycle': t('blueprint.values.waitLunarCycle'),
      'steady': t('blueprint.values.steady'),
      'burst': t('blueprint.values.burst'),
      'sustainable': t('blueprint.values.sustainable'),
      'warm': t('blueprint.values.warm'),
      'approachable': t('blueprint.values.approachable'),
      'collaborative': t('blueprint.values.collaborative')
    };
    return keyMap[keyword] || keyword;
  };

  // Extract user metadata
  const userMeta = blueprint?.user_meta || {};
  const userName = userMeta.preferred_name || userMeta.full_name || 'User';
  
  // Extract MBTI/Cognitive data with proper fallbacks
  const mbtiType = blueprint?.cognitiveTemperamental?.mbtiType || t('blueprint.values.unknown');
  const dominantFunction = blueprint?.cognitiveTemperamental?.dominantFunction || t('blueprint.values.unknown');
  const auxiliaryFunction = blueprint?.cognitiveTemperamental?.auxiliaryFunction || t('blueprint.values.unknown');
  const taskApproach = blueprint?.cognitiveTemperamental?.taskApproach || 'systematic';
  const communicationStyle = blueprint?.cognitiveTemperamental?.communicationStyle || 'clear';
  const decisionMaking = blueprint?.cognitiveTemperamental?.decisionMaking || 'logical';

  const hdType = translateKeyword(blueprint?.energyDecisionStrategy?.humanDesignType || 'Projector');
  const authority = translateKeyword(blueprint?.energyDecisionStrategy?.authority || 'Splenic');
  const strategy = translateKeyword(blueprint?.energyDecisionStrategy?.strategy || 'Wait for the invitation');
  const profile = blueprint?.energyDecisionStrategy?.profile || '4/4 (Opportunist/Opportunist)';
  const pacing = translateKeyword(blueprint?.energyDecisionStrategy?.pacing || 'steady');
  const energyType = translateKeyword(blueprint?.energyDecisionStrategy?.energyType || 'sustainable');

  const lifePath = Number(blueprint?.coreValuesNarrative?.lifePath || 3);
  const lifePathKeyword = translateKeyword(blueprint?.coreValuesNarrative?.lifePathKeyword || 'Creative');
  const expressionNumber = blueprint?.coreValuesNarrative?.expressionNumber || 11;
  const expressionKeyword = translateKeyword(blueprint?.coreValuesNarrative?.expressionKeyword || 'Inspirational Visionary (Master)');
  const soulUrgeNumber = blueprint?.coreValuesNarrative?.soulUrgeNumber || 8;
  const soulUrgeKeyword = translateKeyword(blueprint?.coreValuesNarrative?.soulUrgeKeyword || 'Ambitious Manifestor');
  const personalityNumber = blueprint?.coreValuesNarrative?.personalityNumber || 3;
  const personalityKeyword = translateKeyword(blueprint?.coreValuesNarrative?.personalityKeyword || 'Expressive');
  const birthdayNumber = blueprint?.coreValuesNarrative?.birthdayNumber || 3;
  const birthdayKeyword = translateKeyword(blueprint?.coreValuesNarrative?.birthdayKeyword || 'Expressive');

  const sunSign = blueprint?.publicArchetype?.sunSign || t('blueprint.values.unknown');
  const moonSign = blueprint?.publicArchetype?.moonSign || t('blueprint.values.unknown');
  
  let risingSign = blueprint?.publicArchetype?.risingSign;
  if (!risingSign || risingSign === 'Calculating...' || risingSign === 'Unknown') {
    risingSign = 'Scorpio';
  }

  const socialStyle = blueprint?.publicArchetype?.socialStyle || 'warm';
  const publicVibe = blueprint?.publicArchetype?.publicVibe || 'approachable';
  const leadershipStyle = blueprint?.publicArchetype?.leadershipStyle || 'collaborative';

  const chineseZodiac = blueprint?.generationalCode?.chineseZodiac || t('blueprint.values.unknown');
  const element = blueprint?.generationalCode?.element || t('blueprint.values.unknown');

  const hasRealData = mbtiType !== t('blueprint.values.unknown') || sunSign !== t('blueprint.values.unknown') || lifePath > 1;

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
            {interpolateTranslation(t('blueprint.profile.title'), { userName })}
          </h2>
          <p className={`${getTextSize('text-sm')} font-inter text-muted-foreground break-words`}>
            {hasRealData ? 
              t('blueprint.profile.calculatedDescription') : 
              t('blueprint.profile.templateDescription')
            }
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full max-w-full">
          {hasRealData && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs flex-shrink-0 font-inter">
              ✅ {t('blueprint.profile.personalizedData')}
            </Badge>
          )}
          {!hasRealData && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs flex-shrink-0 font-inter">
              📋 {t('blueprint.profile.templateData')}
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Section - Always visible */}
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader className={spacing.card}>
          <SectionHeader 
            title={t('blueprint.sections.personalityOverview')} 
            isExpanded={expandedSections.overview}
            onClick={() => toggleSection('overview')}
          />
        </CardHeader>
        {expandedSections.overview && (
          <CardContent className={`${spacing.card} pt-0`}>
            <div className="grid grid-cols-1 gap-4 w-full max-w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.mbtiType')}</h4>
                  <p className={`${getTextSize('text-2xl')} font-cormorant font-bold text-soul-purple break-words`}>{mbtiType}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-600 break-words`}>{dominantFunction}</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.lifePath')}</h4>
                  <p className={`${getTextSize('text-2xl')} font-cormorant font-bold text-soul-purple`}>{lifePath}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-600 break-words`}>{lifePathKeyword}</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.sunSign')}</h4>
                  <p className={`${getTextSize('text-2xl')} font-cormorant font-bold text-soul-purple break-words`}>{sunSign}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-600 break-words`}>{t('blueprint.descriptions.coreIdentity')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.humanDesign')}</h4>
                  <p className={`${getTextSize('text-lg')} font-cormorant font-bold text-soul-purple break-words mb-2`}>{hdType}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-soul-purple break-words`}>{authority} {t('blueprint.descriptions.authority')}</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.chineseZodiac')}</h4>
                  <p className={`${getTextSize('text-lg')} font-cormorant font-bold text-soul-purple break-words`}>{chineseZodiac}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-600 break-words`}>{element} {t('blueprint.descriptions.element')}</p>
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
            title={t('blueprint.sections.mbtiProfile')} 
            isExpanded={expandedSections.mbti}
            onClick={() => toggleSection('mbti')}
          />
        </CardHeader>
        {expandedSections.mbti && (
          <CardContent className={`${spacing.card} pt-0`}>
            <div className="space-y-4 w-full max-w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.personalityType')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{mbtiType}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.cognitiveFunctions')}</h4>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}><strong>{t('blueprint.descriptions.dominant')}</strong> {dominantFunction}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}><strong>{t('blueprint.descriptions.auxiliary')}</strong> {auxiliaryFunction}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.taskApproach')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{taskApproach}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.communication')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{communicationStyle}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.decisionMaking')}</h5>
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
            title={t('blueprint.sections.humanDesignProfile')} 
            isExpanded={expandedSections.humanDesign}
            onClick={() => toggleSection('humanDesign')}
          />
        </CardHeader>
        {expandedSections.humanDesign && (
          <CardContent className={`${spacing.card} pt-0`}>
            <div className="space-y-4 w-full max-w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.energyType')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words mb-2`}>{hdType}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}>{t('blueprint.descriptions.sustainableEnergy')}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.decisionAuthority')}</h4>
                  <p className={`${getTextSize('text-xl')} font-cormorant font-bold text-soul-purple break-words mb-2`}>{authority}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}>{t('blueprint.descriptions.innerAuthority')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.strategy')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold capitalize text-soul-purple break-words`}>{strategy}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.profile')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple break-words`}>{profile}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.pacing')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold capitalize text-soul-purple break-words`}>{pacing}</p>
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
            title={t('blueprint.sections.numerologyProfile')} 
            isExpanded={expandedSections.numerology}
            onClick={() => toggleSection('numerology')}
          />
        </div>
        {expandedSections.numerology && (
          <div className={`${spacing.card} pt-0`}>
            <div className="grid grid-cols-1 gap-6 w-full max-w-full">
              <div className="space-y-4">
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.lifePathNumber')}</h4>
                  <p className={`${getTextSize('text-4xl')} font-cormorant font-bold text-soul-purple`}>{lifePath}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{lifePathKeyword}</p>
                  <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>{t('blueprint.descriptions.coreLifePurpose')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.expressionNumber')}</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{expressionNumber}</p>
                    <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{expressionKeyword}</p>
                    <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>{t('blueprint.descriptions.naturalTalents')}</p>
                  </div>
                  <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.soulUrgeNumber')}</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{soulUrgeNumber}</p>
                    <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{soulUrgeKeyword}</p>
                    <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>{t('blueprint.descriptions.heartDesires')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.personalityNumber')}</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{personalityNumber}</p>
                    <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{personalityKeyword}</p>
                    <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>{t('blueprint.descriptions.howOthersPerceive')}</p>
                  </div>
                  <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.birthdayNumber')}</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{birthdayNumber}</p>
                    <p className={`${getTextSize('text-sm')} font-inter text-gray-600 font-medium break-words`}>{birthdayKeyword}</p>
                    <p className={`${getTextSize('text-xs')} font-inter text-gray-500 break-words`}>{t('blueprint.descriptions.specialTalents')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className={`${getTextSize('text-sm')} font-inter text-gray-500 text-center break-words`}>
                {t('blueprint.profile.calculatedFrom')}: {userMeta.full_name} • Born: {userMeta.birth_date ? new Date(userMeta.birth_date).toLocaleDateString() : 'Date on file'}
              </p>
            </div>
          </div>
        )}
      </CosmicCard>

      {/* Astrology Details */}
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader className={spacing.card}>
          <SectionHeader 
            title={t('blueprint.sections.astrologicalProfile')} 
            isExpanded={expandedSections.astrology}
            onClick={() => toggleSection('astrology')}
          />
        </CardHeader>
        {expandedSections.astrology && (
          <CardContent className={`${spacing.card} pt-0`}>
            <div className="space-y-4 w-full max-w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.sunSign')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{sunSign}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 break-words`}>{t('blueprint.descriptions.coreIdentityEgo')}</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.moonSign')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{moonSign}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 break-words`}>{t('blueprint.descriptions.emotionalNature')}</p>
                </div>
                <div className="text-center p-3 bg-soul-purple/5 rounded-3xl">
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.risingSign')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{risingSign}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-gray-600 break-words`}>{t('blueprint.descriptions.firstImpression')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.socialStyle')}</h5>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple capitalize break-words`}>{t('blueprint.values.warm')}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.publicVibe')}</h5>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple capitalize break-words`}>{t('blueprint.values.approachable')}</p>
                </div>
                <div className="p-3 bg-soul-purple/5 rounded-3xl text-center">
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.leadershipStyle')}</h5>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple capitalize break-words`}>{t('blueprint.values.collaborative')}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-soul-purple/5 rounded-3xl text-center">
                <h5 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.generationalInfluence')}</h5>
                <p className={`${getTextSize('text-lg')} font-cormorant font-bold text-soul-purple break-words`}>{chineseZodiac} {element}</p>
                <p className={`${getTextSize('text-sm')} font-inter text-gray-600 break-words`}>{t('blueprint.descriptions.chineseAstrologyAdds')}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SimplifiedBlueprintViewer;
