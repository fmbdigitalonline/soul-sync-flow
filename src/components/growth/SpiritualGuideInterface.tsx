import React from 'react';
import IntelligentSoulOrb from '@/components/ui/intelligent-soul-orb';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';

export const SpiritualGuideInterface: React.FC = () => {
  const { intelligence, getModuleIntelligence, HACS_MODULES, recordInteraction } = useHacsIntelligence();

  const handleSoulOrbInteraction = () => {
    // Record interaction with a random HACS module to simulate learning
    const modules = Object.keys(HACS_MODULES) as Array<keyof typeof HACS_MODULES>;
    const randomModule = modules[Math.floor(Math.random() * modules.length)];
    recordInteraction(randomModule, Math.floor(Math.random() * 3) + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Soul Orb with HACS Intelligence */}
      <div className="flex flex-col items-center space-y-6">
        <IntelligentSoulOrb 
          size="xl" 
          onInteraction={handleSoulOrbInteraction}
          className="mb-4"
        />
        
        {/* HACS Module Status Display */}
        {intelligence && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl">
            {Object.entries(HACS_MODULES).map(([key, module]) => {
              const score = getModuleIntelligence(key as keyof typeof HACS_MODULES);
              const level = Math.floor(score / 10);
              return (
                <div key={key} className="bg-card rounded-lg p-3 border border-gold-200/20">
                  <div className="text-xs font-semibold text-gold-400 uppercase tracking-wide">
                    {key.toUpperCase()}
                  </div>
                  <div className="text-sm text-gold-300 mt-1">
                    Lv.{level} ({score}%)
                  </div>
                  <div className="w-full bg-gold-900/30 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-gradient-to-r from-gold-400 to-gold-300 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Additional content or UI elements can be added here */}
    </div>
  );
};
