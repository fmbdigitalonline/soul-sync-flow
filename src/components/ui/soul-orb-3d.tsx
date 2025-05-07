
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SoulOrb3DProps {
  speaking?: boolean;
  stage?: "welcome" | "collecting" | "generating" | "complete";
  size?: number;
  position?: [number, number, number]; // Explicitly typed as a tuple
}

const SoulOrb3D: React.FC<SoulOrb3DProps> = ({
  speaking = false,
  stage = "welcome",
  size = 1,
  position = [0, 0, 0],
}) => {
  const orbRef = useRef<THREE.Mesh>(null);
  
  // Get color based on stage
  const getOrbColor = () => {
    switch (stage) {
      case "welcome": return new THREE.Color("#9b87f5");
      case "collecting": return new THREE.Color("#d6bcfa");
      case "generating": return new THREE.Color("#6366f1");
      case "complete": return new THREE.Color("#fad161");
      default: return new THREE.Color("#9b87f5");
    }
  };
  
  // Animation
  useFrame((state) => {
    if (orbRef.current) {
      // Simple rotation
      orbRef.current.rotation.y += 0.01;
      
      // Simple pulse effect - more pronounced when speaking
      const pulse = speaking 
        ? Math.sin(state.clock.elapsedTime * 5) * 0.05 + 1.05
        : Math.sin(state.clock.elapsedTime * 2) * 0.03 + 1;
      
      orbRef.current.scale.x = size * pulse;
      orbRef.current.scale.y = size * pulse;
      orbRef.current.scale.z = size * pulse;
    }
  });

  return (
    <group position={position}>
      {/* Basic sphere for the orb */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={getOrbColor()} 
          emissive={getOrbColor()}
          emissiveIntensity={speaking ? 0.4 : 0.2}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Enhanced glow effect - more pronounced when speaking */}
      <mesh>
        <sphereGeometry args={[size * (speaking ? 1.3 : 1.2), 16, 16]} />
        <meshBasicMaterial 
          color={getOrbColor()}
          transparent
          opacity={speaking ? 0.15 : 0.1}
        />
      </mesh>
      
      {/* Enhanced point light - brighter when speaking */}
      <pointLight 
        color={getOrbColor()} 
        intensity={speaking ? 1.5 : 1}
        distance={speaking ? 5 : 4}
      />
    </group>
  );
};

export { SoulOrb3D };
