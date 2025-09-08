import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { userLanguagePreferenceService } from '@/services/user-language-preference-service';

export const LanguagePreferenceSettings: React.FC = () => {
  const { language: currentLanguage, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const languages = [
    { 
      code: 'en' as Language, 
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸'
    },
    { 
      code: 'nl' as Language, 
      name: 'Dutch',
      nativeName: 'Nederlands', 
      flag: '🇳🇱'
    }
  ];

  const handleLanguageChange = async (newLanguage: Language) => {
    if (!user || newLanguage === currentLanguage) return;

    setIsUpdating(true);
    try {
      // Update the language context immediately
      setLanguage(newLanguage);

      // Save to user profile
      const result = await userLanguagePreferenceService.saveLanguagePreference(user.id, newLanguage);
      
      if (result.success) {
        toast({
          title: t('settings.languageUpdated'),
          description: t('settings.languageUpdatedDescription'),
        });
      } else {
        toast({
          title: t('system.error'),
          description: result.error || t('settings.languageUpdateFailed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating language preference:', error);
      toast({
        title: t('system.error'),
        description: t('settings.languageUpdateFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerateContent = async () => {
    if (!user) return;

    setIsRegenerating(true);
    try {
      const result = await userLanguagePreferenceService.triggerContentRegeneration(user.id, currentLanguage);
      
      if (result.success) {
        toast({
          title: t('settings.contentRegenerationStarted'),
          description: t('settings.contentRegenerationDescription').replace('{count}', result.itemsTriggered?.toString() || '0'),
        });
      } else {
        toast({
          title: t('settings.contentRegenerationFailed'),
          description: result.error || t('settings.contentRegenerationFailedDescription'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error regenerating content:', error);
      toast({
        title: t('system.error'),
        description: t('settings.contentRegenerationFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t('settings.languagePreference')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('settings.languagePreferenceDescription')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {languages.map((lang) => (
              <Card 
                key={lang.code}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  currentLanguage === lang.code 
                    ? "ring-2 ring-primary bg-primary/5" 
                    : "hover:bg-accent/5"
                )}
                onClick={() => handleLanguageChange(lang.code)}
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
                    {currentLanguage === lang.code && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="space-y-3">
            <h4 className="font-medium">{t('settings.regenerateContent')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('settings.regenerateContentDescription')}
            </p>
            <Button
              variant="outline"
              onClick={handleRegenerateContent}
              disabled={isRegenerating || isUpdating}
              className="w-full sm:w-auto"
            >
              <RotateCcw className={cn("w-4 h-4 mr-2", isRegenerating && "animate-spin")} />
              {isRegenerating ? t('settings.regenerating') : t('settings.regenerateInCurrentLanguage')}
            </Button>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong>{t('common.note')}:</strong> {t('settings.languageChangeNote')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};