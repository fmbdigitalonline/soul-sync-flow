
import React, { useRef, useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface IntelligentSoulOrbProps {
  speaking?: boolean;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  stage?: "welcome" | "collecting" | "generating" | "complete";
  onClick?: () => void;
  intelligenceLevel?: number; // 0-100
  showProgressRing?: boolean;
  showIntelligenceTooltip?: boolean;
  isThinking?: boolean;
  activeModule?: string; // NIK, CPSR, TWS, HFME, DPEM, CNR, BPSC, ACS, PIE, VFP, TMG
  moduleActivity?: boolean;
  hermeticProgress?: number; // 0-100 for hermetic report generation
  showHermeticProgress?: boolean;
  showRadiantGlow?: boolean;
  // New subconscious orb props
  subconsciousMode?: 'dormant' | 'detecting' | 'pattern_found' | 'thinking' | 'advice_ready';
  patternDetected?: boolean;
  adviceReady?: boolean;
}

const IntelligentSoulOrb: React.FC<IntelligentSoulOrbProps> = ({
  speaking = false,
  pulse = true,
  size = "md",
  className,
  stage = "welcome",
  onClick,
  intelligenceLevel = 0,
  showProgressRing = true,
  showIntelligenceTooltip = false,
  isThinking = false,
  activeModule,
  moduleActivity = false,
  hermeticProgress = 0,
  showHermeticProgress = false,
  showRadiantGlow = false,
  subconsciousMode = 'dormant',
  patternDetected = false,
  adviceReady = false,
}) => {
  const orbRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{ x: number, y: number, size: number, speed: number, angle: number, hue?: number }>>([]);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [rainbowPhase, setRainbowPhase] = useState(0);
  
  const { t } = useLanguage();
  
  // Size mapping - made smaller for more conversation space
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-16 h-16", // Reduced from w-24 h-24
    lg: "w-20 h-20", // Reduced from w-32 h-32
  };

  // Progress ring size mapping - adjusted for smaller orbs
  const ringSize = {
    sm: 56, // Reduced
    md: 72, // Reduced from 104
    lg: 88, // Reduced from 136
  };

  // Reverse color psychology: Yellow (learning) → Teal (mastery)
  const getOrbColors = useMemo(() => {
    // Intelligence Evolution Journey: Yellow → Teal
    if (intelligenceLevel >= 100) {
      return "from-teal-400 via-teal-300 to-teal-200"; // Pure teal mastery
    } else if (intelligenceLevel >= 75) {
      return "from-teal-300 via-cyan-300 to-cyan-200"; // Advanced - teal dominant
    } else if (intelligenceLevel >= 50) {
      return "from-cyan-400 via-yellow-300 to-yellow-200"; // Developing - transition phase
    } else if (intelligenceLevel >= 25) {
      return "from-yellow-400 via-yellow-300 to-yellow-200"; // Learning - yellow dominant
    } else {
      return "from-amber-400 via-yellow-300 to-yellow-200"; // Awakening - warm yellow
    }
  }, [intelligenceLevel]);

  // Subconscious orb colors based on mode
  const getSubconsciousOrbColors = useMemo(() => {
    if (subconsciousMode === 'advice_ready') {
      return "from-teal-400 via-teal-300 to-emerald-300"; // Ready with advice
    } else if (subconsciousMode === 'thinking') {
      return "from-purple-400 via-violet-300 to-purple-300"; // Processing hermetic wisdom
    } else if (subconsciousMode === 'pattern_found') {
      return "from-amber-400 via-yellow-300 to-orange-300"; // Pattern detected
    } else if (subconsciousMode === 'detecting') {
      return "from-cyan-400 via-blue-300 to-cyan-300"; // Active detection
    } else {
      return getOrbColors; // Default intelligence-based colors
    }
  }, [subconsciousMode, getOrbColors]);

  // Subconscious mode animation overrides
  const getSubconsciousAnimation = useMemo(() => {
    if (subconsciousMode === 'advice_ready') {
      return { 
        animate: { scale: [1, 1.05, 1], opacity: [1, 0.9, 1] }, 
        transition: { duration: 2, repeat: Infinity } 
      };
    } else if (subconsciousMode === 'thinking') {
      return { 
        animate: { rotate: [0, 5, -5, 0], scale: [1, 1.02, 1] }, 
        transition: { duration: 1.5, repeat: Infinity } 
      };
    } else if (subconsciousMode === 'pattern_found') {
      return { 
        animate: { scale: [1, 1.03, 1] }, 
        transition: { duration: 0.8, repeat: 3 } 
      };
    } else if (subconsciousMode === 'detecting') {
      return { 
        animate: { opacity: [1, 0.8, 1] }, 
        transition: { duration: 0.6, repeat: Infinity } 
      };
    } else {
      return { animate: {}, transition: undefined };
    }
  }, [subconsciousMode]);

  // Module-specific animation variants
  const getModuleAnimation = useMemo(() => {
    if (!activeModule || !moduleActivity) return { animate: {}, transition: undefined };
    
    const animations = {
      NIK: { animate: { scale: [1, 1.02, 1] }, transition: { duration: 1.5, repeat: Infinity } }, // Neural integration pulse
      CPSR: { animate: { opacity: [1, 0.8, 1] }, transition: { duration: 0.3, repeat: 3 } }, // Pattern recognition flicker
      TWS: { animate: { rotate: [0, 2, -2, 0] }, transition: { duration: 4, repeat: Infinity } }, // Wisdom wave
      HFME: { animate: { scale: [1, 1.03, 1], rotate: [0, 5, 0] }, transition: { duration: 2, repeat: Infinity } }, // Framework shift
      DPEM: { animate: { filter: ["hue-rotate(0deg)", "hue-rotate(30deg)", "hue-rotate(0deg)"] }, transition: { duration: 1, repeat: 2 } }, // Personality adaptation flash
      CNR: { animate: { scale: [1, 0.98, 1.02, 1] }, transition: { duration: 0.5, repeat: 2 } }, // Conflict resolution pulse
      BPSC: { animate: { rotate: [0, 360] }, transition: { duration: 3, ease: "linear" } }, // Blueprint sync rotation
      ACS: { animate: { scale: [1, 1.05, 1] }, transition: { duration: 0.8, repeat: 2 } }, // Conversation ripple
      PIE: { animate: { opacity: [1, 0.7, 1], scale: [1, 1.01, 1] }, transition: { duration: 0.4, repeat: 1 } }, // Prediction flash
      VFP: { animate: { scale: [1, 1.02, 1], rotate: [0, 180, 360] }, transition: { duration: 2 } }, // Vector processing merge
      TMG: { animate: { opacity: [1, 0.9, 0.8, 0.9, 1] }, transition: { duration: 1.5, repeat: 1 } }, // Memory echo
    };
    
    return animations[activeModule as keyof typeof animations] || { animate: {}, transition: undefined };
  }, [activeModule, moduleActivity]);

  // Calculate circumference for progress ring (outer - intelligence)
  const radius = (ringSize[size] - 6) / 2; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (intelligenceLevel / 100) * circumference;

  // Calculate circumference for inner progress ring (hermetic)
  const innerRadius = radius * 0.7; // 70% of outer radius
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerStrokeDasharray = innerCircumference;
  const innerStrokeDashoffset = innerCircumference - (hermeticProgress / 100) * innerCircumference;

  // Initialize particles with intelligence-based count
  useEffect(() => {
    const baseParticleCount = 8; // Reduced from 12
    const bonusParticles = Math.floor(intelligenceLevel / 15); // Adjusted for smaller count
    const particleCount = Math.min(baseParticleCount + bonusParticles, 16);
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: 50,
        y: 50,
        size: Math.random() * 2 + 1 + (intelligenceLevel / 150), // Smaller particles
        speed: Math.random() * 0.25 + 0.25 + (intelligenceLevel / 250), // Adjusted speed
        angle: (Math.PI * 2 / particleCount) * i,
        hue: i * (360 / particleCount), // Rainbow hue for each particle
      });
    }
    
    setParticles(newParticles);
  }, [intelligenceLevel]);
   
  // Animation loop for particles
  useEffect(() => {
    if (!orbRef.current) return;
    
    let animationId: number;
    
    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          angle: particle.angle + (particle.speed * 0.01),
        }))
      );
      
      // Radiant glow animation
      if (showRadiantGlow && hermeticProgress === 100) {
        setRainbowPhase(prev => (prev + 2) % 360); // Slower, more spiritual animation
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [intelligenceLevel, showRadiantGlow, hermeticProgress]);

  // Level up animation trigger
  useEffect(() => {
    if (intelligenceLevel === 100) {
      setIsLevelingUp(true);
      const timeout = setTimeout(() => setIsLevelingUp(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [intelligenceLevel]);

  const getIntelligencePhase = () => {
    if (intelligenceLevel >= 100) return t('intelligencePhases.autonomous');
    if (intelligenceLevel >= 75) return t('intelligencePhases.advanced');
    if (intelligenceLevel >= 50) return t('intelligencePhases.developing');
    if (intelligenceLevel >= 25) return t('intelligencePhases.learning');
    return t('intelligencePhases.awakening');
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Progress Ring - Intelligence Level */}
      {showProgressRing && intelligenceLevel > 0 && (
        <svg
          className="absolute"
          width={ringSize[size]}
          height={ringSize[size]}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background ring - more visible */}
          <circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={radius}
            stroke="hsl(var(--soul-teal) / 0.3)" // Design system teal with transparency
            strokeWidth="2"
            fill="transparent"
          />
          {/* Progress ring - using design system teal */}
          <motion.circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={radius}
            stroke="hsl(var(--soul-teal))" // Design system teal color
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={cn(
              intelligenceLevel >= 100 && "drop-shadow-lg",
              isLevelingUp && "animate-pulse"
            )}
            style={{
              filter: "drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))" // Glow effect
            }}
          />
        </svg>
      )}

      {/* Inner Progress Ring - Hermetic Report Generation */}
      {showHermeticProgress && hermeticProgress > 0 && (
        <svg
          className="absolute"
          width={ringSize[size]}
          height={ringSize[size]}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Inner background ring */}
          <circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={innerRadius}
            stroke="hsl(var(--soul-purple) / 0.3)" // Design system purple with transparency
            strokeWidth="1.5"
            fill="transparent"
          />
          {/* Inner progress ring - FORCED BRIGHT TEAL RESTORATION */}
          <motion.circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={innerRadius}
            stroke="hsl(180 68% 55%)" // FORCED: Original bright teal #22D3EE
            strokeWidth="1.5"
            fill="transparent"
            strokeDasharray={innerStrokeDasharray}
            strokeDashoffset={innerStrokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: innerCircumference }}
            animate={{ 
              strokeDashoffset: innerStrokeDashoffset,
              scale: showRadiantGlow && hermeticProgress === 100 ? [1, 1.05, 1] : 1,
              filter: showRadiantGlow && hermeticProgress === 100 
                ? ["drop-shadow(0 0 8px hsl(180 68% 55%))", "drop-shadow(0 0 16px hsl(180 68% 55%))"] 
                : "drop-shadow(0 0 4px hsl(180 68% 55% / 0.5))"
            }}
            transition={{ 
              duration: 0.8, 
              ease: "easeInOut",
              scale: showRadiantGlow && hermeticProgress === 100 ? { duration: 2, repeat: Infinity } : {},
              filter: showRadiantGlow && hermeticProgress === 100 ? { duration: 2, repeat: Infinity } : {}
            }}
            style={{
              filter: "drop-shadow(0 0 4px hsl(180 68% 55% / 0.5))" // FORCED: Bright teal glow
            }}
          />
        </svg>
      )}

      {/* Main Soul Orb with enhanced animations */}
      <motion.div 
        ref={orbRef}
        onClick={onClick}
        className={cn(
          "relative flex items-center justify-center rounded-full cursor-pointer overflow-hidden", 
          sizeMap[size],
          className
        )}
        animate={{
          scale: isThinking || subconsciousMode === 'thinking' ? [1, 1.03, 1] : pulse && !speaking ? [1, 1.05, 1] : 1,
          ...getModuleAnimation.animate,
          ...getSubconsciousAnimation.animate,
        }}
        transition={getSubconsciousAnimation.transition || getModuleAnimation.transition || {
          duration: isThinking || subconsciousMode === 'thinking' ? 1.5 : 3,
          repeat: (pulse && !speaking) || isThinking || subconsciousMode !== 'dormant' ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Core orb with radiant glow and subconscious mode colors */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full", 
            speaking && "animate-pulse",
            isLevelingUp && "animate-ping",
            showRadiantGlow && intelligenceLevel >= 100 && "animate-pulse"
          )}
          style={{
            background: showRadiantGlow && intelligenceLevel >= 100
              ? `radial-gradient(circle, 
                  hsl(var(--soul-teal) / 0.9), 
                  hsl(var(--soul-teal) / 0.6), 
                  hsl(var(--soul-teal) / 0.3))`
              : undefined,
            boxShadow: showRadiantGlow && intelligenceLevel >= 100
              ? "0 0 20px hsl(var(--soul-teal) / 0.8), 0 0 40px hsl(var(--soul-teal) / 0.6), 0 0 60px hsl(var(--soul-teal) / 0.4)"
              : undefined
          }}
        >
          {(!showRadiantGlow || intelligenceLevel < 100) && (
            <div className={cn("absolute inset-0 rounded-full bg-gradient-to-r", getSubconsciousOrbColors)} />
          )}
        </div>
        
        {/* Enhanced glow effect - reverse color psychology */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full blur-sm", // Reduced blur for smaller orb
            intelligenceLevel >= 100 ? "bg-teal-400 opacity-40" : // Pure teal mastery
            intelligenceLevel >= 75 ? "bg-teal-400 opacity-30" : // Advanced teal
            intelligenceLevel >= 50 ? "bg-cyan-400 opacity-25" : // Transition phase
            intelligenceLevel >= 25 ? "bg-yellow-400 opacity-25" : // Learning yellow
            "bg-amber-400 opacity-20" // Awakening warm yellow
          )} 
        />
        
        {/* Star in the center - adjusted for smaller size */}
        <div className="absolute w-1/3 h-1/3 bg-white rounded-full blur-[0.5px]" />
        <div className="absolute w-[25%] h-[25%]">
          <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-0" />
          <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-90" />
          <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-45" />
          <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-[135deg]" />
        </div>
        
        {/* Intelligence-enhanced orbital particles with radiant glow */}
        {particles.map((particle, index) => {
          const x = 50 + Math.cos(particle.angle) * 28; // Consistent orbit
          const y = 50 + Math.sin(particle.angle) * 28;
          
          return (
            <div 
              key={index}
              className={cn(
                "absolute rounded-full transition-all duration-200",
                intelligenceLevel >= 90 ? "bg-amber-200" : "bg-white"
              )}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: 0.7 + (intelligenceLevel / 200),
                transform: `translate(-50%, -50%)`,
                filter: showRadiantGlow && intelligenceLevel >= 100 
                  ? `drop-shadow(0 0 4px hsl(var(--soul-teal)))`
                  : undefined
              }}
            />
          );
        })}
        
        {/* Enhanced orbital lines - adjusted for smaller size */}
        <div className="absolute inset-1">
          <div className={cn(
            "absolute inset-0 rounded-full border opacity-40 rotate-45",
            intelligenceLevel >= 90 ? "border-amber-200" : "border-white"
          )} />
          <div className={cn(
            "absolute inset-0 rounded-full border opacity-40 rotate-90",
            intelligenceLevel >= 90 ? "border-amber-200" : "border-white"
          )} />
          <div className={cn(
            "absolute inset-0 top-3 rounded-full border opacity-40",
            intelligenceLevel >= 90 ? "border-amber-200" : "border-white"
          )} />
        </div>
        
        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute inset-0 rounded-full border-2 border-white opacity-70 animate-ping" />
        )}

        {/* Level up celebration effect */}
        <AnimatePresence>
          {isLevelingUp && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-400"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Intelligence tooltip */}
      {showIntelligenceTooltip && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {getIntelligencePhase()} • {Math.round(intelligenceLevel)}%
        </div>
      )}
    </div>
  );
};

export { IntelligentSoulOrb };
