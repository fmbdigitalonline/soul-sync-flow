
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
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
  const particlesRef = useRef<THREE.Points>(null);
  
  // Color mapping based on stage
  const getColor = () => {
    switch (stage) {
      case "welcome":
        return new THREE.Color("#9b87f5");
      case "collecting":
        return new THREE.Color("#d6bcfa");
      case "generating":
        return new THREE.Color("#6366f1");
      case "complete":
        return new THREE.Color("#fad161");
      default:
        return new THREE.Color("#9b87f5");
    }
  };
  
  // Animation for the orb
  useFrame((state, delta) => {
    if (orbRef.current) {
      // Rotate the orb
      orbRef.current.rotation.y += delta * 0.2;
      
      // Pulsating effect with scale
      const pulseFactor = speaking
        ? Math.sin(state.clock.elapsedTime * 5) * 0.05 + 1.05
        : Math.sin(state.clock.elapsedTime * 2) * 0.03 + 1;
      
      orbRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
    
    // Animate particles around the orb
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.1;
      particlesRef.current.rotation.x += delta * 0.05;
    }
  });
  
  // Create particles around the orb
  const particleCount = 100;
  const particlePositions = React.useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const radius = 1.5;
    
    for (let i = 0; i < particleCount; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    return positions;
  }, []);

  const orbColor = getColor();

  return (
    <group position={position}>
      {/* Main orb */}
      <Sphere ref={orbRef} args={[size, 64, 64]}>
        <MeshDistortMaterial
          color={orbColor}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0}
          metalness={0.2}
          opacity={0.9}
          transparent
        />
      </Sphere>
      
      {/* Particles around the orb */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.8}
          color={orbColor}
        />
      </points>
      
      {/* Glow effect */}
      <Sphere args={[size * 1.2, 32, 32]}>
        <meshBasicMaterial
          color={orbColor}
          transparent
          opacity={0.1}
        />
      </Sphere>
    </group>
  );
};

export { SoulOrb3D };
