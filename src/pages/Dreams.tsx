
import React, { useEffect } from 'react';
import { SpiritualGuideInterface } from '@/components/growth/SpiritualGuideInterface';
import { DreamVisualization } from '@/components/dreams/DreamVisualization';
import { dreamActivityLogger } from '@/services/dream-activity-logger';

const Dreams: React.FC = () => {
  useEffect(() => {
    // Log page view with HACS context
    dreamActivityLogger.logActivity('hacs_dreams_page_view', {
      timestamp: Date.now(),
      hacs_enabled: true,
      page_context: 'complete_hacs_dreams'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-soul-purple to-soul-gold p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Dreams & Spiritual Growth</h1>
          <p className="text-purple-100 text-lg">
            Powered by Complete HACS Architecture - 11 Systems Working in Harmony
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">🧠 Neural Intent Processing</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">🎯 Personality Vector Fusion</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">⚡ Harmonic Frequency Modulation</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">🔮 Proactive Insight Engine</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <SpiritualGuideInterface />
      </div>

      {/* Dream Visualization Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
        <DreamVisualization />
      </div>
    </div>
  );
};

export default Dreams;
