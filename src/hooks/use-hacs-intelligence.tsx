
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlueprintData } from "./use-blueprint-data";

interface HACSInsight {
  id: string;
  message: string;
  components: string[];
  priority: "low" | "medium" | "high";
  timestamp: Date;
}

interface HACSResponse {
  message: string;
  activeComponents: string[];
  insights?: HACSInsight[];
}

// HACS Component mappings
const HACS_COMPONENTS = {
  PIE: "Proactive Intelligence Engine",
  CNR: "Conflict & Needs Resolution",
  TMG: "Temporal Memory Graph", 
  DPEM: "Dynamic Personality Expression",
  ACS: "Adaptive Conversation System",
  NIK: "Neural Intent Kernel",
  CPSR: "Cognitive Pattern Recognition",
  TWS: "Temporal Wisdom Synthesis",
  HFME: "Framework Management Engine",
  BPSC: "Blueprint Sync & Calibration",
  RIS: "Real-time Intervention System"
} as const;

export const useHACSIntelligence = () => {
  const { user } = useAuth();
  const { blueprintData } = useBlueprintData();
  const [intelligenceLevel, setIntelligenceLevel] = useState(0);
  const [activeComponents, setActiveComponents] = useState<string[]>([]);
  const [currentInsight, setCurrentInsight] = useState<HACSInsight | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState<HACSInsight[]>([]);

  // Calculate intelligence level based on blueprint completeness
  const calculateIntelligenceLevel = useCallback(() => {
    if (!blueprintData) return 0;
    
    let completeness = 0;
    const frameworks = [
      blueprintData.cognition_mbti,
      blueprintData.energy_strategy_human_design, 
      blueprintData.values_life_path,
      blueprintData.archetype_western,
      blueprintData.archetype_chinese
    ];
    
    frameworks.forEach(framework => {
      if (framework && Object.keys(framework).length > 0) {
        completeness += 20;
      }
    });
    
    return Math.min(completeness, 100);
  }, [blueprintData]);

  // Determine active components based on user context
  const determineActiveComponents = useCallback(() => {
    const components: string[] = [];
    
    // Always active core components
    components.push("PIE", "DPEM", "ACS");
    
    if (blueprintData) {
      components.push("BPSC", "HFME");
      
      // Add components based on blueprint data
      if (blueprintData.cognition_mbti?.type && blueprintData.cognition_mbti.type !== 'Unknown') {
        components.push("CPSR");
      }
      
      if (blueprintData.values_life_path?.lifePathNumber) {
        components.push("TWS");
      }
      
      if (blueprintData.goal_stack && Object.keys(blueprintData.goal_stack).length > 0) {
        components.push("TMG", "NIK");
      }
    }
    
    // Add intervention system if intelligence level is high
    if (intelligenceLevel > 60) {
      components.push("RIS");
    }
    
    // Add conflict resolution if needed
    if (intelligenceLevel > 40) {
      components.push("CNR");
    }
    
    return components;
  }, [blueprintData, intelligenceLevel]);

  // Generate proactive insights
  const generateProactiveMessage = useCallback(() => {
    if (!user || activeComponents.length === 0) return null;
    
    const messages = [
      {
        components: ["PIE", "DPEM"],
        message: "I notice you're exploring your blueprint. Would you like me to help you understand how your personality traits work together?"
      },
      {
        components: ["TMG", "TWS"],
        message: "Based on your journey patterns, this might be a good time to review your goals. Want to explore what's most aligned right now?"
      },
      {
        components: ["CPSR", "CNR"],
        message: "I'm detecting some interesting patterns in how you approach challenges. Curious to learn more about your cognitive style?"
      },
      {
        components: ["HFME", "BPSC"],
        message: "Your personality frameworks are showing some unique combinations. Let me help you understand how they complement each other."
      },
      {
        components: ["NIK", "ACS"],
        message: "I'm learning more about your communication preferences. How would you like me to adapt my responses to better serve you?"
      }
    ];
    
    // Filter messages based on active components
    const relevantMessages = messages.filter(msg => 
      msg.components.some(comp => activeComponents.includes(comp))
    );
    
    if (relevantMessages.length === 0) return null;
    
    const selectedMessage = relevantMessages[Math.floor(Math.random() * relevantMessages.length)];
    
    return {
      id: Date.now().toString(),
      message: selectedMessage.message,
      components: selectedMessage.components,
      priority: "medium" as const,
      timestamp: new Date()
    };
  }, [user, activeComponents]);

  // Generate HACS response to user input
  const generateResponse = useCallback(async (userInput: string): Promise<HACSResponse> => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Determine which components should respond based on input
      const relevantComponents = [];
      const input = userInput.toLowerCase();
      
      if (input.includes("goal") || input.includes("dream") || input.includes("future")) {
        relevantComponents.push("TMG", "TWS", "NIK");
      }
      
      if (input.includes("personality") || input.includes("type") || input.includes("trait")) {
        relevantComponents.push("CPSR", "HFME", "BPSC");
      }
      
      if (input.includes("conflict") || input.includes("problem") || input.includes("help")) {
        relevantComponents.push("CNR", "RIS");
      }
      
      if (input.includes("understand") || input.includes("explain") || input.includes("how")) {
        relevantComponents.push("PIE", "DPEM");
      }
      
      // Default to core components if no specific match
      if (relevantComponents.length === 0) {
        relevantComponents.push("PIE", "ACS", "DPEM");
      }
      
      // Generate contextual response
      let response = "";
      
      if (relevantComponents.includes("TMG") || relevantComponents.includes("TWS")) {
        response = "Looking at your journey patterns and timing, I can see you're in a phase of exploration. ";
      } else if (relevantComponents.includes("CPSR") || relevantComponents.includes("HFME")) {
        response = "Your personality profile suggests a unique approach to this. ";
      } else if (relevantComponents.includes("CNR")) {
        response = "I understand you're facing a challenge. Let me help you work through this systematically. ";
      } else {
        response = "Based on my understanding of your blueprint and current context, ";
      }
      
      // Add personalized insights based on blueprint
      if (blueprintData?.cognition_mbti?.type && blueprintData.cognition_mbti.type !== 'Unknown') {
        response += `As an ${blueprintData.cognition_mbti.type}, you likely approach this with ${
          blueprintData.cognition_mbti.type.includes('E') ? 'external processing' : 'internal reflection'
        }. `;
      }
      
      response += "What specific aspect would you like to explore deeper?";
      
      return {
        message: response,
        activeComponents: relevantComponents.filter(comp => activeComponents.includes(comp))
      };
      
    } catch (error) {
      console.error("Error generating HACS response:", error);
      return {
        message: "I'm having trouble processing that right now. Could you help me understand what you're looking for?",
        activeComponents: ["CNR"]
      };
    } finally {
      setIsProcessing(false);
    }
  }, [activeComponents, blueprintData]);

  // Update intelligence level
  useEffect(() => {
    const level = calculateIntelligenceLevel();
    setIntelligenceLevel(level);
  }, [calculateIntelligenceLevel]);

  // Update active components
  useEffect(() => {
    const components = determineActiveComponents();
    setActiveComponents(components);
  }, [determineActiveComponents]);

  // Generate proactive insights periodically
  useEffect(() => {
    if (!user || activeComponents.length === 0) return;
    
    const generateInsight = () => {
      const insight = generateProactiveMessage();
      if (insight) {
        setCurrentInsight(insight);
        setInsights(prev => [insight, ...prev.slice(0, 9)]); // Keep last 10
      }
    };
    
    // Generate initial insight after delay
    const initialTimer = setTimeout(generateInsight, 5000);
    
    // Generate periodic insights
    const intervalTimer = setInterval(generateInsight, 30000 + Math.random() * 30000); // 30-60 seconds
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [user, activeComponents, generateProactiveMessage]);

  const componentNames = useMemo(() => {
    return activeComponents.map(comp => HACS_COMPONENTS[comp as keyof typeof HACS_COMPONENTS] || comp);
  }, [activeComponents]);

  return {
    intelligenceLevel,
    activeComponents,
    componentNames,
    currentInsight,
    insights,
    isProcessing,
    generateProactiveMessage,
    generateResponse
  };
};
