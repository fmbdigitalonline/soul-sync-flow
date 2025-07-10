import React, { useRef, useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
}) => {
  const orbRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{ x: number, y: number, size: number, speed: number, angle: number }>>([]);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  
  // Size mapping
  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  // Progress ring size mapping
  const ringSize = {
    sm: 72, // 18 * 4
    md: 104, // 26 * 4  
    lg: 136, // 34 * 4
  };

  // Intelligence-based color enhancement
  const getOrbColors = useMemo(() => {
    const baseColors = {
      welcome: "from-cyan-400 via-cyan-300 to-cyan-200",
      collecting: "from-cyan-400 via-cyan-300 to-cyan-200",
      generating: "from-cyan-400 via-cyan-300 to-cyan-200",
      complete: "from-cyan-400 via-cyan-300 to-cyan-200",
    };

    // Enhanced colors based on intelligence level
    if (intelligenceLevel >= 90) {
      return "from-amber-300 via-yellow-200 to-amber-100"; // Golden for high intelligence
    } else if (intelligenceLevel >= 70) {
      return "from-cyan-300 via-blue-200 to-cyan-100"; // Enhanced cyan
    } else if (intelligenceLevel >= 50) {
      return "from-cyan-400 via-cyan-300 to-cyan-200"; // Standard cyan
    } else {
      return baseColors[stage]; // Base colors for low intelligence
    }
  }, [intelligenceLevel, stage]);

  // Calculate circumference for progress ring
  const radius = (ringSize[size] - 8) / 2; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (intelligenceLevel / 100) * circumference;

  // Initialize particles with intelligence-based count
  useEffect(() => {
    const baseParticleCount = 12;
    const bonusParticles = Math.floor(intelligenceLevel / 10); // More particles with higher intelligence
    const particleCount = Math.min(baseParticleCount + bonusParticles, 24);
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: 50,
        y: 50,
        size: Math.random() * 3 + 1.5 + (intelligenceLevel / 100), // Larger particles with higher intelligence
        speed: Math.random() * 0.3 + 0.3 + (intelligenceLevel / 200), // Faster particles with higher intelligence
        angle: (Math.PI * 2 / particleCount) * i,
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
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [intelligenceLevel]);

  // Level up animation trigger
  useEffect(() => {
    if (intelligenceLevel === 100) {
      setIsLevelingUp(true);
      const timeout = setTimeout(() => setIsLevelingUp(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [intelligenceLevel]);

  const getIntelligencePhase = () => {
    if (intelligenceLevel >= 100) return "Autonomous";
    if (intelligenceLevel >= 75) return "Advanced";
    if (intelligenceLevel >= 50) return "Developing";
    if (intelligenceLevel >= 25) return "Learning";
    return "Awakening";
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Progress Ring */}
      {showProgressRing && (
        <svg
          className="absolute"
          width={ringSize[size]}
          height={ringSize[size]}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background ring */}
          <circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={radius}
            stroke="rgba(255, 215, 0, 0.2)" // Golden background
            strokeWidth="3"
            fill="transparent"
          />
          {/* Progress ring */}
          <motion.circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={radius}
            stroke="url(#goldGradient)"
            strokeWidth="3"
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
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FFA500" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Main Soul Orb */}
      <div 
        ref={orbRef}
        onClick={onClick}
        className={cn(
          "relative flex items-center justify-center rounded-full cursor-pointer overflow-hidden", 
          sizeMap[size],
          className
        )}
      >
        {/* Core orb */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r", 
            getOrbColors,
            pulse && "animate-pulse-soft",
            speaking && "animate-pulse",
            isLevelingUp && "animate-ping"
          )}
        />
        
        {/* Enhanced glow effect based on intelligence */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full blur-md",
            intelligenceLevel >= 90 ? "bg-amber-400 opacity-30" :
            intelligenceLevel >= 70 ? "bg-cyan-400 opacity-25" :
            "bg-cyan-400 opacity-20"
          )} 
        />
        
        {/* Star in the center */}
        <div className="absolute w-1/2 h-1/2 bg-white rounded-full blur-[1px]" />
        <div className="absolute w-[30%] h-[30%]">
          <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-0" />
          <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-90" />
          <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-45" />
          <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-[135deg]" />
        </div>
        
        {/* Intelligence-enhanced orbital particles */}
        {particles.map((particle, index) => {
          const x = 50 + Math.cos(particle.angle) * 30;
          const y = 50 + Math.sin(particle.angle) * 30;
          
          return (
            <div 
              key={index}
              className={cn(
                "absolute rounded-full",
                intelligenceLevel >= 90 ? "bg-amber-200" : "bg-white"
              )}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: 0.7 + (intelligenceLevel / 200),
                transform: `translate(-50%, -50%)`,
              }}
            />
          );
        })}
        
        {/* Enhanced orbital lines */}
        <div className="absolute inset-2">
          <div className={cn(
            "absolute inset-0 rounded-full border opacity-50 rotate-45",
            intelligenceLevel >= 90 ? "border-amber-200" : "border-white"
          )} />
          <div className={cn(
            "absolute inset-0 rounded-full border opacity-50 rotate-90",
            intelligenceLevel >= 90 ? "border-amber-200" : "border-white"
          )} />
          <div className={cn(
            "absolute inset-0 rounded-full border opacity-50",
            intelligenceLevel >= 90 ? "border-amber-200" : "border-white"
          )} />
        </div>
        
        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute inset-0 rounded-full border-4 border-white opacity-70 animate-ping" />
        )}

        {/* Level up celebration effect */}
        <AnimatePresence>
          {isLevelingUp && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-amber-400"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Intelligence tooltip */}
      {showIntelligenceTooltip && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {getIntelligencePhase()} • {Math.round(intelligenceLevel)}%
        </div>
      )}
    </div>
  );
};

export { IntelligentSoulOrb };