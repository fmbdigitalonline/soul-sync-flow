
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { LayeredBlueprint } from "@/types/personality-modules";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { interpolateTranslation } from "@/utils/translation-utils";
import { getCognitiveFunctions } from "@/utils/mbti-cognitive-functions";
import { getPersonalityDescription } from "@/utils/personality-descriptions";
import PersonalityDetailModal from "./PersonalityDetailModal";
import { PersonalityDescription } from "./PersonalityDescription";

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

  // State for personality detail modal
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    mainValue: string;
    light: string;
    shadow: string;
    insight: string;
    think?: string;
    act?: string;
    react?: string;
    category: string;
  } | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openDetailModal = (data: Omit<typeof modalData, 'isOpen'>) => {
    setModalData({ ...data, isOpen: true });
  };

  const closeModal = () => {
    setModalData(prev => prev ? { ...prev, isOpen: false } : null);
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
  
  // Derive cognitive functions from MBTI type
  const cognitiveFunctions = mbtiType !== t('blueprint.values.unknown') ? getCognitiveFunctions(mbtiType) : null;
  const dominantFunction = cognitiveFunctions?.dominant || blueprint?.cognitiveTemperamental?.dominantFunction || t('blueprint.values.unknown');
  const auxiliaryFunction = cognitiveFunctions?.auxiliary || blueprint?.cognitiveTemperamental?.auxiliaryFunction || t('blueprint.values.unknown');
  
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
  
  // Get Chinese element description
  const getChineseElementDescription = (elem: string): string => {
    const elemLower = elem.toLowerCase();
    const key = `blueprint.chineseElements.${elemLower}`;
    const translated = t(key);
    return translated !== key ? translated : elem;
  };
  
  // Get Chinese zodiac trait description
  const getChineseZodiacTrait = (zodiac: string): string => {
    const zodiacLower = zodiac.toLowerCase();
    const key = `blueprint.chineseZodiacTraits.${zodiacLower}`;
    const translated = t(key);
    return translated !== key ? translated : t('blueprint.descriptions.chineseAstrologyAdds');
  };

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
                <div 
                  className="text-center p-3 bg-soul-purple/5 rounded-3xl cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'mbtiDescriptions', mbtiType);
                    console.log('🔍 Opening MBTI modal with alignment data:', {
                      mbtiType,
                      hasThink: !!desc.think,
                      hasAct: !!desc.act,
                      hasReact: !!desc.react
                    });
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.mbtiType'),
                      mainValue: mbtiType,
                      ...desc,
                      category: 'MBTI'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'mbtiDescriptions', mbtiType);
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.mbtiType'),
                        mainValue: mbtiType,
                        ...desc,
                        category: 'MBTI'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your MBTI type: ${mbtiType}`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.mbtiType')}</h4>
                  <p className={`${getTextSize('text-2xl')} font-cormorant font-bold text-soul-purple break-words`}>{mbtiType}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'mbtiDescriptions', mbtiType);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="text-center p-3 bg-soul-purple/5 rounded-3xl cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'lifePathDescriptions', lifePath);
                    console.log('🔍 Opening Life Path modal with alignment data:', {
                      lifePath,
                      hasThink: !!desc.think,
                      hasAct: !!desc.act,
                      hasReact: !!desc.react
                    });
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.lifePath'),
                      mainValue: String(lifePath),
                      ...desc,
                      category: 'Numerology'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'lifePathDescriptions', lifePath);
                      console.log('🔍 Opening Life Path modal with alignment data:', {
                        lifePath,
                        hasThink: !!desc.think,
                        hasAct: !!desc.act,
                        hasReact: !!desc.react
                      });
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.lifePath'),
                        mainValue: String(lifePath),
                        ...desc,
                        category: 'Numerology'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your Life Path number: ${lifePath}`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.lifePath')}</h4>
                  <p className={`${getTextSize('text-2xl')} font-cormorant font-bold text-soul-purple`}>{lifePath}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'lifePathDescriptions', lifePath);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="text-center p-3 bg-soul-purple/5 rounded-3xl cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'sunSignDescriptions', sunSign);
                    console.log('🔍 Opening Sun Sign modal with alignment data:', {
                      sunSign,
                      hasThink: !!desc.think,
                      hasAct: !!desc.act,
                      hasReact: !!desc.react
                    });
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.sunSign'),
                      mainValue: sunSign,
                      ...desc,
                      category: 'Astrology'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'sunSignDescriptions', sunSign);
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.sunSign'),
                        mainValue: sunSign,
                        ...desc,
                        category: 'Astrology'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your Sun sign: ${sunSign}`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.sunSign')}</h4>
                  <p className={`${getTextSize('text-2xl')} font-cormorant font-bold text-soul-purple break-words`}>{sunSign}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'sunSignDescriptions', sunSign);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div 
                  className="text-center p-3 bg-soul-purple/5 rounded-3xl cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'humanDesignDescriptions', hdType);
                    console.log('🔍 Opening Human Design Type modal with alignment data:', {
                      hdType,
                      hasThink: !!desc.think,
                      hasAct: !!desc.act,
                      hasReact: !!desc.react
                    });
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.humanDesign'),
                      mainValue: hdType,
                      ...desc,
                      category: 'Human Design'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'humanDesignDescriptions', hdType);
                      console.log('🔍 Opening Human Design Type modal with alignment data:', {
                        hdType,
                        hasThink: !!desc.think,
                        hasAct: !!desc.act,
                        hasReact: !!desc.react
                      });
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.humanDesign'),
                        mainValue: hdType,
                        ...desc,
                        category: 'Human Design'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your Human Design type: ${hdType}`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.humanDesign')}</h4>
                  <p className={`${getTextSize('text-lg')} font-cormorant font-bold text-soul-purple break-words mb-2`}>{hdType}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'humanDesignDescriptions', hdType);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="text-center p-3 bg-soul-purple/5 rounded-3xl cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'chineseZodiacDescriptions', chineseZodiac);
                    console.log('🔍 Opening Chinese Zodiac modal with alignment data:', {
                      chineseZodiac,
                      hasThink: !!desc.think,
                      hasAct: !!desc.act,
                      hasReact: !!desc.react
                    });
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.chineseZodiac'),
                      mainValue: `${chineseZodiac} ${element}`,
                      ...desc,
                      category: 'Chinese Zodiac'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'chineseZodiacDescriptions', chineseZodiac);
                      console.log('🔍 Opening Chinese Zodiac modal with alignment data:', {
                        chineseZodiac,
                        hasThink: !!desc.think,
                        hasAct: !!desc.act,
                        hasReact: !!desc.react
                      });
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.chineseZodiac'),
                        mainValue: `${chineseZodiac} ${element}`,
                        ...desc,
                        category: 'Chinese Zodiac'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your Chinese Zodiac: ${chineseZodiac}`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.chineseZodiac')}</h4>
                  <p className={`${getTextSize('text-lg')} font-cormorant font-bold text-soul-purple break-words`}>{chineseZodiac} {element}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'chineseZodiacDescriptions', chineseZodiac);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
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
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'mbtiDescriptions', mbtiType);
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.personalityType'),
                      mainValue: mbtiType,
                      ...desc,
                      category: 'MBTI'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'mbtiDescriptions', mbtiType);
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.personalityType'),
                        mainValue: mbtiType,
                        ...desc,
                        category: 'MBTI'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your MBTI personality type`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.personalityType')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{mbtiType}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'mbtiDescriptions', mbtiType);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'cognitiveFunctionDescriptions', dominantFunction.toLowerCase());
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.cognitiveFunctions'),
                      mainValue: `${dominantFunction} / ${auxiliaryFunction}`,
                      ...desc,
                      category: 'MBTI'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'cognitiveFunctionDescriptions', dominantFunction.toLowerCase());
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.cognitiveFunctions'),
                        mainValue: `${dominantFunction} / ${auxiliaryFunction}`,
                        ...desc,
                        category: 'MBTI'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="View cognitive functions details"
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.cognitiveFunctions')}</h4>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}><strong>{t('blueprint.descriptions.dominant')}</strong> {dominantFunction}</p>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple break-words`}><strong>{t('blueprint.descriptions.auxiliary')}</strong> {auxiliaryFunction}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'cognitiveFunctionDescriptions', dominantFunction.toLowerCase());
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'taskApproachDescriptions', taskApproach);
                    console.log('🔍 Opening Task Approach modal:', { hasThink: !!desc.think, hasAct: !!desc.act, hasReact: !!desc.react });
                    openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.taskApproach'), mainValue: taskApproach, ...desc, category: 'MBTI' });
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.taskApproach')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{taskApproach}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'taskApproachDescriptions', taskApproach);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'communicationDescriptions', communicationStyle);
                    console.log('🔍 Opening Communication modal:', { hasThink: !!desc.think, hasAct: !!desc.act, hasReact: !!desc.react });
                    openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.communication'), mainValue: communicationStyle, ...desc, category: 'MBTI' });
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.communication')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{communicationStyle}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'communicationDescriptions', communicationStyle);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'decisionMakingDescriptions', decisionMaking);
                    console.log('🔍 Opening Decision Making modal:', { hasThink: !!desc.think, hasAct: !!desc.act, hasReact: !!desc.react });
                    openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.decisionMaking'), mainValue: decisionMaking, ...desc, category: 'MBTI' });
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.decisionMaking')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple capitalize break-words`}>{decisionMaking}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'decisionMakingDescriptions', decisionMaking);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
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
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'humanDesignDescriptions', hdType);
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.energyType'),
                      mainValue: hdType,
                      ...desc,
                      category: 'Human Design'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'humanDesignDescriptions', hdType);
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.energyType'),
                        mainValue: hdType,
                        ...desc,
                        category: 'Human Design'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your Human Design energy type`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.energyType')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words mb-2`}>{hdType}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'humanDesignDescriptions', hdType);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'authorityDescriptions', authority);
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.decisionAuthority'),
                      mainValue: authority,
                      ...desc,
                      category: 'Human Design Authority'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'authorityDescriptions', authority);
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.decisionAuthority'),
                        mainValue: authority,
                        ...desc,
                        category: 'Human Design Authority'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your decision authority`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.decisionAuthority')}</h4>
                  <p className={`${getTextSize('text-xl')} font-cormorant font-bold text-soul-purple break-words mb-2`}>{authority}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'authorityDescriptions', authority);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'strategyDescriptions', strategy);
                    console.log('🔍 Opening Strategy modal:', { hasThink: !!desc.think, hasAct: !!desc.act, hasReact: !!desc.react });
                    openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.strategy'), mainValue: strategy, ...desc, category: 'Human Design' });
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.strategy')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold capitalize text-soul-purple break-words`}>{strategy}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'strategyDescriptions', strategy);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'profileDescriptions', profile);
                    console.log('🔍 Opening Profile modal:', { hasThink: !!desc.think, hasAct: !!desc.act, hasReact: !!desc.react });
                    openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.profile'), mainValue: profile, ...desc, category: 'Human Design' });
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.profile')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold text-soul-purple break-words`}>{profile}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'profileDescriptions', profile);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'pacingDescriptions', pacing);
                    console.log('🔍 Opening Pacing modal:', { hasThink: !!desc.think, hasAct: !!desc.act, hasReact: !!desc.react });
                    openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.pacing'), mainValue: pacing, ...desc, category: 'Human Design' });
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.pacing')}</h5>
                  <p className={`${getTextSize('text-lg')} font-inter font-bold capitalize text-soul-purple break-words`}>{pacing}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'pacingDescriptions', pacing);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
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
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'lifePathDescriptions', lifePath);
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.lifePathNumber'),
                      mainValue: String(lifePath),
                      ...desc,
                      category: 'Numerology'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'lifePathDescriptions', lifePath);
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.lifePathNumber'),
                        mainValue: String(lifePath),
                        ...desc,
                        category: 'Numerology'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your Life Path number`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-base')} break-words`}>{t('blueprint.labels.lifePathNumber')}</h4>
                  <p className={`${getTextSize('text-4xl')} font-cormorant font-bold text-soul-purple`}>{lifePath}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'lifePathDescriptions', lifePath);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                    onClick={() => {
                      const desc = getPersonalityDescription(t, 'expressionNumberDescriptions', expressionNumber);
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.expressionNumber'),
                        mainValue: String(expressionNumber),
                        ...desc,
                        category: 'Numerology'
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const desc = getPersonalityDescription(t, 'expressionNumberDescriptions', expressionNumber);
                        openDetailModal({
                          title: desc.fullTitle,
                          subtitle: t('blueprint.labels.expressionNumber'),
                          mainValue: String(expressionNumber),
                          ...desc,
                          category: 'Numerology'
                        });
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View detailed information about your Expression number`}
                  >
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.expressionNumber')}</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{expressionNumber}</p>
                    {(() => {
                      const desc = getPersonalityDescription(t, 'expressionNumberDescriptions', expressionNumber);
                      return <PersonalityDescription {...desc} compact={true} />;
                    })()}
                  </div>
                  <div 
                    className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                    onClick={() => {
                      const desc = getPersonalityDescription(t, 'soulUrgeDescriptions', soulUrgeNumber);
                      console.log('🔍 Opening Soul Urge modal:', { hasThink: !!desc.think, hasAct: !!desc.act, hasReact: !!desc.react });
                      openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.soulUrgeNumber'), mainValue: String(soulUrgeNumber), ...desc, category: 'Numerology' });
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.soulUrgeNumber')}</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{soulUrgeNumber}</p>
                    {(() => {
                      const desc = getPersonalityDescription(t, 'soulUrgeDescriptions', soulUrgeNumber);
                      return <PersonalityDescription {...desc} compact={true} />;
                    })()}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                    onClick={() => {
                      const desc = getPersonalityDescription(t, 'personalityNumberDescriptions', personalityNumber);
                      console.log('🔍 Opening Personality Number modal:', { hasThink: !!desc.think, hasAct: !!desc.act, hasReact: !!desc.react });
                      openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.personalityNumber'), mainValue: String(personalityNumber), ...desc, category: 'Numerology' });
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.personalityNumber')}</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{personalityNumber}</p>
                    {(() => {
                      const desc = getPersonalityDescription(t, 'personalityNumberDescriptions', personalityNumber);
                      return <PersonalityDescription {...desc} compact={true} />;
                    })()}
                  </div>
                  <div 
                    className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                    onClick={() => {
                      const desc = getPersonalityDescription(t, 'birthdayNumberDescriptions', birthdayNumber);
                      console.log('🔍 Opening Birthday Number modal:', { hasThink: !!desc.think, hasAct: !!desc.act, hasReact: !!desc.react });
                      openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.birthdayNumber'), mainValue: String(birthdayNumber), ...desc, category: 'Numerology' });
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.birthdayNumber')}</h4>
                    <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple`}>{birthdayNumber}</p>
                    {(() => {
                      const desc = getPersonalityDescription(t, 'birthdayNumberDescriptions', birthdayNumber);
                      return <PersonalityDescription {...desc} compact={true} />;
                    })()}
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
                <div 
                  className="text-center p-3 bg-soul-purple/5 rounded-3xl cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'sunSignDescriptions', sunSign);
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.sunSign'),
                      mainValue: sunSign,
                      ...desc,
                      category: 'Astrology'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'sunSignDescriptions', sunSign);
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.sunSign'),
                        mainValue: sunSign,
                        ...desc,
                        category: 'Astrology'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your Sun sign`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.sunSign')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{sunSign}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'sunSignDescriptions', sunSign);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="text-center p-3 bg-soul-purple/5 rounded-3xl cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'moonSignDescriptions', moonSign);
                    console.log('🔍 Opening Moon Sign modal with alignment data:', {
                      moonSign,
                      hasThink: !!desc.think,
                      hasAct: !!desc.act,
                      hasReact: !!desc.react
                    });
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.moonSign'),
                      mainValue: moonSign,
                      ...desc,
                      category: 'Astrology'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'moonSignDescriptions', moonSign);
                      console.log('🔍 Opening Moon Sign modal with alignment data:', {
                        moonSign,
                        hasThink: !!desc.think,
                        hasAct: !!desc.act,
                        hasReact: !!desc.react
                      });
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.moonSign'),
                        mainValue: moonSign,
                        ...desc,
                        category: 'Astrology'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your Moon sign`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.moonSign')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{moonSign}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'moonSignDescriptions', moonSign);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="text-center p-3 bg-soul-purple/5 rounded-3xl cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'risingSignDescriptions', risingSign);
                    console.log('🔍 Opening Rising Sign modal with alignment data:', {
                      risingSign,
                      hasThink: !!desc.think,
                      hasAct: !!desc.act,
                      hasReact: !!desc.react
                    });
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.risingSign'),
                      mainValue: risingSign,
                      ...desc,
                      category: 'Astrology'
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const desc = getPersonalityDescription(t, 'risingSignDescriptions', risingSign);
                      console.log('🔍 Opening Rising Sign modal with alignment data:', {
                        risingSign,
                        hasThink: !!desc.think,
                        hasAct: !!desc.act,
                        hasReact: !!desc.react
                      });
                      openDetailModal({
                        title: desc.fullTitle,
                        subtitle: t('blueprint.labels.risingSign'),
                        mainValue: risingSign,
                        ...desc,
                        category: 'Astrology'
                      });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View detailed information about your Rising sign`}
                >
                  <h4 className={`font-cormorant font-semibold text-soul-purple ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.risingSign')}</h4>
                  <p className={`${getTextSize('text-3xl')} font-cormorant font-bold text-soul-purple break-words`}>{risingSign}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'risingSignDescriptions', risingSign);
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'socialStyleDescriptions', 'warm');
                    openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.socialStyle'), mainValue: t('blueprint.values.warm'), ...desc, category: 'Astrology' });
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.socialStyle')}</h5>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple capitalize break-words`}>{t('blueprint.values.warm')}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'socialStyleDescriptions', 'warm');
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'publicVibeDescriptions', 'approachable');
                    openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.publicVibe'), mainValue: t('blueprint.values.approachable'), ...desc, category: 'Astrology' });
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.publicVibe')}</h5>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple capitalize break-words`}>{t('blueprint.values.approachable')}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'publicVibeDescriptions', 'approachable');
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
                <div 
                  className="p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    const desc = getPersonalityDescription(t, 'leadershipStyleDescriptions', 'collaborative');
                    openDetailModal({ title: desc.fullTitle, subtitle: t('blueprint.labels.leadershipStyle'), mainValue: t('blueprint.values.collaborative'), ...desc, category: 'Astrology' });
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h5 className={`font-cormorant font-semibold text-soul-purple mb-1 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.leadershipStyle')}</h5>
                  <p className={`${getTextSize('text-sm')} font-inter text-soul-purple capitalize break-words`}>{t('blueprint.values.collaborative')}</p>
                  {(() => {
                    const desc = getPersonalityDescription(t, 'leadershipStyleDescriptions', 'collaborative');
                    return <PersonalityDescription {...desc} compact={true} />;
                  })()}
                </div>
              </div>

              <div 
                className="mt-4 p-3 bg-soul-purple/5 rounded-3xl text-center cursor-pointer hover:bg-soul-purple/10 transition-colors active:scale-[0.98]"
                onClick={() => {
                  const desc = getPersonalityDescription(t, 'chineseZodiacDescriptions', chineseZodiac);
                  openDetailModal({
                    title: desc.fullTitle,
                    subtitle: t('blueprint.labels.generationalInfluence'),
                    mainValue: `${chineseZodiac} ${element}`,
                    ...desc,
                    category: 'Chinese Zodiac'
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const desc = getPersonalityDescription(t, 'chineseZodiacDescriptions', chineseZodiac);
                    openDetailModal({
                      title: desc.fullTitle,
                      subtitle: t('blueprint.labels.generationalInfluence'),
                      mainValue: `${chineseZodiac} ${element}`,
                      ...desc,
                      category: 'Chinese Zodiac'
                    });
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View detailed information about your Chinese Zodiac sign`}
              >
                <h5 className={`font-cormorant font-semibold text-soul-purple mb-2 ${getTextSize('text-sm')} break-words`}>{t('blueprint.labels.generationalInfluence')}</h5>
                <p className={`${getTextSize('text-lg')} font-cormorant font-bold text-soul-purple break-words`}>{chineseZodiac} {element}</p>
                {(() => {
                  const desc = getPersonalityDescription(t, 'chineseZodiacDescriptions', chineseZodiac);
                  return <PersonalityDescription {...desc} compact={true} />;
                })()}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Personality Detail Modal */}
      {modalData && (
        <PersonalityDetailModal
          isOpen={modalData.isOpen}
          onClose={closeModal}
          title={modalData.title}
          subtitle={modalData.subtitle}
          mainValue={modalData.mainValue}
          light={modalData.light}
          shadow={modalData.shadow}
          insight={modalData.insight}
          think={modalData.think}
          act={modalData.act}
          react={modalData.react}
          category={modalData.category}
        />
      )}
    </div>
  );
};

export default SimplifiedBlueprintViewer;
