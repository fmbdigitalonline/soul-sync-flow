/**
 * TwinNameSettings — rename your Twin (Constitution v3.3: the name is not
 * locked forever; relationships evolve). Lives in Profile → Settings. Shows
 * the current name and its story, and lets the user change it on the same
 * setTwinName path used by the naming ceremony.
 */

import React, { useEffect, useState } from 'react';
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
    <div className="ss-card">
      {!twinName ? (
        <div className="flex items-center gap-3">
          <span className="ss-ic"><Sparkles className="h-[18px] w-[18px]" /></span>
          <p className="text-sm" style={{ color: 'var(--ss-muted)' }}>{t.unnamed}</p>
        </div>
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
            className="w-full text-base rounded-xl px-3 py-2 outline-none"
            style={{ background: 'var(--ss-surface)', border: '1px solid var(--ss-line)', color: 'var(--ss-ink)' }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || !value.trim()}>{t.save}</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>{t.cancel}</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="ss-ic mt-0.5"><Sparkles className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold" style={{ color: 'var(--ss-accent-ink)' }}>{twinName.name}</div>
              {twinName.reason && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--ss-muted)' }}>{twinName.reason}</p>
              )}
              <p className="text-[11px] mt-1" style={{ color: 'var(--ss-faint)' }}>
                {twinName.origin === 'user' ? t.ownOrigin : t.origin}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold"
            style={{ color: 'var(--ss-accent-ink)' }}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t.rename}
          </button>
        </div>
      )}
    </div>
  );
};

export default TwinNameSettings;
