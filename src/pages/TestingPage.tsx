
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { TestingDashboard } from '@/components/testing/TestingDashboard';

const TestingPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Complete Test Environment Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive testing, monitoring, and validation of all SoulSync components and integrations
          </p>
        </div>
        <TestingDashboard />
      </div>
    </MainLayout>
  );
};

export default TestingPage;
