
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
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
  
  // Color mapping based on stage
  const getColor = () => {
    switch (stage) {
      case "welcome":
        return "#9b87f5";
      case "collecting":
        return "#d6bcfa";
      case "generating":
        return "#6366f1";
      case "complete":
        return "#fad161";
      default:
        return "#9b87f5";
    }
  };
  
  // Animation for the orb
  useFrame((state) => {
    if (orbRef.current) {
      // Rotate the orb
      orbRef.current.rotation.y += 0.01;
      
      // Pulsating effect with scale
      const pulseFactor = speaking
        ? Math.sin(state.clock.elapsedTime * 5) * 0.05 + 1.05
        : Math.sin(state.clock.elapsedTime * 2) * 0.03 + 1;
      
      orbRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
  });

  const orbColor = getColor();

  return (
    <group position={position}>
      {/* Main orb */}
      <Sphere ref={orbRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={orbColor}
          roughness={0.3}
          metalness={0.2}
          emissive={orbColor}
          emissiveIntensity={0.2}
        />
      </Sphere>
      
      {/* Glow effect */}
      <Sphere args={[size * 1.2, 16, 16]}>
        <meshBasicMaterial
          color={orbColor}
          transparent={true}
          opacity={0.1}
        />
      </Sphere>
      
      {/* Light emanating from the orb */}
      <pointLight 
        color={orbColor} 
        intensity={1} 
        distance={4}
      />
    </group>
  );
};

export { SoulOrb3D };
