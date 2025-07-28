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

  // Color mapping - changed to bright cyan for all stages to match the provided image
  const stageColorMap = {
    welcome: "from-cyan-400 via-cyan-300 to-cyan-200",
    collecting: "from-cyan-400 via-cyan-300 to-cyan-200",
    generating: "from-cyan-400 via-cyan-300 to-cyan-200",
    complete: "from-cyan-400 via-cyan-300 to-cyan-200",
  };

  // Initialize particles
  useEffect(() => {
    const particleCount = 12;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: 50,
        y: 50,
        size: Math.random() * 3 + 1.5, // Smaller particles
        speed: Math.random() * 0.3 + 0.3, // Slower speed
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
        "relative flex items-center justify-center rounded-full cursor-pointer overflow-hidden", 
        sizeMap[size],
        className
      )}
    >
      {/* Core orb - updated to bright cyan/turquoise */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r", 
          stageColorMap[stage],
          pulse && "animate-pulse-soft",
          speaking && "animate-pulse"
        )}
      />
      
      {/* Glow effect - updated color */}
      <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-md" />
      
      {/* Star in the center */}
      <div className="absolute w-1/2 h-1/2 bg-white rounded-full blur-[1px]" />
      <div className="absolute w-[30%] h-[30%]">
        <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-0" />
        <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-90" />
        <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-45" />
        <div className="absolute left-[45%] top-0 w-[10%] h-[100%] bg-white transform rotate-[135deg]" />
      </div>
      
      {/* Orbital rings - adjusted to stay within bounds */}
      {particles.map((particle, index) => {
        // Reduced orbital radius to 30% to keep particles inside the circle
        const x = 50 + Math.cos(particle.angle) * 30;
        const y = 50 + Math.sin(particle.angle) * 30;
        
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
      
      {/* Orbital lines - adjusted to fit within circle */}
      <div className="absolute inset-2">
        <div className="absolute inset-0 rounded-full border border-white opacity-50 rotate-45" />
        <div className="absolute inset-0 rounded-full border border-white opacity-50 rotate-90" />
        <div className="absolute inset-0 rounded-full border border-white opacity-50" />
      </div>
      
      {/* Speaking indicator */}
      {speaking && (
        <div className="absolute inset-0 rounded-full border-4 border-white opacity-70 animate-ping" />
      )}
    </div>
  );
};

export { SoulOrb };
