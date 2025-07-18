import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TutorialStep, TutorialState } from '@/types/tutorial';

export const useTutorialFlow = () => {
  const { user } = useAuth();
  const [tutorialState, setTutorialState] = useState<TutorialState>({
    isActive: false,
    currentStep: 0,
    steps: [],
    completed: false
  });

  // Get display name helper
  const getDisplayName = () => {
    if (!user) return 'Friend';
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'Friend';
  };

  // Start tutorial sequence
  const startTutorial = useCallback(() => {
    console.log('🎓 Tutorial startTutorial called, user:', !!user);
    if (!user) return;

    const userName = getDisplayName();
    
    const steps: TutorialStep[] = [
      {
        id: 'welcome',
        title: `✨ Welcome, ${userName}`,
        content: `This space is not a tool. It's a mirror. One built to reflect your truth, hold your journey, and evolve with you.\n\nEvery action you take here aligns you with who you already are beneath the noise. Your growth isn't added on—it's remembered.`,
        showContinue: true
      },
      {
        id: 'blueprint',
        title: '🔎 Your Living Blueprint',
        content: `Everything here is designed around your unique design. You won't see complex models or theories named. But know this:\n\nEvery suggestion, every insight, every prompt is crafted to reflect the deeper code that makes you... you.\n\nThis isn't about fixing. It's about remembering.`,
        showContinue: true
      },
      {
        id: 'rhythm',
        title: `🔄 Choose Your Rhythm`,
        content: `Your growth moves in cycles, ${userName}. SoulSync honors that.\n\nChoose how you want to show up today:\n\n**Growth Mode** 🌿 — Reflect, process, and evolve\n\n**Productivity Mode** ✅ — Get things done, aligned with your energy\n\n**Companion Mode** 🪤 — Talk freely, think out loud, and feel deeply heard\n\nEach mode evolves as you do.`,
        showContinue: true
      },
      {
        id: 'daily_space',
        title: '🔗 Start Each Day Connected',
        content: `This is your Daily Space. A living reflection of what matters most.\n\nHere you'll find:\n\n• What today is really about for you\n• A gentle focus to keep your truth near\n• One aligned action to move forward\n• A whisper from within, written just for you\n\nAnd above all, a reminder: You are exactly where you need to be.`,
        showContinue: true
      },
      {
        id: 'growth_mode',
        title: '🎓 Grow From Within',
        content: `Sometimes clarity comes in stillness. In Growth Mode, you'll:\n\n• Reflect on what matters\n• Track your emotional and mental state\n• Recognize patterns\n• Process, heal, and deepen your self-awareness\n\nYou'll see how far you've come—and where the next truth lives.`,
        showContinue: true
      },
      {
        id: 'productivity_mode',
        title: '🏋️ Move with Alignment',
        content: `Action without alignment leads to burnout. Here, every task, goal, and habit is designed to feel like it came from within you.\n\nIn Productivity Mode, you will:\n\n• Set goals that reflect your rhythm\n• Build habits that nourish, not deplete\n• Stay focused in a way that works for your mind\n• Track progress that actually means something\n\nYou don't have to push. You get to move.`,
        showContinue: true
      },
      {
        id: 'companion_mode',
        title: '😊 Speak Freely',
        content: `In Companion Mode, you can:\n\n• Talk without editing yourself\n• Be celebrated and challenged with love\n• Ask deep questions and get deeper questions in return\n• Be reminded of what you've forgotten about yourself\n\nIf you're ever lost, just say so. That's where we begin again.`,
        showContinue: true
      },
      {
        id: 'dream_mode',
        title: `🌟 Dream Out Loud`,
        content: `What do you long to create, ${userName}?\n\nIn Dream Mode, you define your vision.\n\n• Speak your desires into existence\n• Receive gentle guidance to shape them\n• See your dreams transform into real, grounded journeys\n\nThis is your sacred "why." Your path begins here.`,
        showContinue: true
      },
      {
        id: 'growth_arena',
        title: '🏢 Create in Flow',
        content: `When it's time to do the work, you enter the Growth Arena.\n\nThis is your execution sanctuary, where clarity becomes action.\n\nInside, you'll find:\n\n• A writing space that helps you express your truth\n• A visual canvas to map your ideas\n• Guided processes to rewire beliefs or unlock direction\n\nEvery word, every move is supported. You're not doing this alone.`,
        showContinue: true
      },
      {
        id: 'resilience',
        title: '⚡ Bounce Back with Power',
        content: `You will stumble. We all do. That's when the real growth begins.\n\nWhen you hit a wall, SoulSync gently guides you through:\n\n• Feeling it fully\n• Seeing the deeper pattern\n• Reclaiming your voice\n• Realigning the plan so it fits you\n\nYou are never judged here. You are seen, supported, and always growing.`,
        showContinue: true
      },
      {
        id: 'final',
        title: `🚀 Begin, ${userName}`,
        content: `You came here for a reason. That reason matters.\n\nEvery step you take in this space is a step closer to who you've always been.\n\nLet's walk this path together.`,
        showContinue: false
      }
    ];

    console.log('🎓 Tutorial steps created:', steps.length);
    
    setTutorialState({
      isActive: true,
      currentStep: 0,
      steps,
      completed: false
    });

    console.log('🎓 Tutorial started with', steps.length, 'steps');
  }, [user]);

  // Continue to next step
  const continueTutorial = useCallback(() => {
    setTutorialState(prev => {
      if (prev.currentStep < prev.steps.length - 1) {
        return {
          ...prev,
          currentStep: prev.currentStep + 1
        };
      }
      return prev;
    });
  }, []);

  // Complete tutorial
  const completeTutorial = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      completed: true,
      isActive: false
    }));
    console.log('🎉 Tutorial completed');
  }, []);

  // Close tutorial
  const closeTutorial = useCallback(() => {
    setTutorialState({
      isActive: false,
      currentStep: 0,
      steps: [],
      completed: false
    });
  }, []);

  return {
    tutorialState,
    startTutorial,
    continueTutorial,
    completeTutorial,
    closeTutorial
  };
};