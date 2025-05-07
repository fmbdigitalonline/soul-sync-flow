
import React, { useRef, useMemo } from 'react';
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
  // References for animations
  const orbRef = useRef<THREE.Mesh>(null);
  const starRef = useRef<THREE.Mesh>(null);
  
  // Use the correct type for Three.js line objects
  const ring1Ref = useRef<THREE.Line>(null);
  const ring2Ref = useRef<THREE.Line>(null);
  const ring3Ref = useRef<THREE.Line>(null);
  
  // Get orb color based on stage
  const getOrbColor = () => {
    switch (stage) {
      case "welcome": return new THREE.Color("#0EA5E9"); // Bright cyan like in the image
      case "collecting": return new THREE.Color("#0EA5E9");
      case "generating": return new THREE.Color("#0EA5E9");
      case "complete": return new THREE.Color("#0EA5E9"); 
      default: return new THREE.Color("#0EA5E9");
    }
  };
  
  // Ring curves for the orbital rings
  const curve1 = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.3 * size, 1.3 * size, 0, 2 * Math.PI, false);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  }, [size]);
  
  const curve2 = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.3 * size, 1.3 * size, 0, 2 * Math.PI, false);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  }, [size]);
  
  const curve3 = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.3 * size, 1.3 * size, 0, 2 * Math.PI, false);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  }, [size]);
  
  // Animation
  useFrame((state) => {
    if (orbRef.current) {
      // Simple pulse effect - more pronounced when speaking
      const pulse = speaking 
        ? Math.sin(state.clock.elapsedTime * 5) * 0.05 + 1.05
        : Math.sin(state.clock.elapsedTime * 2) * 0.03 + 1;
      
      orbRef.current.scale.x = size * pulse;
      orbRef.current.scale.y = size * pulse;
      orbRef.current.scale.z = size * pulse;
      
      // Star burst animation
      if (starRef.current) {
        starRef.current.rotation.z += 0.01;
        
        // Pulse the star brightness
        const starMaterial = starRef.current.material as THREE.MeshBasicMaterial;
        starMaterial.opacity = speaking ? 
          0.9 + Math.sin(state.clock.elapsedTime * 8) * 0.1 : 
          0.7 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      }
    }
    
    // Animate the orbital rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.5 + Math.PI * 0.5;
      ring1Ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5 + Math.PI * 0.25;
    }
    
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.5;
      ring2Ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.5 + Math.PI * 0.5;
    }
    
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.5 - Math.PI * 0.25;
      ring3Ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.5 + Math.PI * 0.5;
    }
  });
  
  // Orb color as a THREE.Color object
  const orbColor = getOrbColor();
  
  return (
    <group position={position}>
      {/* Main orb sphere */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={orbColor} 
          emissive={orbColor}
          emissiveIntensity={speaking ? 0.8 : 0.6}
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      
      {/* Star/burst effect in the center */}
      <mesh ref={starRef}>
        <planeGeometry args={[size * 0.8, size * 0.8]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
          map={new THREE.TextureLoader().load('/lovable-uploads/a863f3d0-f01f-46f7-9a90-ab24a1b1eacc.png')}
        />
      </mesh>
      
      {/* Orbital rings - use 'primitive' with ref to make TypeScript happy */}
      <primitive object={new THREE.Line(curve1, new THREE.LineBasicMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.8,
      }))} ref={ring1Ref} />
      
      <primitive object={new THREE.Line(curve2, new THREE.LineBasicMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.8,
      }))} ref={ring2Ref} />
      
      <primitive object={new THREE.Line(curve3, new THREE.LineBasicMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.8,
      }))} ref={ring3Ref} />
      
      {/* Enhanced glow effect - more pronounced when speaking */}
      <mesh>
        <sphereGeometry args={[size * (speaking ? 1.5 : 1.3), 16, 16]} />
        <meshBasicMaterial 
          color={orbColor}
          transparent
          opacity={speaking ? 0.15 : 0.1}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[size * 1.8, 16, 16]} />
        <meshBasicMaterial 
          color={orbColor}
          transparent
          opacity={0.05}
        />
      </mesh>
      
      {/* Enhanced point light - brighter when speaking */}
      <pointLight 
        color={orbColor} 
        intensity={speaking ? 1.8 : 1.2}
        distance={speaking ? 8 : 6}
      />
    </group>
  );
};

export { SoulOrb3D };
