
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { SoulOrb3D } from './soul-orb-3d';

interface Onboarding3DSceneProps {
  speaking?: boolean;
  stage?: "welcome" | "collecting" | "generating" | "complete";
  children?: React.ReactNode;
}

const Onboarding3DScene: React.FC<Onboarding3DSceneProps> = ({ 
  speaking = false,
  stage = "welcome",
  children 
}) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          {/* Ambient light */}
          <ambientLight intensity={0.2} />
          
          {/* Directional light */}
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            color="#ffffff" 
          />
          
          {/* Soul Orb */}
          <SoulOrb3D 
            speaking={speaking}
            stage={stage}
            position={[0, 0, 0]}
            size={1}
          />
          
          {/* Background stars */}
          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0}
          />
          
          {/* Ambient environment */}
          <Environment preset="night" />
          
          {/* Controls for user interaction */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay content (speech bubbles, forms) */}
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
