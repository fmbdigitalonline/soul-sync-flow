
import React, { useRef, useMemo, useEffect } from 'react';
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
  const starVideoRef = useRef<THREE.Mesh>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
  
  // Create video texture for the star burst effect
  const videoTexture = useMemo(() => {
    // Create video element
    const video = document.createElement('video');
    video.src = '/lovable-uploads/8951ad75-3386-46ac-9b0e-99dbe6c84f7c.png'; // Fallback to static image initially
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    
    // Store video reference
    videoRef.current = video;
    
    // Create texture from video
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    
    return texture;
  }, []);
  
  // Fallback texture in case video fails
  const fallbackTexture = useMemo(() => {
    return new THREE.TextureLoader().load('/lovable-uploads/8951ad75-3386-46ac-9b0e-99dbe6c84f7c.png');
  }, []);
  
  // Handle video playback
  useEffect(() => {
    const video = videoRef.current;
    
    if (video) {
      // Try to play the video - browsers might block autoplay
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Video autoplay failed:', error);
          // If autoplay fails, we'll fall back to the static image texture
          if (starVideoRef.current) {
            const material = starVideoRef.current.material as THREE.MeshBasicMaterial;
            material.map = fallbackTexture;
            material.needsUpdate = true;
          }
        });
      }
      
      // Update video playback state based on speaking prop
      if (speaking) {
        video.playbackRate = 1.2; // Speed up slightly when speaking
      } else {
        video.playbackRate = 1.0;
      }
    }
    
    // Clean up video on component unmount
    return () => {
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, [speaking, fallbackTexture]);
  
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
      
      // Star video animation
      if (starVideoRef.current) {
        starVideoRef.current.rotation.z += 0.005; // Subtle rotation
        
        // Pulse the star brightness
        const starMaterial = starVideoRef.current.material as THREE.MeshBasicMaterial;
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
      
      {/* Star/burst effect in the center - now using video texture */}
      <mesh ref={starVideoRef}>
        <planeGeometry args={[size * 0.65, size * 0.65]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={1}
          side={THREE.DoubleSide}
          map={videoTexture}
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
