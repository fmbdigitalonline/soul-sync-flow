
import React from 'react';
import { FloatingHACSOrb } from '@/components/hacs/FloatingHACSOrb';
import { StewardIntroductionProvider } from '@/contexts/StewardIntroductionContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <StewardIntroductionProvider>
      <div className="min-h-screen bg-gradient-to-b from-soul-black to-soul-purple/10">
        {children}
        <FloatingHACSOrb />
      </div>
    </StewardIntroductionProvider>
  );
};

export default MainLayout;
