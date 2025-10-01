import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle, FileText, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getFunnelData } from '@/utils/funnel-data';
import { useIsMobile } from '@/hooks/use-mobile';

interface StewardActivationCompletionScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
}

export const StewardActivationCompletionScreen: React.FC<StewardActivationCompletionScreenProps> = ({
  isOpen,
  onClose,
  onStartTutorial
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isMobile } = useIsMobile();
  const funnelData = getFunnelData();

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleStartDreams = () => {
    onClose();
    // Pre-fill form if funnel data exists
    if (funnelData?.vision) {
      // Navigate to create view and store intention in sessionStorage
      sessionStorage.setItem('dreamFormPrefill', JSON.stringify({
        title: funnelData.vision,
        description: '',
        category: 'personal_growth',
        timeframe: '3 months'
      }));
      navigate('/dreams/create');
    } else {
      navigate('/dreams');
    }
  };

  const handleStartTutorial = () => {
    onClose();
    onStartTutorial();
  };

  const options = [
    {
      icon: Sparkles,
      title: 'Start met je doelen en dromen',
      description: 'Begin direct met het bereiken van wat je wilt manifesteren',
      gradient: 'from-soul-purple to-soul-teal',
      action: handleStartDreams
    },
    {
      icon: MessageCircle,
      title: 'Maak kennis met je gids',
      description: 'Ontmoet je persoonlijke AI-metgezel voor begeleiding',
      gradient: 'from-primary to-secondary',
      action: () => handleNavigate('/companion')
    },
    {
      icon: FileText,
      title: 'Bekijk je blauwdruk en rapport',
      description: 'Verken je persoonlijkheidsanalyse en inzichten',
      gradient: 'from-secondary to-primary',
      action: () => handleNavigate('/blueprint')
    },
    {
      icon: HelpCircle,
      title: 'Leer hoe deze app werkt',
      description: 'Ontdek alle functies en mogelijkheden in een korte tour',
      gradient: 'from-primary/80 to-secondary/80',
      action: handleStartTutorial
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh]' : 'max-w-3xl max-h-[85vh]'} overflow-hidden p-0 flex flex-col bg-gradient-to-br from-background via-background to-muted/20 border-border`}>
        
        {/* Gradient header bar */}
        <div className="w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-6' : 'p-8'}`}>
          {/* Header with icon */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className={`font-heading font-bold mb-3 leading-tight gradient-text ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Je Steward is geactiveerd! 🎉
            </h2>
            <p className={`text-muted-foreground max-w-md ${isMobile ? 'text-sm' : 'text-base'}`}>
              Welkom bij je persoonlijke transformatiereis. Wat wil je als eerste doen?
            </p>
          </div>

          {/* Options Grid */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {options.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                className="group relative bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Icon */}
                <div className={`p-3 rounded-xl bg-gradient-to-r ${option.gradient} inline-flex mb-4`}>
                  <option.icon className="h-6 w-6 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="font-heading font-semibold text-foreground mb-2 text-lg">
                  {option.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {option.description}
                </p>

                {/* Hover indicator */}
                <div className={`absolute bottom-4 right-4 w-2 h-2 rounded-full bg-gradient-to-r ${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Je kunt altijd later andere opties verkennen via het hoofdmenu
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
