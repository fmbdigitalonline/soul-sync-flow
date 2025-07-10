
import React, { useEffect, useState } from 'react';
import { useHacsIntelligence } from '@/hooks/use-hacs-intelligence';

interface IntelligentSoulOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  showProgress?: boolean;
  className?: string;
  onInteraction?: () => void;
}

export const IntelligentSoulOrb: React.FC<IntelligentSoulOrbProps> = ({
  size = 'md',
  showLevel = true,
  showProgress = true,
  className = '',
  onInteraction
}) => {
  const { intelligence, getIntelligenceLevel, HACS_MODULES } = useHacsIntelligence();
  const [isAnimating, setIsAnimating] = useState(false);

  const level = getIntelligenceLevel();
  const progress = intelligence ? (intelligence.overall_intelligence % 10) * 10 : 0;

  // Size configurations
  const sizes = {
    sm: { orb: 40, ring: 44, stroke: 2 },
    md: { orb: 60, ring: 68, stroke: 3 },
    lg: { orb: 80, ring: 92, stroke: 4 },
    xl: { orb: 120, ring: 136, stroke: 5 }
  };

  const config = sizes[size];
  const radius = (config.ring - config.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Intelligence-based visual evolution
  const getOrbStyles = () => {
    const baseIntensity = Math.min(level * 0.1 + 0.3, 1);
    const pulseSpeed = Math.max(4 - level * 0.3, 1);
    
    return {
      background: `radial-gradient(circle, 
        hsl(45, 100%, ${50 + level * 3}%) 0%, 
        hsl(35, 90%, ${40 + level * 2}%) 30%, 
        hsl(25, 80%, ${30 + level}%) 70%, 
        transparent 100%)`,
      boxShadow: `
        0 0 ${config.orb * 0.3}px hsl(45, 100%, 60% / ${baseIntensity * 0.6}),
        0 0 ${config.orb * 0.6}px hsl(45, 100%, 50% / ${baseIntensity * 0.4}),
        0 0 ${config.orb * 0.9}px hsl(45, 100%, 40% / ${baseIntensity * 0.2}),
        inset 0 0 ${config.orb * 0.2}px hsl(45, 100%, 80% / 0.3)
      `,
      animation: `soulPulse ${pulseSpeed}s ease-in-out infinite alternate`,
    };
  };

  const handleClick = () => {
    setIsAnimating(true);
    onInteraction?.();
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Get active modules count for display
  const activeModules = intelligence ? Object.keys(HACS_MODULES).filter(module => {
    const score = intelligence[`${module}_score` as keyof typeof intelligence] as number;
    return score > 15; // Consider module "active" if score > 15
  }).length : 0;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Progress Ring */}
      {showProgress && (
        <div className="relative">
          <svg
            width={config.ring}
            height={config.ring}
            className="transform -rotate-90"
          >
            {/* Background ring */}
            <circle
              cx={config.ring / 2}
              cy={config.ring / 2}
              r={radius}
              stroke="hsl(45, 30%, 20%)"
              strokeWidth={config.stroke}
              fill="none"
              opacity={0.3}
            />
            
            {/* Progress ring */}
            <circle
              cx={config.ring / 2}
              cy={config.ring / 2}
              r={radius}
              stroke="hsl(45, 100%, 60%)"
              strokeWidth={config.stroke}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 ${config.stroke * 2}px hsl(45, 100%, 60% / 0.6))`
              }}
            />
          </svg>
        </div>
      )}

      {/* Soul Orb */}
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   rounded-full cursor-pointer transition-all duration-300 
                   ${isAnimating ? 'scale-110' : 'hover:scale-105'}`}
        style={{
          width: config.orb,
          height: config.orb,
          ...getOrbStyles()
        }}
        onClick={handleClick}
      >
        {/* Inner consciousness patterns */}
        <div className="absolute inset-2 rounded-full opacity-40"
             style={{
               background: `conic-gradient(from 0deg, 
                 hsl(45, 100%, 70%), hsl(60, 100%, 60%), 
                 hsl(30, 100%, 60%), hsl(45, 100%, 70%))`,
               animation: `spin ${12 - level}s linear infinite`
             }} />
      </div>

      {/* Intelligence Level Display */}
      {showLevel && (
        <div className="mt-2 text-center">
          <div className="text-sm font-bold text-gold-400">
            Level {level}
          </div>
          <div className="text-xs text-gold-300 opacity-75">
            {activeModules}/11 Modules Active
          </div>
          {intelligence && (
            <div className="text-xs text-gold-200 opacity-60">
              {intelligence.interaction_count} interactions
            </div>
          )}
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes soulPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default IntelligentSoulOrb;
