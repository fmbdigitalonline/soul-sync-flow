
import React from 'react';
import { Phase3MemoryTest } from '@/components/debug/Phase3MemoryTest';
import { AuthProvider } from '@/contexts/AuthContext';

const Phase3MemoryTestPage: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Phase 3: Memory & Life-Long Personalization
            </h1>
            <p className="text-lg text-gray-600">
              Test comprehensive memory persistence, session feedback, micro-action reminders, 
              and life-long personalization features.
            </p>
          </div>
          
          <Phase3MemoryTest />
        </div>
      </div>
    </AuthProvider>
  );
};

export default Phase3MemoryTestPage;
