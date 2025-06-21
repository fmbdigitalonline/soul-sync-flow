
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import SevenLayerPersonalityTest from '@/components/debug/SevenLayerPersonalityTest';

const SevenLayerTest: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Seven Layer Personality Test</h1>
        <SevenLayerPersonalityTest />
      </div>
    </MainLayout>
  );
};

export default SevenLayerTest;
