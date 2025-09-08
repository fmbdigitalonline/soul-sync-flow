import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSelectionStepProps {
  onLanguageSelect: (language: Language) => void;
  selectedLanguage: Language | null;
}

export const LanguageSelectionStep: React.FC<LanguageSelectionStepProps> = ({
  onLanguageSelect,
  selectedLanguage
}) => {
  const { language: currentLanguage, setLanguage } = useLanguage();

  const languages = [
    { 
      code: 'en' as Language, 
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      description: 'All AI insights, reports, and guidance in English'
    },
    { 
      code: 'nl' as Language, 
      name: 'Dutch',
      nativeName: 'Nederlands', 
      flag: '🇳🇱',
      description: 'Alle AI-inzichten, rapporten en begeleiding in het Nederlands'
    }
  ];

  const handleLanguageSelect = (lang: Language) => {
    // Update the global language context immediately
    setLanguage(lang);
    
    // Notify parent component
    onLanguageSelect(lang);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold font-cormorant">
          Choose Your Language
        </h2>
        <p className="text-muted-foreground text-sm">
          Select your preferred language for all AI-generated content, reports, and guidance throughout your journey.
        </p>
      </div>

      <div className="space-y-3">
        {languages.map((lang) => (
          <Card 
            key={lang.code}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedLanguage === lang.code 
                ? "ring-2 ring-primary bg-primary/5" 
                : "hover:bg-accent/5"
            )}
            onClick={() => handleLanguageSelect(lang.code)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <h3 className="font-semibold">{lang.name}</h3>
                    <p className="text-sm text-muted-foreground">{lang.nativeName}</p>
                  </div>
                </div>
                {selectedLanguage === lang.code && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 pl-11">
                {lang.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> This selection will apply to all AI-generated content including your personality blueprint, 
          reports, coaching responses, and personalized guidance. You can change this later in settings.
        </p>
      </div>
    </div>
  );
};