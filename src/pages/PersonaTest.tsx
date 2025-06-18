
import React from 'react';
import { PersonaCleanupTest } from '@/components/debug/PersonaCleanupTest';

const PersonaTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-soul-purple/5 to-soul-blue/5">
      <div className="container mx-auto py-8">
        <PersonaCleanupTest />
      </div>
    </div>
  );
};

export default PersonaTest;
