
import React from 'react';

interface BlueprintInsightProps {
  blueprintData: any;
  getUserType: () => string;
}

export const BlueprintInsight: React.FC<BlueprintInsightProps> = ({
  blueprintData,
  getUserType
}) => {
  if (!blueprintData) return null;

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <p className="text-xs text-soul-purple font-medium">
        🧬 Personalizing for your {getUserType()} nature
      </p>
    </div>
  );
};
