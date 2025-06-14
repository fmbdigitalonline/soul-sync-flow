
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { HumanDesignDebugger } from '@/components/blueprint/HumanDesignDebugger';

const HumanDesignDebug = () => {
  return (
    <MainLayout>
      <div className="w-full p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-display mb-6">
          <span className="gradient-text">Human Design Debug</span>
        </h1>
        <HumanDesignDebugger />
      </div>
    </MainLayout>
  );
};

export default HumanDesignDebug;
