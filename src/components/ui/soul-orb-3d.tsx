
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SoulOrb3DProps {
  speaking?: boolean;
  stage?: "welcome" | "collecting" | "generating" | "complete";
  size?: number;
  position?: [number, number, number];
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
      
      // Simple pulse effect
      const pulse = speaking 
        ? Math.sin(state.clock.elapsedTime * 5) * 0.05 + 1.05
        : Math.sin(state.clock.elapsedTime * 2) * 0.03 + 1;
      
      orbRef.current.scale.x = pulse;
      orbRef.current.scale.y = pulse;
      orbRef.current.scale.z = pulse;
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
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Simple glow effect */}
      <mesh>
        <sphereGeometry args={[size * 1.2, 16, 16]} />
        <meshBasicMaterial 
          color={getOrbColor()}
          transparent
          opacity={0.1}
        />
      </mesh>
      
      {/* Simple point light */}
      <pointLight 
        color={getOrbColor()} 
        intensity={1}
        distance={4}
      />
    </group>
  );
};

export { SoulOrb3D };
