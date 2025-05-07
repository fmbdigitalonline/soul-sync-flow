
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
    return new THREE.Color("#00E5FF"); // Bright cyan like in the image
  };
  
  // Ring curves for the orbital rings - adjusted to match the image more closely
  const curve1 = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.3 * size, 1.3 * size, 0, 2 * Math.PI, false);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  }, [size]);
  
  const curve2 = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.2 * size, 1.4 * size, 0, 2 * Math.PI, false);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  }, [size]);
  
  const curve3 = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.4 * size, 1.2 * size, 0, 2 * Math.PI, false);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  }, [size]);
  
  // Create a texture for the star burst
  const starBurstTexture = useMemo(() => {
    // Use the uploaded image for the star burst
    return new THREE.TextureLoader().load('/lovable-uploads/8951ad75-3386-46ac-9b0e-99dbe6c84f7c.png');
  }, []);
  
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
        starRef.current.rotation.z += 0.005; // Subtle rotation
        
        // Pulse the star brightness
        const starMaterial = starRef.current.material as THREE.MeshBasicMaterial;
        starMaterial.opacity = speaking ? 
          0.95 + Math.sin(state.clock.elapsedTime * 8) * 0.05 : 
          0.9 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      }
    }
    
    // Animate the orbital rings - slower and more subtle movement
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3 + Math.PI * 0.5;
      ring1Ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.3 + Math.PI * 0.25;
    }
    
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.3;
      ring2Ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3 + Math.PI * 0.5;
    }
    
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.3 - Math.PI * 0.25;
      ring3Ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.3 + Math.PI * 0.5;
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
          emissiveIntensity={speaking ? 1.2 : 0.8}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      
      {/* Star/burst effect in the center - now using the provided image */}
      <mesh ref={starRef}>
        <planeGeometry args={[size * 0.65, size * 0.65]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={1}
          side={THREE.DoubleSide}
          map={starBurstTexture}
        />
      </mesh>
      
      {/* Orbital rings - use 'primitive' for proper typing */}
      <primitive object={new THREE.Line(curve1, new THREE.LineBasicMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.8,
        linewidth: 2
      }))} ref={ring1Ref} />
      
      <primitive object={new THREE.Line(curve2, new THREE.LineBasicMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.8,
        linewidth: 2
      }))} ref={ring2Ref} />
      
      <primitive object={new THREE.Line(curve3, new THREE.LineBasicMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.8,
        linewidth: 2
      }))} ref={ring3Ref} />
      
      {/* Enhanced glow effect - more pronounced to match the image */}
      <mesh>
        <sphereGeometry args={[size * (speaking ? 1.6 : 1.4), 16, 16]} />
        <meshBasicMaterial 
          color={orbColor}
          transparent
          opacity={speaking ? 0.2 : 0.15}
        />
      </mesh>
      
      {/* Outer glow - matches the fade in the image */}
      <mesh>
        <sphereGeometry args={[size * 2, 16, 16]} />
        <meshBasicMaterial 
          color={orbColor}
          transparent
          opacity={0.05}
        />
      </mesh>
      
      {/* Enhanced point light - brighter to match the glow in the image */}
      <pointLight 
        color={orbColor} 
        intensity={speaking ? 2 : 1.5}
        distance={speaking ? 8 : 6}
      />
    </group>
  );
};

export { SoulOrb3D };
