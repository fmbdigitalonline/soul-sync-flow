
import { useState, useCallback } from 'react';
import { PersonalityEngine } from '@/services/personality-engine';
import { LayeredBlueprint, AgentMode } from '@/types/personality-modules';

export function usePersonalityEngine() {
  const [engine] = useState(() => new PersonalityEngine());
  const [currentMode, setCurrentMode] = useState<AgentMode>('guide');

  const updatePersonalityBlueprint = useCallback((updates: Partial<LayeredBlueprint>) => {
    engine.updateBlueprint(updates);
  }, [engine]);

  const generatePrompt = useCallback((mode: AgentMode) => {
    return engine.generateSystemPrompt(mode);
  }, [engine]);

  const switchMode = useCallback((mode: AgentMode) => {
    setCurrentMode(mode);
    return engine.generateSystemPrompt(mode);
  }, [engine]);

  return {
    currentMode,
    updatePersonalityBlueprint,
    generatePrompt,
    switchMode,
  };
}
