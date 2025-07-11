import React from 'react';
import { FunctionTester } from '@/components/testing/FunctionTester';

export const TestFunctionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent">
            Function Testing Suite
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing for all Supabase Edge Functions in the SoulSync system
          </p>
        </div>
        
        <FunctionTester />
      </div>
    </div>
  );
};