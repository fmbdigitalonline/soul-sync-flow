
import React from 'react';
import { NextBedtimeAction } from '@/components/bedtime/NextBedtimeAction';
import { AuthProvider } from '@/contexts/AuthContext';

const BedtimeActionPage: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-tertiary">
        <div className="container mx-auto py-spacing-8 px-container">
          <div className="mb-spacing-8 text-center">
            <h1 className="text-heading-3xl font-display text-text-main mb-spacing-4">
              🌙 Bedtime Routine
            </h1>
            <p className="text-body-lg text-text-secondary">
              Your next scheduled bedtime action to help you wind down for better sleep
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <NextBedtimeAction />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default BedtimeActionPage;
