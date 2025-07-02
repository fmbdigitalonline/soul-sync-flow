
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { DiagnosticDashboard } from '@/components/diagnostic/DiagnosticDashboard';

const Diagnostics = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-soul-purple/5 to-soul-teal/5">
        <DiagnosticDashboard />
      </div>
    </MainLayout>
  );
};

export default Diagnostics;
