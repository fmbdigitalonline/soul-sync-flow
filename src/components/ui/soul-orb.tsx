
import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SoulOrbProps {
  speaking?: boolean;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  stage?: "welcome" | "collecting" | "generating" | "complete";
  onClick?: () => void;
}

const SoulOrb: React.FC<SoulOrbProps> = ({
  speaking = false,
  pulse = true,
  size = "md",
  className,
  stage = "welcome",
  onClick,
}) => {
  const orbRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{ x: number, y: number, size: number, speed: number, angle: number }>>([]);

  // Size mapping
  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  // Color mapping based on stage
  const stageColorMap = {
    welcome: "from-soul-purple via-soul-indigo to-soul-blue",
    collecting: "from-soul-purple via-soul-lavender to-soul-indigo",
    generating: "from-soul-gold via-soul-indigo to-soul-purple",
    complete: "from-soul-gold via-soul-purple to-soul-lavender",
  };

  // Initialize particles
  useEffect(() => {
    const particleCount = 12;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: 50,
        y: 50,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 0.5 + 0.5,
        angle: (Math.PI * 2 / particleCount) * i,
      });
    }
    
    setParticles(newParticles);
  }, []);
  
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
  }, []);

  return (
    <div 
      ref={orbRef}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-full cursor-pointer", 
        sizeMap[size],
        className
      )}
    >
      {/* Core orb */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r", 
          stageColorMap[stage],
          pulse && "animate-pulse-soft",
          speaking && "animate-pulse"
        )}
      />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-soul-purple opacity-20 blur-md" />
      
      {/* Particles */}
      {particles.map((particle, index) => {
        const x = 50 + Math.cos(particle.angle) * 40;
        const y = 50 + Math.sin(particle.angle) * 40;
        
        return (
          <div 
            key={index}
            className="absolute rounded-full bg-white"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: 0.7,
              transform: `translate(-50%, -50%)`,
            }}
          />
        );
      })}
      
      {/* Speaking indicator */}
      {speaking && (
        <div className="absolute inset-0 rounded-full border-4 border-white opacity-70 animate-ping" />
      )}
    </div>
  );
};

export { SoulOrb };
