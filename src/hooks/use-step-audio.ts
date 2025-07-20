
import { useEffect, useRef, useCallback, useState } from 'react';

interface UseStepAudioProps {
  audioUrl?: string;
  isActive: boolean;
  audioMuted: boolean;
  onAudioStateChange: (isPlaying: boolean, audio: HTMLAudioElement | null) => void;
}

interface AudioError {
  message: string;
  url?: string;
  timestamp: number;
}

export const useStepAudio = ({ 
  audioUrl, 
  isActive, 
  audioMuted, 
  onAudioStateChange 
}: UseStepAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUpRef = useRef(false);
  
  // 🧭 Error state tracking (Build Transparently)
  const [audioError, setAudioError] = useState<AudioError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

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
    console.log('🧹 Audio cleanup started');
    isCleaningUpRef.current = true;
    
    // Clear any pending retry timers
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    // Abort any ongoing audio operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
      isPlayingRef.current = false;
      console.log('🧹 Audio cleanup completed');
    }
    
    // Reset error and retry state
    setAudioError(null);
    setRetryCount(0);
    
    onAudioStateChange(false, null);
  }, [onAudioStateChange]);

  // Play audio for current step
  const playStepAudio = useCallback(async () => {
    // 🚫 Circuit breaker: Don't play if inactive or cleaning up
    if (!audioUrl || audioMuted || !isActive || isCleaningUpRef.current) {
      console.log('🚫 Audio playback skipped:', { audioUrl: !!audioUrl, audioMuted, isActive, isCleaningUp: isCleaningUpRef.current });
      return;
    }

    try {
      // Clean up any existing audio first
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      // Create abort controller for this audio session
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      console.log(`🎵 Loading audio: ${audioUrl}`);

      // Set up event listeners
      audio.onloadstart = () => {
        if (!signal.aborted && isActive) {
          console.log(`🎵 Loading audio: ${audioUrl}`);
        }
      };

      audio.oncanplay = () => {
        if (!signal.aborted && isActive) {
          console.log(`🎵 Audio ready to play: ${audioUrl}`);
        }
      };

      audio.onplay = () => {
        if (!signal.aborted && isActive) {
          isPlayingRef.current = true;
          onAudioStateChange(true, audio);
          console.log(`🎵 Audio playing: ${audioUrl}`);
        }
      };

      audio.onpause = () => {
        if (!signal.aborted) {
          isPlayingRef.current = false;
          onAudioStateChange(false, audio);
          console.log(`🎵 Audio paused: ${audioUrl}`);
        }
      };

      audio.onended = () => {
        if (!signal.aborted) {
          isPlayingRef.current = false;
          onAudioStateChange(false, null);
          console.log(`🎵 Audio ended: ${audioUrl}`);
        }
      };

      audio.onerror = (error) => {
        if (!signal.aborted && isActive) {
          const audioError: AudioError = {
            message: `Audio loading failed for ${audioUrl}`,
            url: audioUrl,
            timestamp: Date.now()
          };
          setAudioError(audioError);
          console.warn(`🔴 Audio error for ${audioUrl}:`, error);
          isPlayingRef.current = false;
          onAudioStateChange(false, null);
        }
      };

      // Check if we should still proceed (component might have become inactive)
      if (signal.aborted || !isActive || isCleaningUpRef.current) {
        console.log('🚫 Audio playback aborted before play');
        return;
      }

      // Start playing
      await audio.play();
      
      // Clear any previous error on successful play
      if (audioError && !signal.aborted) {
        setAudioError(null);
        setRetryCount(0);
      }
    } catch (error) {
      // Don't process errors if component is inactive or cleaning up
      if (!isActive || isCleaningUpRef.current) {
        console.log('🚫 Audio error ignored - component inactive');
        return;
      }

      const errorObj: AudioError = {
        message: `Failed to play audio: ${String(error)}`,
        url: audioUrl,
        timestamp: Date.now()
      };
      setAudioError(errorObj);
      
      // Retry logic with circuit breaker
      if (retryCount < MAX_RETRIES && isActive && !isCleaningUpRef.current) {
        console.warn(`🔄 Audio playback failed, retrying (${retryCount + 1}/${MAX_RETRIES}):`, error);
        setRetryCount(prev => prev + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          // Double-check that we should still retry
          if (isActive && !isCleaningUpRef.current) {
            playStepAudio();
          }
        }, 1000 * (retryCount + 1));
      } else {
        console.error(`🔴 Audio playback failed after ${MAX_RETRIES} retries:`, error);
        cleanupAudio();
      }
    }
  }, [audioUrl, audioMuted, isActive, onAudioStateChange, audioError, retryCount, cleanupAudio]);

  // Stop current audio
  const stopAudio = useCallback(() => {
    console.log('🛑 Audio stop requested');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Clear retry timers when stopping
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
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

  // Effect to handle step audio playback with proper cleanup detection
  useEffect(() => {
    isCleaningUpRef.current = false;
    
    if (isActive && audioUrl && !audioMuted) {
      console.log('🎵 Starting audio playback for active step');
      playStepAudio();
    } else {
      console.log('🛑 Stopping audio - conditions not met:', { isActive, hasAudio: !!audioUrl, audioMuted });
      stopAudio();
    }

    // Cleanup when step changes or becomes inactive
    return () => {
      if (!isActive) {
        console.log('🧹 Step became inactive, cleaning up audio');
        cleanupAudio();
      }
    };
  }, [isActive, audioUrl, audioMuted]); // Removed playStepAudio and stopAudio from deps to prevent loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, final cleanup');
      cleanupAudio();
    };
  }, []); // Only run on unmount

  return {
    getInitialMuteState,
    toggleMute,
    stopAudio,
    cleanupAudio,
    audioError, // 🧭 Expose error state for transparent debugging
    retryCount
  };
};
