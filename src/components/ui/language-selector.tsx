import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
const languages: {
  code: Language;
  name: string;
  flag: string;
}[] = [{
  code: 'en',
  name: 'English',
  flag: '🇺🇸'
}, {
  code: 'nl',
  name: 'Nederlands',
  flag: '🇳🇱'
}];
export const LanguageSelector: React.FC = () => {
  const {
    language,
    setLanguage,
    t
  } = useLanguage();

  // Memoize language lookups to prevent excessive re-renders
  const currentLanguage = useMemo(() => languages.find(lang => lang.code === language), [language]);
  const englishLabel = useMemo(() => t('language.english'), [t]);
  const dutchLabel = useMemo(() => t('language.dutch'), [t]);
  const getLanguageLabel = useMemo(() => (langCode: Language) => {
    return langCode === 'en' ? englishLabel : dutchLabel;
  }, [englishLabel, dutchLabel]);
  const currentLanguageLabel = useMemo(() => getLanguageLabel(language), [getLanguageLabel, language]);
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{currentLanguage?.flag}</span>
          <span className="hidden sm:inline">{currentLanguageLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            aria-label={getLanguageLabel(lang.code)}
          >
            <span className="mr-2">{lang.flag}</span>
            <span className="flex-1">{getLanguageLabel(lang.code)}</span>
            {language === lang.code ? <span aria-hidden="true">✓</span> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>;
};