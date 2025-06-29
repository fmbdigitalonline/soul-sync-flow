
import React from 'react';
import { TestingDashboard } from '@/components/testing/TestingDashboard';

const TestEnvironmentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔬 VFP-Graph Patent Validation Environment
          </h1>
          <p className="text-lg text-gray-600">
            Patent-ready evidence collection for VFP-Graph technology claims + comprehensive testing suite: 
            36 test components covering Growth Programs, 7-layer personality engine, 12 modules, 3 coach modes, 
            error handling, performance, UX flows, and advanced analytics with real-time dynamic data
          </p>
        </div>
        
        <TestingDashboard />
      </div>
    </div>
  );
};

export default TestEnvironmentPage;
