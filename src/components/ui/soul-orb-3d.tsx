
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';

// Import the React Three Fiber type declarations
import '@/types/react-three-fiber';

interface SoulOrbProps {
  speaking?: boolean;
  stage?: "welcome" | "collecting" | "generating" | "complete";
  size?: number;
  position?: [number, number, number];
}

const SoulOrb3D: React.FC<SoulOrbProps> = ({
  speaking = false,
  stage = "welcome",
  size = 1,
  position = [0, 0, 0],
}) => {
  // References for animations
  const orbRef = useRef<THREE.Mesh>(null);
  const starRef = useRef<THREE.Mesh>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  // Fix the type for THREE.Line objects with proper type assertion
  const ring1Ref = useRef<THREE.Line>(null);
  const ring2Ref = useRef<THREE.Line>(null);
  const ring3Ref = useRef<THREE.Line>(null);
  
  // Get orb color based on stage - now unified to bright cyan
  const getOrbColor = () => {
    return new THREE.Color("#00E5FF"); // Bright cyan like in the image
  };
  
  // Set direct video URL from Supabase storage
  useEffect(() => {
    // Use the provided direct URL for the video instead of fetching
    const directVideoUrl = "https://qxaajirrqrcnmvtowjbg.supabase.co/storage/v1/object/sign/soul-orb-core/soul-orb-core.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzYxYmNkYWUyLTVmMTUtNGRkMS1iMzkzLThiNTZjZDcwMWY5NiJ9.eyJ1cmwiOiJzb3VsLW9yYi1jb3JlL3NvdWwtb3JiLWNvcmUubXA0IiwiaWF0IjoxNzQ2NjE0MDEzLCJleHAiOjE4NDEyMjIwMTN9.u4D0UrNff4OgseQYxv1YfUvpI9CmFr_9xdlDTvFdAUU";
    setVideoUrl(directVideoUrl);
  }, []);
  
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
  
  // Star shape geometry for the center - new addition to match the provided image
  const starGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // Create a simple four-point star
    const vertices = new Float32Array([
      0, 0.5, 0,    // Top
      0.5, 0, 0,    // Right
      0, -0.5, 0,   // Bottom
      -0.5, 0, 0,   // Left
      0, 0, 0.5,    // Front
      0, 0, -0.5,   // Back
    ]);
    
    const indices = [
      0, 4, 1,
      1, 4, 2,
      2, 4, 3,
      3, 4, 0,
      0, 5, 1,
      1, 5, 2,
      2, 5, 3,
      3, 5, 0,
    ];
    
    geo.setIndex(indices);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    
    return geo;
  }, []);
  
  // Handle video loading and setup for potential texture use
  useEffect(() => {
    const video = videoRef.current;
    
    if (video && videoUrl) {
      // Set the video source once we have the URL
      video.src = videoUrl;
      
      // Handle video loaded event
      const handleVideoLoaded = () => {
        console.log('Video loaded successfully');
        setVideoLoaded(true);
      };
      
      // Handle video error event
      const handleVideoError = (e: ErrorEvent) => {
        console.error('Video failed to load:', e);
        setVideoError(true);
      };
      
      video.addEventListener('loadeddata', handleVideoLoaded);
      video.addEventListener('error', handleVideoError as EventListener);
      
      // Try to play the video - browsers might block autoplay
      const tryPlay = async () => {
        try {
          await video.play();
        } catch (error) {
          console.error('Video autoplay failed:', error);
        }
      };
      
      tryPlay();
      
      return () => {
        video.removeEventListener('loadeddata', handleVideoLoaded);
        video.removeEventListener('error', handleVideoError as EventListener);
        video.pause();
        video.src = '';
        video.load();
      };
    }
  }, [videoUrl]);
  
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
      
      // Star animation
      if (starRef.current) {
        starRef.current.rotation.y += 0.01;
        starRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
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
      
      {/* Star in the center */}
      <mesh ref={starRef} scale={[0.5, 0.5, 0.5]}>
        <sphereGeometry args={[size * 0.3, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Star points */}
      <mesh scale={[size * 0.6, size * 0.6, size * 0.6]}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial 
          color="#FFFFFF"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Orbital rings - properly typed for THREE.Line */}
      <line ref={ring1Ref}>
        <bufferGeometry attach="geometry" {...curve1} />
        <lineBasicMaterial attach="material" color="#FFFFFF" transparent opacity={0.8} />
      </line>
      
      <line ref={ring2Ref}>
        <bufferGeometry attach="geometry" {...curve2} />
        <lineBasicMaterial attach="material" color="#FFFFFF" transparent opacity={0.8} />
      </line>
      
      <line ref={ring3Ref}>
        <bufferGeometry attach="geometry" {...curve3} />
        <lineBasicMaterial attach="material" color="#FFFFFF" transparent opacity={0.8} />
      </line>
      
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
