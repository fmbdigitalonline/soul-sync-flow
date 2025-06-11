
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export type AppMode = 'productivity' | 'growth' | 'companion' | 'neutral';

interface ModeConfig {
  name: string;
  theme: string;
  allowedNavItems: string[];
  restrictedMessage?: string;
  agentType: 'coach' | 'guide' | 'blend';
}

const modeConfigs: Record<AppMode, ModeConfig> = {
  productivity: {
    name: 'Productivity Mode',
    theme: 'productivity',
    allowedNavItems: ['/', '/tasks', '/coach'],
    restrictedMessage: 'Focus on your goals. Switch to Soul Companion for full access.',
    agentType: 'coach'
  },
  growth: {
    name: 'Growth Mode', 
    theme: 'growth',
    allowedNavItems: ['/', '/spiritual-growth', '/coach'],
    restrictedMessage: 'Stay in reflection. Switch to Soul Companion for full access.',
    agentType: 'guide'
  },
  companion: {
    name: 'Soul Companion',
    theme: 'companion',
    allowedNavItems: ['/', '/blueprint', '/spiritual-growth', '/tasks', '/profile', '/coach'],
    restrictedMessage: undefined,
    agentType: 'blend'
  },
  neutral: {
    name: 'Soul Guide',
    theme: 'neutral',
    allowedNavItems: ['/', '/blueprint', '/spiritual-growth', '/tasks', '/profile', '/coach'],
    restrictedMessage: undefined,
    agentType: 'blend'
  }
};

interface ModeContextType {
  currentMode: AppMode;
  modeConfig: ModeConfig;
  isNavItemAllowed: (path: string) => boolean;
  setMode: (mode: AppMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMode, setCurrentMode] = useState<AppMode>('neutral');
  const location = useLocation();

  // Auto-detect mode based on current route
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/tasks') {
      setCurrentMode('productivity');
    } else if (path === '/spiritual-growth') {
      setCurrentMode('growth');
    } else if (path === '/coach') {
      setCurrentMode('companion');
    } else {
      setCurrentMode('neutral');
    }
  }, [location.pathname]);

  const modeConfig = modeConfigs[currentMode];

  const isNavItemAllowed = (path: string): boolean => {
    return modeConfig.allowedNavItems.includes(path);
  };

  const setMode = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  return (
    <ModeContext.Provider value={{
      currentMode,
      modeConfig,
      isNavItemAllowed,
      setMode
    }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
