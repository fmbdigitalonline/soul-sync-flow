
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SoulOrb3D } from './soul-orb-3d';

interface Onboarding3DSceneProps {
  speaking?: boolean;
  stage?: "welcome" | "collecting" | "generating" | "complete";
  interactionStage?: "listening" | "input";
  children?: React.ReactNode;
}

const Onboarding3DScene: React.FC<Onboarding3DSceneProps> = ({ 
  speaking = false,
  stage = "welcome",
  interactionStage = "listening",
  children 
}) => {
  // Set the orb position based on interaction stage
  const orbPosition = interactionStage === 'listening' ? [0, 0, 0] : [0, -1, -2];
  
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          {/* Simple ambient light */}
          <ambientLight intensity={0.5} />
          
          {/* Simple directional light */}
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          
          {/* Soul Orb with position based on interaction stage */}
          <SoulOrb3D 
            speaking={speaking}
            stage={stage}
            position={orbPosition}
            size={interactionStage === 'listening' ? 1 : 0.7}
          />
          
          {/* Simple background color */}
          <color attach="background" args={['#0a0a1a']} />
          
          {/* Simple controls - more restricted when in input mode */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            rotateSpeed={interactionStage === 'listening' ? 0.5 : 0.2}
            enableRotate={interactionStage === 'listening'}
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay content */}
      {children && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="pointer-events-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export { Onboarding3DScene };
