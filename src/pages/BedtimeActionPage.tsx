
import React from 'react';
import { NextBedtimeAction } from '@/components/bedtime/NextBedtimeAction';
import { AuthProvider } from '@/contexts/AuthContext';

const BedtimeActionPage: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-indigo-900 mb-4">
              🌙 Bedtime Routine
            </h1>
            <p className="text-lg text-indigo-700">
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
