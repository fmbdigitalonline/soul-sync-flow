import React from 'react';

interface PersonalityDescriptionProps {
  light: string;
  shadow: string;
  insight: string;
  compact?: boolean;
}

export const PersonalityDescription: React.FC<PersonalityDescriptionProps> = ({ 
  light, 
  shadow, 
  insight, 
  compact = false 
}) => {
  if (compact) {
    // Show only insight for card overview
    return (
      <p className="text-xs font-inter text-gray-600 dark:text-gray-400 italic leading-relaxed">
        {insight}
      </p>
    );
  }

  // Show full Light & Shadow format for modal
  return (
    <div className="space-y-4 text-left">
      <div className="flex gap-3 items-start">
        <span className="text-green-600 dark:text-green-400 text-xl flex-shrink-0">✨</span>
        <div>
          <h4 className="text-sm font-inter font-semibold text-foreground mb-1">Light Side</h4>
          <p className="text-sm font-inter text-muted-foreground leading-relaxed">{light}</p>
        </div>
      </div>
      
      <div className="flex gap-3 items-start">
        <span className="text-purple-600 dark:text-purple-400 text-xl flex-shrink-0">🌑</span>
        <div>
          <h4 className="text-sm font-inter font-semibold text-foreground mb-1">Shadow Side</h4>
          <p className="text-sm font-inter text-muted-foreground leading-relaxed">{shadow}</p>
        </div>
      </div>
      
      <div className="flex gap-3 items-start">
        <span className="text-blue-600 dark:text-blue-400 text-xl flex-shrink-0">💡</span>
        <div>
          <h4 className="text-sm font-inter font-semibold text-foreground mb-1">Integration</h4>
          <p className="text-sm font-inter font-medium text-foreground italic leading-relaxed">{insight}</p>
        </div>
      </div>
    </div>
  );
};
