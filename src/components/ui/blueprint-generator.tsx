
import React, { useState, useEffect } from "react";
import { motion } from "@/lib/framer-motion";
import { SoulOrb } from "./soul-orb";
import { cn } from "@/lib/utils";

interface BlueprintGeneratorProps {
  onComplete: () => void;
  formData: any;
  className?: string;
}

const BlueprintGenerator: React.FC<BlueprintGeneratorProps> = ({ 
  onComplete, 
  formData,
  className 
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'preparing' | 'assembling' | 'finalizing' | 'complete'>('preparing');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);

  // Generate random particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      speed: Math.random() * 2 + 1
    }));
    setParticles(newParticles);
  }, []);

  // Animation progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 3 + 1;
          const newProgress = Math.min(prev + increment, 100);
          
          // Update stages based on progress
          if (newProgress > 30 && stage === 'preparing') {
            setStage('assembling');
          } else if (newProgress > 70 && stage === 'assembling') {
            setStage('finalizing');
          } else if (newProgress === 100 && stage === 'finalizing') {
            setStage('complete');
            setTimeout(onComplete, 1500);
          }
          
          return newProgress;
        });
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress, stage, onComplete]);

  return (
    <div className={cn("relative w-full h-64 overflow-hidden rounded-xl", className)}>
      {/* Cosmic background with stars */}
      <div className="absolute inset-0 bg-soul-black">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute bg-white rounded-full opacity-70"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: particle.speed,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Center orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ 
            scale: stage === 'complete' ? [1, 1.5, 1] : 1,
            rotate: progress * 5
          }}
          transition={{ duration: 2 }}
        >
          <SoulOrb 
            size="lg" 
            stage={stage === 'preparing' ? 'welcome' : 
                  stage === 'assembling' ? 'collecting' :
                  stage === 'finalizing' ? 'generating' : 'complete'}
            pulse={true}
            speaking={false}
          />
        </motion.div>
      </div>
      
      {/* Energy streams flowing toward the orb */}
      <div className="absolute inset-0">
        {progress < 100 && Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-16 bg-gradient-to-c from-soul-purple to-transparent"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: 'center',
              rotate: `${i * 45}deg`,
              translateX: '-50%',
              translateY: '-50%'
            }}
            animate={{
              height: [30, 100, 30],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      
      {/* Status text */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-white">
        <p className="font-medium text-lg">
          {stage === 'preparing' && 'Preparing Soul Blueprint...'}
          {stage === 'assembling' && 'Assembling Cosmic Patterns...'}
          {stage === 'finalizing' && 'Connecting Energy Pathways...'}
          {stage === 'complete' && 'Soul Blueprint Complete!'}
        </p>
        
        {/* Progress bar */}
        <div className="mt-2 mx-auto w-64 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-soul-purple"
            style={{ width: `${progress}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

export { BlueprintGenerator };
