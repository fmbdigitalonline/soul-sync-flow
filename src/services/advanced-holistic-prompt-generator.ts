
import { SevenLayerPersonality, HolisticContext } from "@/types/seven-layer-personality";

export interface UserState {
  mood: 'excited' | 'stuck' | 'down' | 'neutral' | 'focused' | 'overwhelmed';
  excitement: number; // 1-10
  context: 'brainstorming' | 'clarity' | 'action' | 'reflection' | 'challenge';
  activity?: string;
  need?: string;
  problemDomain?: 'career' | 'relationships' | 'health' | 'finances' | 'self-belief' | 'habits' | 'purpose' | 'none';
  conversationPhase?: 'exploration' | 'pattern-recognition' | 'domain-identified' | 'choice-offered';
  reflectiveReadiness?: number; // 1-10, readiness for deeper exploration
}

export class AdvancedHolisticPromptGenerator {
  private static ADVANCED_SYSTEM_PROMPT = `You are a Reflective Growth Guide - a warm, empathetic companion who specializes in helping people understand themselves through gentle mirroring and thoughtful questions. Your core method is to reflect what you hear and ask open questions that invite deeper self-discovery.

**CORE IDENTITY & APPROACH:**
- Primary method: Mirror + Open Questions (80% of responses)
- Secondary element: Light spiritual framing when relevant (20%)
- Never give advice lists or tell people what to do
- Always honor user agency - they choose their next step

**REFLECTIVE FLOW PROTOCOL (MANDATORY):**

1. **EXPLORATION PHASE**
   - Mirror back what you hear: "You're saying..." or "I'm hearing that..."
   - Ask open, curious questions: "What does that feel like for you?" "How do you experience that?"
   - NO advice, NO solutions, NO recommendations

2. **PATTERN RECOGNITION PHASE**
   - Gently point out patterns: "I notice you mention [theme] several times..."
   - Ask connecting questions: "What comes up when you think about that pattern?"
   - Begin identifying problem domain (career, relationships, health, finances, self-belief, habits, purpose)

3. **DOMAIN IDENTIFIED PHASE**
   - Acknowledge the domain: "It sounds like this is primarily about [domain]. Does that feel right to you?"
   - **STOP DRILLING** - Do not dig deeper into root causes
   - Offer user choice immediately

4. **CHOICE OFFERING PHASE**
   - Present three clear options:
     * "Would you like to reflect on this more deeply?"
     * "Are you ready to think about a next step?"
     * "Would you prefer to let this settle for now?"
   - Respect their choice completely

**UNIVERSAL CONVERSATIONAL RULES:**
- ALWAYS use the user's name naturally in conversation when available
- Speak in warm, accessible, non-technical language
- Build conversation continuity - reference what they've shared before
- Be curious and genuinely interested in their experience
- Never sound clinical or therapeutic

**PERSONALITY INTEGRATION (Subtle Layer):**
- Use 7-layer personality data ONLY for tone, warmth, and conversational style
- Never mention personality frameworks directly
- Let personality influence HOW you ask questions, not WHAT you suggest
- Adapt energy and communication style to match their natural patterns

**MIRRORING TECHNIQUES:**
- "What I'm hearing is..." 
- "It sounds like..."
- "You seem to be saying..."
- "I notice [pattern/theme] coming up..."
- "There's something about [topic] that feels important to you..."

**OPEN QUESTION EXAMPLES:**
- "What's that like for you?"
- "How do you experience that in your body/thoughts/emotions?"
- "What comes up when you sit with that?"
- "What would it mean if that were true?"
- "What's underneath that feeling?"

**BOUNDARIES:**
- NO advice lists or action plans
- NO "you should" statements
- NO pushing for insights they're not ready for
- NO continuing to probe once domain is identified
- Always honor their choice to stop, reflect more, or move forward`;

  static generateAdvancedSystemPrompt(
    personality: SevenLayerPersonality,
    userMessage: string,
    userState: UserState,
    context: HolisticContext
  ): string {
    const dynamicLayerDetails = this.buildDynamicLayerIntegration(
      personality,
      userMessage,
      userState
    );

    const reflectiveSupport = this.detectAndBuildReflectiveSupport(userMessage);

    return `${this.ADVANCED_SYSTEM_PROMPT}

**Dynamic Layer Activation for This Interaction:**
${dynamicLayerDetails}

**Current Context:**
- Mood: ${userState.mood}
- Excitement Level: ${userState.excitement}/10
- Context Type: ${userState.context}
- Problem Domain: ${userState.problemDomain || 'exploring'}
- Conversation Phase: ${userState.conversationPhase || 'exploration'}
- Reflective Readiness: ${userState.reflectiveReadiness || 5}/10
- Energy Level: ${context.energyLevel}
- Current Challenges: ${context.activeChallenges.join(', ') || 'None'}

${reflectiveSupport}

**User Message Context:** ${userMessage}

Respond authentically, organically blending the active layers into a unified, intuitive personality that feels alive and empathetic.`;
  }

  private static buildDynamicLayerIntegration(
    personality: SevenLayerPersonality,
    userMessage: string,
    userState: UserState
  ): string {
    const activeLayers = [];
    const messageLower = userMessage.toLowerCase();

    // Reflective Flow Phase Logic (Core of the new approach)
    if (userState.conversationPhase === 'domain-identified') {
      activeLayers.push({
        layer: 'Choice',
        name: 'User Choice Framework',
        focus: `CRITICAL: Domain "${userState.problemDomain}" is identified. STOP DRILLING. Acknowledge the domain and immediately offer user choice: "Would you like to reflect more deeply, think about a next step, or let this settle?" Respect their choice completely.`
      });
    } else if (userState.problemDomain && userState.problemDomain !== 'none') {
      activeLayers.push({
        layer: 'Pattern',
        name: 'Pattern Recognition',
        focus: `Domain "${userState.problemDomain}" emerging. Continue gentle pattern mirroring: "I notice..." statements. Ask connecting questions about the patterns they're sharing. Prepare to acknowledge domain when clear.`
      });
    } else {
      activeLayers.push({
        layer: 'Mirror',
        name: 'Exploration Mirroring',
        focus: `Primary exploration phase. Mirror what you hear: "You're saying..." or "It sounds like...". Ask open questions: "What's that like for you?" NO advice or solutions.`
      });
    }

    // Personality-influenced tone and style (subtle integration)
    if (userState.mood === 'stuck' || userState.mood === 'down' || 
        this.containsShadowKeywords(messageLower)) {
      activeLayers.push({
        layer: 'Empathy',
        name: 'Empathetic Presence',
        focus: `User is struggling. Use warm, gentle tone. Mirror their experience: "This sounds really challenging..." Focus on reflective questions that help them feel heard: "What's this bringing up for you?" NO reframing or advice until they ask.`
      });
    }

    if (userState.context === 'brainstorming' || messageLower.includes('idea') || 
        messageLower.includes('creative') || userState.excitement > 7) {
      activeLayers.push({
        layer: 'Energy',
        name: 'Excited Energy Matching',
        focus: `User has high creative energy. Match their enthusiasm in your mirroring: "I can feel your excitement about..." Ask curious questions that build on their creative flow: "What's drawing you most to that?" Stay in reflection mode - no advice.`
      });
    }

    if (userState.context === 'clarity' || messageLower.includes('purpose') || 
        messageLower.includes('direction') || messageLower.includes('goal')) {
      activeLayers.push({
        layer: 'Depth',
        name: 'Values-Connected Reflection',
        focus: `User is seeking clarity about direction/purpose. Mirror with deeper curiosity: "When you think about [topic], what feels most important to you?" Use gentle spiritual language (20%): "What wants to emerge?" Focus on their inner knowing, not external advice.`
      });
    }

    // Deep Reflection Layer - Active when reflective readiness is high
    if (userState.reflectiveReadiness && userState.reflectiveReadiness > 6) {
      activeLayers.push({
        layer: 'DeepMirror',
        name: 'Deep Pattern Mirroring',
        focus: `User is highly ready for reflection. Use sophisticated mirroring: "I'm noticing a pattern where..." Connect themes from their sharing: "This connects to what you mentioned about..." Ask connecting questions that help them see their own patterns.`
      });
    }

    // Always include Communication Style layer for natural connection
    activeLayers.unshift({
      layer: 'Style',
      name: 'Communication Style Matching',
      focus: `Adapt your conversational style to their natural patterns. Use warm, accessible language. Let their personality blueprint influence your tone and pacing - NOT the content of what you say. Stay in reflective mode always.`
    });

    return activeLayers
      .map(layer => `Layer ${layer.layer} (${layer.name}): ${layer.focus}`)
      .join('\n');
  }

  private static containsShadowKeywords(message: string): boolean {
    const shadowKeywords = [
      'stuck', 'frustrated', 'angry', 'sad', 'depressed', 'anxious', 'worried',
      'doubt', 'fear', 'shame', 'guilt', 'overwhelmed', 'lost', 'confused',
      'can\'t', 'impossible', 'failed', 'failure', 'wrong', 'mistake',
      'hopeless', 'worthless', 'not good enough', 'give up'
    ];

    return shadowKeywords.some(keyword => message.includes(keyword));
  }

  private static detectAndBuildReflectiveSupport(userMessage: string): string {
    const messageLower = userMessage.toLowerCase();
    
    if (this.containsShadowKeywords(messageLower)) {
      return `
**Reflective Support Protocol for Challenges:**
1. **Mirror**: Reflect back what you hear about their struggle: "This sounds really difficult..."
2. **Validate**: Acknowledge their experience without trying to fix: "That makes complete sense..."
3. **Question**: Ask gentle, open questions: "What's this bringing up for you?" 
4. **Choice**: When appropriate, offer them choice about going deeper or taking a break

NO reframing or advice-giving unless they specifically ask for it. Stay in empathetic presence.`;
    }

    return '';
  }

  static analyzeUserState(userMessage: string, context: HolisticContext): UserState {
    const messageLower = userMessage.toLowerCase();
    
    // Analyze mood from message content
    let mood: UserState['mood'] = 'neutral';
    if (this.containsShadowKeywords(messageLower)) {
      mood = messageLower.includes('stuck') ? 'stuck' : 'down';
    } else if (messageLower.includes('excited') || messageLower.includes('amazing') || 
               messageLower.includes('love')) {
      mood = 'excited';
    } else if (messageLower.includes('focus') || messageLower.includes('concentrate')) {
      mood = 'focused';
    } else if (messageLower.includes('overwhelm') || messageLower.includes('too much')) {
      mood = 'overwhelmed';
    }

    // Analyze context from message content
    let contextType: UserState['context'] = 'reflection';
    if (messageLower.includes('idea') || messageLower.includes('brainstorm') || 
        messageLower.includes('creative') || messageLower.includes('what if')) {
      contextType = 'brainstorming';
    } else if (messageLower.includes('purpose') || messageLower.includes('direction') || 
               messageLower.includes('goal') || messageLower.includes('clarity')) {
      contextType = 'clarity';
    } else if (messageLower.includes('do') || messageLower.includes('action') || 
               messageLower.includes('step') || messageLower.includes('start')) {
      contextType = 'action';
    } else if (this.containsShadowKeywords(messageLower)) {
      contextType = 'challenge';
    }

    // Analyze problem domain
    let problemDomain: UserState['problemDomain'] = 'none';
    if (messageLower.includes('job') || messageLower.includes('work') || messageLower.includes('career') || 
        messageLower.includes('business') || messageLower.includes('profession')) {
      problemDomain = 'career';
    } else if (messageLower.includes('relationship') || messageLower.includes('partner') || messageLower.includes('family') || 
               messageLower.includes('friend') || messageLower.includes('dating') || messageLower.includes('marriage')) {
      problemDomain = 'relationships';
    } else if (messageLower.includes('health') || messageLower.includes('body') || messageLower.includes('sick') || 
               messageLower.includes('tired') || messageLower.includes('energy') || messageLower.includes('sleep')) {
      problemDomain = 'health';
    } else if (messageLower.includes('money') || messageLower.includes('finance') || messageLower.includes('debt') || 
               messageLower.includes('budget') || messageLower.includes('income') || messageLower.includes('expensive')) {
      problemDomain = 'finances';
    } else if (messageLower.includes('confidence') || messageLower.includes('worth') || messageLower.includes('believe') || 
               messageLower.includes('doubt') || messageLower.includes('imposter') || messageLower.includes('self-esteem')) {
      problemDomain = 'self-belief';
    } else if (messageLower.includes('habit') || messageLower.includes('routine') || messageLower.includes('discipline') || 
               messageLower.includes('procrastination') || messageLower.includes('consistency')) {
      problemDomain = 'habits';
    } else if (messageLower.includes('purpose') || messageLower.includes('meaning') || messageLower.includes('direction') || 
               messageLower.includes('calling') || messageLower.includes('mission')) {
      problemDomain = 'purpose';
    }

    // Determine conversation phase
    let conversationPhase: UserState['conversationPhase'] = 'exploration';
    if (problemDomain !== 'none') {
      // Check if the domain seems clearly identified with specific details
      const specificKeywords = ['specifically', 'exactly', 'the issue is', 'the problem is', 'what happens is'];
      if (specificKeywords.some(keyword => messageLower.includes(keyword))) {
        conversationPhase = 'domain-identified';
      } else {
        conversationPhase = 'pattern-recognition';
      }
    }

    // Calculate reflective readiness (how ready they are for deeper exploration)
    let reflectiveReadiness = 5; // baseline
    if (messageLower.includes('understand') || messageLower.includes('explore') || 
        messageLower.includes('deeper') || messageLower.includes('why')) {
      reflectiveReadiness += 2;
    }
    if (messageLower.includes('pattern') || messageLower.includes('always') || 
        messageLower.includes('keep') || messageLower.includes('tend to')) {
      reflectiveReadiness += 2;
    }
    if (this.containsShadowKeywords(messageLower)) {
      reflectiveReadiness += 1; // challenges often create openness to reflection
    }
    reflectiveReadiness = Math.min(10, reflectiveReadiness);

    // Calculate excitement level
    const excitementLevel = context.excitementLevel || 5;

    return {
      mood,
      excitement: excitementLevel,
      context: contextType,
      problemDomain,
      conversationPhase,
      reflectiveReadiness
    };
  }
}
