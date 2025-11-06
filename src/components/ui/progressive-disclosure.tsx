import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown, 
  ChevronRight, 
  HelpCircle, 
  Lightbulb, 
  BookOpen,
  Clock,
  Zap,
  Target
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeInterpolateTranslation } from '@/utils/translation-utils';

interface DisclosureLevel {
  level: 'basic' | 'detailed' | 'expert';
  title: string;
  content: string;
  actionableSteps?: string[];
  examples?: string[];
  timeEstimate?: string;
}

interface ProgressiveDisclosureProps {
  topic: string;
  levels: DisclosureLevel[];
  onLevelChange?: (level: 'basic' | 'detailed' | 'expert') => void;
  defaultLevel?: 'basic' | 'detailed' | 'expert';
}

const levelMeta = {
  basic: {
    icon: Target,
    color: 'bg-green-500'
  },
  detailed: {
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  expert: {
    icon: Lightbulb,
    color: 'bg-purple-500'
  }
} as const;

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  topic,
  levels,
  onLevelChange,
  defaultLevel = 'basic'
}) => {
  const { t } = useLanguage();
  const levelConfig = React.useMemo(
    () => ({
      basic: {
        ...levelMeta.basic,
        label: t('progressiveDisclosure.levels.basic.label'),
        description: t('progressiveDisclosure.levels.basic.description')
      },
      detailed: {
        ...levelMeta.detailed,
        label: t('progressiveDisclosure.levels.detailed.label'),
        description: t('progressiveDisclosure.levels.detailed.description')
      },
      expert: {
        ...levelMeta.expert,
        label: t('progressiveDisclosure.levels.expert.label'),
        description: t('progressiveDisclosure.levels.expert.description')
      }
    }),
    [t]
  );
  const [activeLevel, setActiveLevel] = useState<'basic' | 'detailed' | 'expert'>(defaultLevel);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleLevelChange = (level: 'basic' | 'detailed' | 'expert') => {
    setActiveLevel(level);
    onLevelChange?.(level);
  };

  const currentLevel = levels.find(l => l.level === activeLevel);
  if (!currentLevel) return null;

  const LevelIcon = levelConfig[activeLevel].icon;

  return (
    <Card className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${levelConfig[activeLevel].color} rounded-lg flex items-center justify-center`}>
            <LevelIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{topic}</h3>
            <p className="text-xs text-gray-600">{levelConfig[activeLevel].description}</p>
          </div>
        </div>
        
        {currentLevel.timeEstimate && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {currentLevel.timeEstimate}
          </Badge>
        )}
      </div>

      {/* Level Selector */}
      <div className="flex gap-2 mb-4">
        {levels.map((level) => {
          const config = levelConfig[level.level];
          const Icon = config.icon;
          const isActive = level.level === activeLevel;
          
          return (
            <Button
              key={level.level}
              onClick={() => handleLevelChange(level.level)}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`text-xs px-3 py-1 ${isActive ? config.color : ''}`}
            >
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Main Content */}
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-sm text-gray-700 leading-relaxed">
            {currentLevel.content}
          </p>
        </div>

        {/* Actionable Steps */}
        {currentLevel.actionableSteps && currentLevel.actionableSteps.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('steps')}
              className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors"
            >
              {expandedSections.has('steps') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {safeInterpolateTranslation(t('progressiveDisclosure.actionSteps'), {
                count: currentLevel.actionableSteps.length.toString()
              })}
            </button>

            {expandedSections.has('steps') && (
              <div className="space-y-2 ml-6">
                {currentLevel.actionableSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-white">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Examples */}
        {currentLevel.examples && currentLevel.examples.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('examples')}
              className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors"
            >
              {expandedSections.has('examples') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {safeInterpolateTranslation(t('progressiveDisclosure.examples'), {
                count: currentLevel.examples.length.toString()
              })}
            </button>

            {expandedSections.has('examples') && (
              <div className="space-y-2 ml-6">
                {currentLevel.examples.map((example, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 leading-relaxed">{example}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Help Footer */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <HelpCircle className="h-3 w-3" />
              <span>{t('help.needMoreSpecificHelpDetail')}</span>
            </div>

            <div className="flex gap-2">
              {activeLevel !== 'expert' && (
                <Button
                  onClick={() => {
                    const nextLevel = activeLevel === 'basic' ? 'detailed' : 'expert';
                    handleLevelChange(nextLevel);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1"
                >
                  {t('progressiveDisclosure.moreDetail')}
                </Button>
              )}

              {activeLevel !== 'basic' && (
                <Button
                  onClick={() => {
                    const prevLevel = activeLevel === 'expert' ? 'detailed' : 'basic';
                    handleLevelChange(prevLevel);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1"
                >
                  {t('progressiveDisclosure.simpler')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};