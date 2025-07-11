import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import SystemDesignAnalysis from '@/components/visualization/SystemDesignAnalysis';

const DesignAnalysisPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5">
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          <SystemDesignAnalysis />
        </div>
      </div>
    </MainLayout>
  );
};

export default DesignAnalysisPage;