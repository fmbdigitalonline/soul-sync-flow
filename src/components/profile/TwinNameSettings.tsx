/**
 * TwinNameSettings — rename your Twin (Constitution v3.3: the name is not
 * locked forever; relationships evolve). Lives in Profile → Settings. Shows
 * the current name and its story, and lets the user change it on the same
 * setTwinName path used by the naming ceremony.
 */

import React, { useEffect, useState } from 'react';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { Sparkles, Pencil } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTwinName } from '@/hooks/use-twin-name';
import { twinNamingService } from '@/services/twin-naming-service';

const COPY = {
  en: {
    title: 'Your Twin',
    unnamed: "Your Twin doesn't have a name yet — it will ask you for one in conversation.",
    origin: 'Inspired by your Blueprint',
    ownOrigin: 'A name you chose',
    rename: 'Rename',
    placeholder: 'A name that feels right…',
    save: 'Save',
    cancel: 'Cancel',
  },
  nl: {
    title: 'Je Twin',
    unnamed: 'Je Twin heeft nog geen naam — die vraagt er in een gesprek om.',
    origin: 'Geïnspireerd door je Blauwdruk',
    ownOrigin: 'Een naam die je koos',
    rename: 'Hernoemen',
    placeholder: 'Een naam die goed voelt…',
    save: 'Opslaan',
    cancel: 'Annuleren',
  },
};

export const TwinNameSettings: React.FC = () => {
  const { language } = useLanguage();
  const t = COPY[language === 'nl' ? 'nl' : 'en'];
  const { twinName } = useTwinName();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (twinName?.name) setValue(twinName.name);
  }, [twinName?.name]);

  const save = async () => {
    const name = value.trim();
    if (!name || saving) return;
    setSaving(true);
    // A manual rename is always a user-chosen name.
    await twinNamingService.setTwinName({ name, origin: 'user' });
    setSaving(false);
    setEditing(false);
  };

  return (
    <CosmicCard className="p-6 rounded-comfort">
      <div className="flex items-center space-x-3 mb-4">
        <Sparkles className="h-5 w-5 text-soul-purple" />
        <h2 className="font-heading font-medium">{t.title}</h2>
      </div>

      {!twinName ? (
        <p className="text-sm text-muted-foreground">{t.unnamed}</p>
      ) : editing ? (
        <div className="space-y-3">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') setEditing(false);
            }}
            maxLength={24}
            placeholder={t.placeholder}
            className="w-full text-base rounded-lg px-3 py-2 bg-background border border-border/60 focus:border-soul-purple/40 outline-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || !value.trim()}>
              {t.save}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              {t.cancel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-lg font-semibold gradient-text">{twinName.name}</p>
            {twinName.reason && (
              <p className="text-sm text-muted-foreground mt-0.5">{twinName.reason}</p>
            )}
            <p className="text-xs text-muted-foreground/70 mt-1">
              {twinName.origin === 'user' ? t.ownOrigin : t.origin}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 interactive-element"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            {t.rename}
          </Button>
        </div>
      )}
    </CosmicCard>
  );
};

export default TwinNameSettings;
