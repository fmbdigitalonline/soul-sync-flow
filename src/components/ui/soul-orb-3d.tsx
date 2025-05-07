
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';

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
  const starVideoRef = useRef<THREE.Mesh>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  // Use the correct type for Three.js line objects
  const ring1Ref = useRef<THREE.Line>(null);
  const ring2Ref = useRef<THREE.Line>(null);
  const ring3Ref = useRef<THREE.Line>(null);
  
  // Get orb color based on stage
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
  
  // Create video texture for the star burst effect
  const { videoTexture, fallbackTexture } = useMemo(() => {
    // Create video element programmatically
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    
    // Store video reference
    videoRef.current = video;
    
    // Create texture from video
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    
    // Fallback texture in case video fails
    const fallback = new THREE.TextureLoader().load('/lovable-uploads/8951ad75-3386-46ac-9b0e-99dbe6c84f7c.png');
    
    return { videoTexture: texture, fallbackTexture: fallback };
  }, []);
  
  // Handle video loading and setup
  useEffect(() => {
    const video = videoRef.current;
    
    if (video && videoUrl) {
      // Set the video source once we have the URL
      video.src = videoUrl;
      console.log("Setting video source:", videoUrl);
      
      // Handle video loaded event
      const handleVideoLoaded = () => {
        console.log('Video loaded successfully');
        setVideoLoaded(true);
        
        // Force an update of the video texture
        if (videoTexture) {
          videoTexture.needsUpdate = true;
        }
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
          console.log("Video playing successfully");
        } catch (error) {
          console.error('Video autoplay failed:', error);
          // We'll fall back to the static image texture
          if (starVideoRef.current) {
            const material = starVideoRef.current.material as THREE.MeshBasicMaterial;
            material.map = fallbackTexture;
            material.needsUpdate = true;
          }
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
  }, [videoUrl, fallbackTexture, videoTexture]);
  
  // Update video playback state based on speaking prop
  useEffect(() => {
    if (videoRef.current && videoLoaded) {
      if (speaking) {
        videoRef.current.playbackRate = 1.2; // Speed up slightly when speaking
      } else {
        videoRef.current.playbackRate = 1.0;
      }
    }
  }, [speaking, videoLoaded]);
  
  // Make sure the texture stays updated
  useEffect(() => {
    if (videoLoaded && starVideoRef.current) {
      const material = starVideoRef.current.material as THREE.MeshBasicMaterial;
      material.map = videoTexture;
      material.transparent = true;
      material.opacity = 0.9;
      material.needsUpdate = true;
    }
  }, [videoLoaded, videoTexture]);
  
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
        // Ensure the video mesh is properly centered inside the orb
        starVideoRef.current.lookAt(state.camera.position);
        starVideoRef.current.rotation.z += 0.005; // Subtle rotation
        
        // Pulse the star brightness
        const starMaterial = starVideoRef.current.material as THREE.MeshBasicMaterial;
        starMaterial.opacity = speaking ? 
          0.95 + Math.sin(state.clock.elapsedTime * 8) * 0.05 : 
          0.9 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      }
    }
    
    // Update video texture every frame if needed
    if (videoLoaded && videoTexture) {
      videoTexture.needsUpdate = true;
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
      <mesh ref={starVideoRef} scale={[0.75, 0.75, 0.75]}>
        <boxGeometry args={[size * 0.8, size * 0.8, 0.01]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent={true}
          opacity={1}
          side={THREE.DoubleSide}
          map={videoLoaded && !videoError ? videoTexture : fallbackTexture}
          alphaTest={0.1}
        />
      </mesh>
      
      {/* Orbital rings */}
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
