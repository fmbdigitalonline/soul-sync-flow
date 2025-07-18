import { useEffect, useRef, useCallback } from 'react';

interface UseStepAudioProps {
  audioUrl?: string;
  isActive: boolean;
  audioMuted: boolean;
  onAudioStateChange: (isPlaying: boolean, audio: HTMLAudioElement | null) => void;
}

export const useStepAudio = ({ 
  audioUrl, 
  isActive, 
  audioMuted, 
  onAudioStateChange 
}: UseStepAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  // Audio preference key
  const AUDIO_MUTE_KEY = 'steward_intro_audio_muted';

  // Get initial mute preference from localStorage
  const getInitialMuteState = useCallback(() => {
    const saved = localStorage.getItem(AUDIO_MUTE_KEY);
    return saved === 'true';
  }, []);

  // Save mute preference to localStorage
  const saveMutePreference = useCallback((muted: boolean) => {
    localStorage.setItem(AUDIO_MUTE_KEY, muted.toString());
  }, []);

  // Clean up audio when component unmounts or step changes
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      isPlayingRef.current = false;
      onAudioStateChange(false, null);
    }
  }, [onAudioStateChange]);

  // Play audio for current step
  const playStepAudio = useCallback(async () => {
    if (!audioUrl || audioMuted) return;

    try {
      // Clean up any existing audio
      cleanupAudio();

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.onloadstart = () => {
        console.log(`🎵 Loading audio: ${audioUrl}`);
      };

      audio.oncanplay = () => {
        console.log(`🎵 Audio ready to play: ${audioUrl}`);
      };

      audio.onplay = () => {
        isPlayingRef.current = true;
        onAudioStateChange(true, audio);
        console.log(`🎵 Audio playing: ${audioUrl}`);
      };

      audio.onpause = () => {
        isPlayingRef.current = false;
        onAudioStateChange(false, audio);
        console.log(`🎵 Audio paused: ${audioUrl}`);
      };

      audio.onended = () => {
        isPlayingRef.current = false;
        onAudioStateChange(false, null);
        console.log(`🎵 Audio ended: ${audioUrl}`);
      };

      audio.onerror = (error) => {
        console.warn(`🎵 Audio error for ${audioUrl}:`, error);
        isPlayingRef.current = false;
        onAudioStateChange(false, null);
      };

      // Start playing
      await audio.play();
    } catch (error) {
      console.warn(`🎵 Failed to play audio ${audioUrl}:`, error);
      cleanupAudio();
    }
  }, [audioUrl, audioMuted, cleanupAudio, onAudioStateChange]);

  // Stop current audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Toggle mute state
  const toggleMute = useCallback(() => {
    const newMuteState = !audioMuted;
    saveMutePreference(newMuteState);
    
    if (newMuteState && audioRef.current) {
      stopAudio();
    } else if (!newMuteState && audioUrl && isActive) {
      playStepAudio();
    }
    
    return newMuteState;
  }, [audioMuted, audioUrl, isActive, playStepAudio, stopAudio, saveMutePreference]);

  // Effect to handle step audio playback
  useEffect(() => {
    if (isActive && audioUrl && !audioMuted) {
      playStepAudio();
    } else {
      stopAudio();
    }

    // Cleanup when step changes or becomes inactive
    return () => {
      if (!isActive) {
        cleanupAudio();
      }
    };
  }, [isActive, audioUrl, audioMuted, playStepAudio, stopAudio, cleanupAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupAudio;
  }, [cleanupAudio]);

  return {
    getInitialMuteState,
    toggleMute,
    stopAudio,
    cleanupAudio
  };
};