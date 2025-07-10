
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
  const radius = (ringSize[size] - 6) / 2; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (intelligenceLevel / 100) * circumference;

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
      {/* Progress Ring - Made more visible */}
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
            stroke="rgba(255, 215, 0, 0.3)" // More visible golden background
            strokeWidth="2"
            fill="transparent"
          />
          {/* Progress ring - brighter gold */}
          <motion.circle
            cx={ringSize[size] / 2}
            cy={ringSize[size] / 2}
            r={radius}
            stroke="#FFD700" // Pure gold color
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

      {/* Main Soul Orb with breathing animation */}
      <motion.div 
        ref={orbRef}
        onClick={onClick}
        className={cn(
          "relative flex items-center justify-center rounded-full cursor-pointer overflow-hidden", 
          sizeMap[size],
          className
        )}
        animate={{
          scale: pulse && !speaking ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 3, // Slow breathing
          repeat: pulse && !speaking ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Core orb */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r", 
            getOrbColors,
            speaking && "animate-pulse",
            isLevelingUp && "animate-ping"
          )}
        />
        
        {/* Enhanced glow effect based on intelligence */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full blur-sm", // Reduced blur for smaller orb
            intelligenceLevel >= 90 ? "bg-amber-400 opacity-30" :
            intelligenceLevel >= 70 ? "bg-cyan-400 opacity-25" :
            "bg-cyan-400 opacity-20"
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
        
        {/* Intelligence-enhanced orbital particles */}
        {particles.map((particle, index) => {
          const x = 50 + Math.cos(particle.angle) * 28; // Slightly reduced orbit
          const y = 50 + Math.sin(particle.angle) * 28;
          
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
            "absolute inset-0 rounded-full border opacity-40",
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
